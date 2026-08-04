import { Injectable } from '@nestjs/common';
import { CreateBeneficiaireDto } from './dto/create-beneficiaire.dto';
import { UpdateBeneficiaireDto } from './dto/update-beneficiaire.dto';

@Injectable()
export class BeneficiaireService {
  create(_createBeneficiaireDto: CreateBeneficiaireDto) {
    return 'This action adds a new beneficiaire';
  }

  findAll() {
    return `This action returns all beneficiaire`;
  }

  findOne(id: number) {
    return `This action returns a #${id} beneficiaire`;
  }

  update(id: number, _updateBeneficiaireDto: UpdateBeneficiaireDto) {
    return `This action updates a #${id} beneficiaire`;
  }

  remove(id: number) {
    return `This action removes a #${id} beneficiaire`;
  }
}
