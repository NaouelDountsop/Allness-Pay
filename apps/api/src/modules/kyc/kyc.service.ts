import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateKycDto } from './dto/create-kyc.dto';
import { UpdateKycDto } from './dto/update-kyc.dto';
import { ReviewKycDto } from './dto/review-kyc.dto';
import { Kyc, KycStatus } from './entities/kyc.entity';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';

type CreateKycInput = CreateKycDto & {
  documentFrontUrl: string;
  documentBackUrl?: string;
  selfieUrl: string;
  proofOfAddressUrl: string;
};

@Injectable()
export class KycService {
  private readonly logger = new Logger(KycService.name);

  constructor(
    @InjectRepository(Kyc)
    private readonly kycRepository: Repository<Kyc>,
    private readonly mailService: MailService,
    private readonly usersService: UsersService,
  ) {}

  async create(createKycInput: CreateKycInput, userId: number) {
    const existing = await this.kycRepository.findOne({ where: { userId } });
    if (existing && existing.status !== KycStatus.REJECTED) {
      throw new BadRequestException(
        'Un dossier KYC est déjà en cours ou approuvé pour cet utilisateur.',
      );
    }

    const kyc = this.kycRepository.create({
      ...createKycInput,
      userId,
      status: KycStatus.PENDING,
    });
    const saved = await this.kycRepository.save(kyc);

    await this.notifyUser(userId, 'submitted');

    return saved;
  }

  findAll(status?: string) {
    if (status) {
      const validStatuses = Object.values(KycStatus);
      if (!validStatuses.includes(status as KycStatus)) {
        throw new BadRequestException(`Statut invalide. Valeurs autorisées : ${validStatuses.join(', ')}`);
      }
      return this.kycRepository.find({ where: { status: status as KycStatus }, order: { createdAt: 'DESC' } });
    }
    return this.kycRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number) {
    const kyc = await this.kycRepository.findOne({ where: { id } });
    if (!kyc) {
      throw new NotFoundException('Dossier KYC introuvable.');
    }
    return kyc;
  }

  async findOneForUser(id: number, userId: number) {
    const kyc = await this.findOne(id);
    if (kyc.userId !== userId) {
      throw new ForbiddenException('Accès non autorisé à ce dossier KYC.');
    }
    return kyc;
  }

  async findByUser(userId: number) {
    const kyc = await this.kycRepository.findOne({ where: { userId } });
    return kyc;
  }

  async update(id: number, updateKycDto: UpdateKycDto, userId: number) {
    const kyc = await this.findOne(id);

    if (kyc.userId !== userId) {
      throw new ForbiddenException('Accès non autorisé à ce dossier KYC.');
    }
    if (kyc.status !== KycStatus.PENDING && kyc.status !== KycStatus.REQUIRES_ADDITIONAL_INFO) {
      throw new BadRequestException('Impossible de modifier un dossier KYC déjà traité.');
    }

    Object.assign(kyc, updateKycDto);
    const saved = await this.kycRepository.save(kyc);

    if (kyc.status === KycStatus.REQUIRES_ADDITIONAL_INFO) {
      await this.notifyUser(userId, 'submitted');
    }

    return saved;
  }

  async review(id: number, reviewKycDto: ReviewKycDto, adminId: number) {
    const kyc = await this.findOne(id);

    if (kyc.status === KycStatus.APPROVED || kyc.status === KycStatus.REJECTED) {
      throw new BadRequestException('Ce dossier a déjà été traité.');
    }

    const previousStatus = kyc.status;
    kyc.status = reviewKycDto.status as unknown as KycStatus;
    kyc.reviewComment = reviewKycDto.reviewComment;
    kyc.verifiedBy = adminId;
    kyc.verifiedAt = new Date();

    const saved = await this.kycRepository.save(kyc);

    await this.notifyUser(kyc.userId, 'review', {
      previousStatus,
      newStatus: saved.status,
      reviewComment: saved.reviewComment,
    });

    return {
      status: saved.status,
      reviewComment: saved.reviewComment,
    };
  }

  async remove(id: number, userId: number) {
    const kyc = await this.findOne(id);
    if (kyc.userId !== userId) {
      throw new ForbiddenException('Accès non autorisé à ce dossier KYC.');
    }
    return this.kycRepository.remove(kyc);
  }

  private async notifyUser(
    userId: number,
    event: 'submitted' | 'review',
    details?: {
      previousStatus?: string;
      newStatus?: string;
      reviewComment?: string;
    },
  ) {
    try {
      const user = await this.usersService.findOne(userId);
      if (!user?.email) {
        this.logger.warn(`Utilisateur ${userId} introuvable ou sans email pour notification KYC`);
        return;
      }

      const firstName = user.prenom || 'Utilisateur';

      if (event === 'submitted') {
        await this.mailService.sendKycSubmitted(user.email, firstName);
        return;
      }

      if (event === 'review' && details?.newStatus) {
        switch (details.newStatus) {
          case KycStatus.UNDER_REVIEW:
            await this.mailService.sendKycUnderReview(user.email, firstName);
            break;
          case KycStatus.APPROVED:
            await this.mailService.sendKycApproved(user.email, firstName);
            break;
          case KycStatus.REJECTED:
            await this.mailService.sendKycRejected(
              user.email,
              firstName,
              details.reviewComment,
            );
            break;
          case KycStatus.REQUIRES_ADDITIONAL_INFO:
            await this.mailService.sendKycRequiresInfo(
              user.email,
              firstName,
              details.reviewComment,
            );
            break;
        }
      }
    } catch (err) {
      this.logger.error(`Échec envoi notification KYC pour l'utilisateur ${userId}`, err);
    }
  }
}
