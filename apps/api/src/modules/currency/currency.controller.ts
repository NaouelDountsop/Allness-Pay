import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto';
import { UpdateExchangeRateDto } from './dto/update-exchange-rate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Currencies')
@Controller('currencies')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get()
  findAllCurrencies() {
    return this.currencyService.findAllCurrencies();
  }

  @Get(':code')
  findCurrencyByCode(@Param('code') code: string) {
    return this.currencyService.findCurrencyByCode(code);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post()
  createCurrency(@Body() dto: CreateCurrencyDto) {
    return this.currencyService.createCurrency(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Patch(':code')
  updateCurrency(@Param('code') code: string, @Body() dto: UpdateCurrencyDto) {
    return this.currencyService.updateCurrency(code, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Delete(':code')
  deleteCurrency(@Param('code') code: string) {
    return this.currencyService.deleteCurrency(code);
  }

  // ─── Exchange Rates ─────────────────────────────────────────────

  @Get('exchange-rates/all')
  findAllExchangeRates() {
    return this.currencyService.findAllExchangeRates();
  }

  @Get('exchange-rate/:from/:to')
  findExchangeRate(
    @Param('from') from: string,
    @Param('to') to: string,
  ) {
    return this.currencyService.findExchangeRate(from, to);
  }

  @Get('convert')
  convertAmount(
    @Query('amount') amount: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.currencyService.convertAmount(parseFloat(amount), from, to);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('exchange-rate')
  createExchangeRate(@Body() dto: CreateExchangeRateDto) {
    return this.currencyService.createExchangeRate(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Patch('exchange-rate/:from/:to')
  updateExchangeRate(
    @Param('from') from: string,
    @Param('to') to: string,
    @Body() dto: UpdateExchangeRateDto,
  ) {
    return this.currencyService.updateExchangeRate(from, to, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Delete('exchange-rate/:from/:to')
  deleteExchangeRate(
    @Param('from') from: string,
    @Param('to') to: string,
  ) {
    return this.currencyService.deleteExchangeRate(from, to);
  }
}
