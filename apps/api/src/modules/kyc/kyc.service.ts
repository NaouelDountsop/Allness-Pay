import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateKycDto } from './dto/create-kyc.dto';
import { UpdateKycDto } from './dto/update-kyc.dto';
import { ReviewKycDto } from './dto/review-kyc.dto';
import { Kyc, KycStatus } from './entities/kyc.entity';

type CreateKycInput = CreateKycDto & {
  documentFrontUrl: string;
  documentBackUrl?: string;
  selfieUrl: string;
  proofOfAddressUrl: string;
};

@Injectable()
export class KycService {
  constructor(
    @InjectRepository(Kyc)
    private readonly kycRepository: Repository<Kyc>,
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
    return this.kycRepository.save(kyc);
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
    if (kyc.status !== KycStatus.PENDING) {
      throw new BadRequestException('Impossible de modifier un dossier KYC déjà traité.');
    }

    Object.assign(kyc, updateKycDto);
    return this.kycRepository.save(kyc);
  }

  async review(id: number, reviewKycDto: ReviewKycDto, adminId: number) {
    const kyc = await this.findOne(id);

    if (kyc.status !== KycStatus.PENDING) {
      throw new BadRequestException('Ce dossier a déjà été traité.');
    }

    kyc.status = reviewKycDto.status as unknown as KycStatus;
    kyc.reviewComment = reviewKycDto.reviewComment;
    kyc.verifiedBy = adminId;
    kyc.verifiedAt = new Date();

    const saved = await this.kycRepository.save(kyc);

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
}