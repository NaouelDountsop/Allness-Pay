import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Beneficiaire } from './entities/beneficiaire.entity';
import { User } from '../users/entities/user.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { CreateBeneficiaireDto } from './dto/create-beneficiaire.dto';
import { UpdateBeneficiaireDto } from './dto/update-beneficiaire.dto';
import {
  FilterBeneficiaireDto,
  StatutBeneficiaire,
} from './dto/filter-beneficiaire.dto';

@Injectable()
export class BeneficiairesService {
  constructor(
    @InjectRepository(Beneficiaire)
    private readonly beneficiaireRepository: Repository<Beneficiaire>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
  ) {}

  async create(
    ownerId: number,
    dto: CreateBeneficiaireDto,
  ) {
    const existant = await this.beneficiaireRepository.findOne({
      where: { ownerId, numero: dto.numero },
    });

    if (existant) {
      throw new ConflictException(
        'Ce numéro est déjà enregistré comme bénéficiaire',
      );
    }

    const beneficiaire = this.beneficiaireRepository.create({
      ...dto,
      ownerId,
    });

    const saved = await this.beneficiaireRepository.save(beneficiaire);
    return saved.toApi();
  }

  async findAll(ownerId: number, filtre: FilterBeneficiaireDto) {
    const query = this.beneficiaireRepository
      .createQueryBuilder('beneficiaire')
      .leftJoin(Wallet, 'wallet', 'wallet.walletNumber = beneficiaire.numero')
      .where('beneficiaire.owner_id = :ownerId', { ownerId });

    if (filtre.recherche) {
      query.andWhere(
        '(beneficiaire.nom ILIKE :recherche OR beneficiaire.numero ILIKE :recherche)',
        { recherche: `%${filtre.recherche}%` },
      );
    }

    if (filtre.statut === StatutBeneficiaire.VERIFIE) {
      query.andWhere('beneficiaire.verifie = true');
    } else if (filtre.statut === StatutBeneficiaire.NON_VERIFIE) {
      query.andWhere('beneficiaire.verifie = false');
    }

    if (filtre.reseau) {
      query.andWhere('beneficiaire.reseau = :reseau', {
        reseau: filtre.reseau,
      });
    }

    if (filtre.pays) {
      query.andWhere('beneficiaire.pays = :pays', { pays: filtre.pays });
    }

    const page = filtre.page ?? 1;
    const limite = filtre.limite ?? 10;

    query
      .select(['beneficiaire'])
      .orderBy('beneficiaire.createdAt', 'DESC')
      .skip((page - 1) * limite)
      .take(limite);

    const [data, total] = await query.getManyAndCount();

    const numeros = data.map((b) => b.numero);
    const wallets = await this.walletRepository
      .createQueryBuilder('wallet')
      .select(['wallet.walletNumber', 'wallet.currency'])
      .where('wallet.walletNumber IN (:...numeros)', { numeros })
      .getMany();

    const walletCurrencyMap = new Map(wallets.map((w) => [w.walletNumber, w.currency]));

    return {
      data: data.map((b) => {
        const api = b.toApi();
        const walletCurrency = walletCurrencyMap.get(b.numero);
        if (walletCurrency) api.currency = walletCurrency;
        return api;
      }),
      total,
      page,
      limite,
      totalPages: Math.max(1, Math.ceil(total / limite)),
    };
  }

  async findOne(ownerId: number, id: string) {
    const beneficiaire = await this.beneficiaireRepository.findOne({
      where: { id, ownerId },
    });

    if (!beneficiaire) {
      throw new NotFoundException('Bénéficiaire introuvable');
    }

    return beneficiaire.toApi();
  }

  async update(
    ownerId: number,
    id: string,
    dto: UpdateBeneficiaireDto,
  ) {
    const beneficiaire = await this.beneficiaireRepository.findOne({
      where: { id, ownerId },
    });

    if (!beneficiaire) {
      throw new NotFoundException('Bénéficiaire introuvable');
    }

    Object.assign(beneficiaire, dto);
    const saved = await this.beneficiaireRepository.save(beneficiaire);
    return saved.toApi();
  }

  async remove(ownerId: number, id: string): Promise<void> {
    const beneficiaire = await this.beneficiaireRepository.findOne({
      where: { id, ownerId },
    });

    if (!beneficiaire) {
      throw new NotFoundException('Bénéficiaire introuvable');
    }

    await this.beneficiaireRepository.remove(beneficiaire);
  }

  async toggleFavori(ownerId: number, id: string) {
    const beneficiaire = await this.beneficiaireRepository.findOne({
      where: { id, ownerId },
    });

    if (!beneficiaire) {
      throw new NotFoundException('Bénéficiaire introuvable');
    }

    beneficiaire.favori = !beneficiaire.favori;
    const saved = await this.beneficiaireRepository.save(beneficiaire);
    return saved.toApi();
  }

  async searchUser(query: string) {
    const rows = await this.userRepository
      .createQueryBuilder('user')
      .innerJoin(Wallet, 'wallet', 'wallet.userId = user.idutilisateur AND wallet.status = :status', { status: 'active' })
      .where(
        '(user.email ILIKE :q OR user.telephone ILIKE :q OR wallet.walletNumber ILIKE :q)',
        { q: `%${query}%` },
      )
      .select([
        'user.nom AS nom',
        'user.prenom AS prenom',
        'wallet.walletNumber AS "walletNumber"',
        'wallet.currency AS currency',
      ])
      .limit(5)
      .getRawMany();

    return rows.map((r) => ({
      name: `${r.prenom} ${r.nom}`,
      walletNumber: r.walletNumber,
      currency: r.currency,
    }));
  }

  /**
   * Alimente les 4 cartes du haut du module : total, vérifiés, transferts
   * du mois (à combiner avec le module transferts), favoris.
   */
  async getStats(ownerId: number) {
    const total = await this.beneficiaireRepository.count({
      where: { ownerId },
    });
    const verifies = await this.beneficiaireRepository.count({
      where: { ownerId, verifie: true },
    });
    const favoris = await this.beneficiaireRepository.count({
      where: { ownerId, favori: true },
    });

    return {
      total,
      verifies,
      pourcentageVerifies: total > 0 ? Math.round((verifies / total) * 100) : 0,
      favoris,
    };
  }
}