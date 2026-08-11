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
import { ApiConsumes, ApiBody, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UploadedFile } from '../../common/interfaces/uploaded-file.interface';
import { KycService } from './kyc.service';
import { CreateKycDto } from './dto/create-kyc.dto';
import { UpdateKycDto } from './dto/update-kyc.dto';
import { ReviewKycDto } from './dto/review-kyc.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../role/guards/permissions.guards';
import { RequirePermissions } from '../role/decorators/permissions.decorator';
import { kycMulterConfig } from '../../common/config/multer.config';
import { buildPublicFileUrl } from '../../common/utils/upload-url.util';
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
    const user = req.user as { sub: number };

    if (!files.documentFront?.[0] || !files.selfie?.[0] || !files.proofOfAddress?.[0]) {
      throw new BadRequestException(
        "Le document d'identité, le selfie et le justificatif de domicile sont obligatoires.",
      );
    }

    const documentFrontUrl = buildPublicFileUrl(req, files.documentFront[0].filename, 'kyc');
    const documentBackUrl = files.documentBack?.[0]
      ? buildPublicFileUrl(req, files.documentBack[0].filename, 'kyc')
      : undefined;
    const selfieUrl = buildPublicFileUrl(req, files.selfie[0].filename, 'kyc');
    const proofOfAddressUrl = buildPublicFileUrl(req, files.proofOfAddress[0].filename, 'kyc');

    return this.kycService.create(
      {
        ...createKycDto,
        documentFrontUrl,
        documentBackUrl,
        selfieUrl,
        proofOfAddressUrl,
      },
      user.sub,
    );
  }

  // Doit être déclaré AVANT ':id'
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  findMine(@Req() req: Request) {
    const user = req.user as { sub: number };
    return this.kycService.findByUser(user.sub);
  }

  // Routes admin : restreintes aux administrateurs avec la permission kyc:review
  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('kyc:review')
  @ApiBearerAuth('access-token')
  findAll(@Query('status') status?: string) {
    return this.kycService.findAll(status);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('kyc:review')
  @ApiBearerAuth('access-token')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.kycService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateKycDto: UpdateKycDto,
    @Req() req: Request,
  ) {
    const user = req.user as { sub: number };
    return this.kycService.update(id, updateKycDto, user.sub);
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
  //@ApiBearerAuth('access-token')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req.user as { sub: number };
    return this.kycService.remove(id, user.sub);
  }
}
