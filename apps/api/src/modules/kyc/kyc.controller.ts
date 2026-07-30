import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request as Req,
  UseInterceptors,
  UploadedFiles,
  Get,
  Param,
  Patch,
  Delete,
  Query,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';
import { UploadedFile } from '../../common/interfaces/uploaded-file.interface';
import { KycService } from './kyc.service';
import { CreateKycDto } from './dto/create-kyc.dto';
import { UpdateKycDto } from './dto/update-kyc.dto';
import { ReviewKycDto } from './dto/review-kyc.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../role/guards/permissions.guards';
import { RequirePermissions } from '../role/decorators/permissions.decorator';
import { kycMulterConfig } from '../../common/config/multer.config';
import { Request } from 'express';

@ApiTags('kyc')
@Controller('kyc')
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')

@ApiBody({
  schema: {
    type: 'object',
    required: [
      'IdentityDocumentType',
      'proofOfAddressType',
      'documentFront',
      'selfie',
      'proofOfAddress',
    ],
    properties: {
      IdentityDocumentType: {
        type: 'string',
        enum: ['NATIONAL_ID', 'PASSPORT', 'DRIVER_LICENSE'],
      },
      documentFront: { type: 'string', format: 'binary' },
      documentBack: { type: 'string', format: 'binary' },
      selfie: { type: 'string', format: 'binary' },
      proofOfAddressType: {
        type: 'string',
        enum: ['UTILITY_BILL', 'BANK_STATEMENT', 'RESIDENCE_CERTIFICATE'],
      },
      proofOfAddress: { type: 'string', format: 'binary' },
    },
  },
})

  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'documentFront', maxCount: 1 },
        { name: 'documentBack', maxCount: 1 },
        { name: 'selfie', maxCount: 1 },
        { name: 'proofOfAddress', maxCount: 1 },
      ],
      kycMulterConfig,
    ),
  )
  create(
    @Body() createKycDto: CreateKycDto,
    @UploadedFiles()
    files: {
      documentFront?: UploadedFile[];
      documentBack?: UploadedFile[];
      selfie?: UploadedFile[];
      proofOfAddress?: UploadedFile[];
    },
    @Req() req: Request,
  ) {
    const user = req.user as { idutilisateur: number };

    if (
      !files.documentFront?.[0] ||
      !files.selfie?.[0] ||
      !files.proofOfAddress?.[0]
    ) {
      throw new BadRequestException(
        "Le document d'identité, le selfie et le justificatif de domicile sont obligatoires.",
      );
    }

    const documentFrontUrl = `/uploads/kyc/${files.documentFront[0].filename}`;
    const documentBackUrl = files.documentBack?.[0]
      ? `/uploads/kyc/${files.documentBack[0].filename}`
      : undefined;
    const selfieUrl = `/uploads/kyc/${files.selfie[0].filename}`;
    const proofOfAddressUrl = `/uploads/kyc/${files.proofOfAddress[0].filename}`;

    return this.kycService.create(
      {
        ...createKycDto,
        documentFrontUrl,
        documentBackUrl,
        selfieUrl,
        proofOfAddressUrl,
      },
      user.idutilisateur,
    );
  }

  // Doit être déclaré AVANT ':id'
  // @Get('me')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth('access-token')
  // findMine(@Req() req: Request) {
  //   const user = req.user as { idutilisateur: number };
  //   return this.kycService.findByUser(user.idutilisateur);
  // }

  // Routes admin : restreintes aux administrateurs avec la permission kyc:review
  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('kyc:review')
  @ApiBearerAuth('access-token')
  findAll(@Query('status') status?: string) {
    return this.kycService.findAll(status);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req.user as { idutilisateur: number };
    return this.kycService.findOneForUser(id, user.idutilisateur);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateKycDto: UpdateKycDto,
    @Req() req: Request,
  ) {
    const user = req.user as { idutilisateur: number };
    return this.kycService.update(id, updateKycDto, user.idutilisateur);
  }

  @Patch(':id/review')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('kyc:review')
  @ApiBearerAuth('access-token')
  review(
    @Param('id', ParseIntPipe) id: number,
    @Body() reviewKycDto: ReviewKycDto,
    @Req() req: Request,
  ) {
    const admin = req.user as { id: number };
    return this.kycService.review(id, reviewKycDto, admin.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req.user as { idutilisateur: number };
    return this.kycService.remove(id, user.idutilisateur);
  }
}