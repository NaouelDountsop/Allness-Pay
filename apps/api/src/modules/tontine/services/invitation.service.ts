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
import { Tontine, TontineStatus } from '../entities/tontine.entity';
import { CreateInvitationDto } from '../dto/create-invitation.dto';
import { InvitationResponse, RespondInvitationDto } from '../dto/respond-invitation.dto';
import { TontineMemberRole } from '../enums/tontine-member-role.enum';
import { TontineMemberStatus } from '../enums/tontine-member-status.enum';
import { MailService } from '../../mail/mail.service';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class InvitationService {
  constructor(
    @InjectRepository(TontineInvitation)
    private readonly invitationRepo: Repository<TontineInvitation>,
    @InjectRepository(TontineMember)
    private readonly memberRepo: Repository<TontineMember>,
    @InjectRepository(Tontine)
    private readonly tontineRepo: Repository<Tontine>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly mailService: MailService,
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
    });
    if (!tontine) {
      throw new NotFoundException('Tontine introuvable');
    }

    const members = await this.memberRepo.find({
      where: { tontineId },
    });

    const isAdmin = members.some(
      (m) => m.userId === inviterUserId && m.role === TontineMemberRole.ADMIN,
    );
    if (!isAdmin) {
      throw new ForbiddenException('Seul un admin peut envoyer des invitations');
    }

    if (tontine.status !== TontineStatus.DRAFT) {
      throw new BadRequestException("On ne peut inviter qu'une tontine en DRAFT");
    }

    if (dto.inviteeUserId) {
      const alreadyMember = members.some(
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

    const saved = await this.invitationRepo.save(invitation);

    if (dto.inviteeEmail) {
      const inviter = await this.userRepo.findOne({ where: { idutilisateur: inviterUserId } });
      const inviterName = inviter ? `${inviter.prenom} ${inviter.nom}` : 'Un membre';
      await this.mailService.sendTontineInvitation(
        dto.inviteeEmail,
        inviterName,
        tontine.name,
        token,
      );
    }

    return saved;
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

    if (!invitation.inviteeUserId) {
      invitation.inviteeUserId = userId;
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
    });
    if (!tontine) {
      throw new NotFoundException('Tontine introuvable');
    }

    const activeCount = await this.memberRepo.count({
      where: { tontineId: invitation.tontineId, status: TontineMemberStatus.ACTIVE },
    });
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
    });
  }

  async findPendingByUserId(userId: number): Promise<TontineInvitation[]> {
    const user = await this.userRepo.findOne({ where: { idutilisateur: userId } });
    const email = user?.email;

    const byUserId = await this.invitationRepo.find({
      where: { inviteeUserId: userId, status: 'PENDING' },
      order: { createdAt: 'DESC' },
    });

    if (!email) return byUserId;

    const byEmail = await this.invitationRepo.find({
      where: { inviteeEmail: email, status: 'PENDING' },
      order: { createdAt: 'DESC' },
    });

    const all = [...byUserId, ...byEmail];
    const seen = new Set<string>();
    return all.filter((inv) => {
      if (seen.has(inv.id)) return false;
      seen.add(inv.id);
      return true;
    });
  }

  async findByToken(token: string): Promise<TontineInvitation | null> {
    return this.invitationRepo.findOne({ where: { token } });
  }
  async acceptByToken(token: string, userId: number): Promise<TontineMember> {
    const invitation = await this.findByToken(token);
    if (!invitation) {
      throw new NotFoundException('Invitation introuvable');
    }

    // Idempotence : si cette invitation a déjà été acceptée (double appel,
    // double-clic, remount frontend...) et que l'utilisateur est déjà
    // membre actif, on renvoie le membre existant au lieu d'une erreur.
    if (invitation.status === 'ACCEPTED') {
      const existingMember = await this.memberRepo.findOne({
        where: {
          tontineId: invitation.tontineId,
          userId,
          status: TontineMemberStatus.ACTIVE,
        },
      });
      if (existingMember) {
        return existingMember;
      }
      // Invitation acceptée mais pas par cet utilisateur / pas de membre actif trouvé
      throw new BadRequestException('Cette invitation a déjà été traitée');
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

    const tontine = await this.tontineRepo.findOne({
      where: { id: invitation.tontineId },
    });
    if (!tontine) {
      throw new NotFoundException('Tontine introuvable');
    }

    const members = await this.memberRepo.find({
      where: { tontineId: invitation.tontineId },
    });
    const alreadyMember = members.some(
      (m) => m.userId === userId && m.status !== TontineMemberStatus.REMOVED,
    );
    if (alreadyMember) {
      throw new BadRequestException('Vous êtes déjà membre de cette tontine');
    }

    const activeCount = members.filter((m) => m.status === TontineMemberStatus.ACTIVE).length;
    if (activeCount >= tontine.memberLimit) {
      throw new BadRequestException('La tontine est pleine');
    }

    invitation.status = 'ACCEPTED';
    await this.invitationRepo.save(invitation);

    const member = this.memberRepo.create({
      tontineId: invitation.tontineId,
      userId,
      role: TontineMemberRole.MEMBER,
      status: TontineMemberStatus.ACTIVE,
    });

    return this.memberRepo.save(member);
  }
}
