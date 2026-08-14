import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Beneficiaire } from './entities/beneficiaire.entity';
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
      .orderBy('beneficiaire.createdAt', 'DESC')
      .skip((page - 1) * limite)
      .take(limite);

    const [data, total] = await query.getManyAndCount();

    return {
      data: data.map((b) => b.toApi()),
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