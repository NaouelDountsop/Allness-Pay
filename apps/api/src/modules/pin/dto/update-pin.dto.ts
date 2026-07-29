import { PartialType } from '@nestjs/swagger';
import { CreatePinDto } from './pin.dto';

export class UpdatePinDto extends PartialType(CreatePinDto) {}
