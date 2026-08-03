import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'node:crypto';
import { TontineInvitation } from '../entities/tontine-invitation.entity';
import { TontineMember } from '../entities/tontine-member.entity';
import { Tontine } from '../entities/tontine.entity';
import { CreateInvitationDto } from '../dto/create-invitation.dto';
import { InvitationResponse, RespondInvitationDto } from '../dto/respond-invitation.dto';
import { TontineMemberRole } from '../enums/tontine-member-role.enum';
import { TontineMemberStatus } from '../enums/tontine-member-status.enum';
import { TontineStatus } from '../enums/tontine-status.enum';

@Injectable()
export class InvitationService {
  constructor(
    @InjectRepository(TontineInvitation)
    private readonly invitationRepo: Repository<TontineInvitation>,
    @InjectRepository(TontineMember)
    private readonly memberRepo: Repository<TontineMember>,
    @InjectRepository(Tontine)
    private readonly tontineRepo: Repository<Tontine>,
  ) {}

  async create(
    tontineId: string,
    inviterUserId: number,
    dto: CreateInvitationDto,
  ): Promise<TontineInvitation> {
    if (!dto.inviteeUserId && !dto.inviteeEmail) {
      throw new BadRequestException('Un destinataire (userId ou email) est requis');
    }

    const tontine = await this.tontineRepo.findOne({
      where: { id: tontineId },
      relations: ['members'],
    });
    if (!tontine) {
      throw new NotFoundException('Tontine introuvable');
    }

    const isAdmin = tontine.members?.some(
      (m) => m.userId === inviterUserId && m.role === TontineMemberRole.ADMIN,
    );
    if (!isAdmin) {
      throw new ForbiddenException('Seul un admin peut envoyer des invitations');
    }

    if (tontine.status !== TontineStatus.DRAFT) {
      throw new BadRequestException('On ne peut inviter qu\'une tontine en DRAFT');
    }

    if (dto.inviteeUserId) {
      const alreadyMember = tontine.members?.some(
        (m) => m.userId === dto.inviteeUserId && m.status !== TontineMemberStatus.REMOVED,
      );
      if (alreadyMember) {
        throw new BadRequestException('Cet utilisateur est déjà membre');
      }
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = this.invitationRepo.create({
      tontineId,
      inviterUserId,
      inviteeUserId: dto.inviteeUserId,
      inviteeEmail: dto.inviteeEmail,
      token,
      status: 'PENDING',
      expiresAt,
    });

    return this.invitationRepo.save(invitation);
  }

  async respond(
    invitationId: string,
    userId: number,
    dto: RespondInvitationDto,
  ): Promise<TontineMember | null> {
    const invitation = await this.invitationRepo.findOne({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation introuvable');
    }

    if (invitation.status !== 'PENDING') {
      throw new BadRequestException('Cette invitation a déjà été traitée');
    }

    if (invitation.expiresAt < new Date()) {
      invitation.status = 'EXPIRED';
      await this.invitationRepo.save(invitation);
      throw new BadRequestException('Cette invitation a expiré');
    }

    if (invitation.inviteeUserId && invitation.inviteeUserId !== userId) {
      throw new ForbiddenException('Cette invitation ne vous est pas destinée');
    }

    if (dto.response === InvitationResponse.DECLINE) {
      invitation.status = 'DECLINED';
      await this.invitationRepo.save(invitation);
      return null;
    }

    invitation.status = 'ACCEPTED';
    await this.invitationRepo.save(invitation);

    const tontine = await this.tontineRepo.findOne({
      where: { id: invitation.tontineId },
      relations: ['members'],
    });
    if (!tontine) {
      throw new NotFoundException('Tontine introuvable');
    }

    const activeCount = tontine.members?.filter(
      (m) => m.status === TontineMemberStatus.ACTIVE,
    ).length ?? 0;
    if (activeCount >= tontine.memberLimit) {
      throw new BadRequestException('La tontine est pleine');
    }

    const member = this.memberRepo.create({
      tontineId: invitation.tontineId,
      userId,
      role: TontineMemberRole.MEMBER,
      status: TontineMemberStatus.ACTIVE,
    });

    return this.memberRepo.save(member);
  }

  async findByTontine(tontineId: string): Promise<TontineInvitation[]> {
    return this.invitationRepo.find({
      where: { tontineId },
      order: { createdAt: 'DESC' },
    });
  }

  async findPendingByEmail(email: string): Promise<TontineInvitation[]> {
    return this.invitationRepo.find({
      where: { inviteeEmail: email, status: 'PENDING' },
      relations: ['tontine'],
    });
  }
}
