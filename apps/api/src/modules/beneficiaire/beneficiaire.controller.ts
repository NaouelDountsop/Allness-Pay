import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BeneficiaireService } from './beneficiaire.service';
import { CreateBeneficiaireDto } from './dto/create-beneficiaire.dto';
import { UpdateBeneficiaireDto } from './dto/update-beneficiaire.dto';

@Controller('beneficiaire')
export class BeneficiaireController {
  constructor(private readonly beneficiaireService: BeneficiaireService) {}

  @Post()
  create(@Body() createBeneficiaireDto: CreateBeneficiaireDto) {
    return this.beneficiaireService.create(createBeneficiaireDto);
  }

  @Get()
  findAll() {
    return this.beneficiaireService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.beneficiaireService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBeneficiaireDto: UpdateBeneficiaireDto) {
    return this.beneficiaireService.update(+id, updateBeneficiaireDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.beneficiaireService.remove(+id);
  }
}
