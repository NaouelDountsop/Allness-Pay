import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Currency } from './entities/currency.entity';
import { ExchangeRate } from './entities/exchange-rate.entity';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto';
import { UpdateExchangeRateDto } from './dto/update-exchange-rate.dto';

@Injectable()
export class CurrencyService {
  constructor(
    @InjectRepository(Currency)
    private readonly currencyRepo: Repository<Currency>,
    @InjectRepository(ExchangeRate)
    private readonly exchangeRateRepo: Repository<ExchangeRate>,
  ) {}

  // ─── Currency CRUD ────────────────────────────────────────────────

  async createCurrency(dto: CreateCurrencyDto): Promise<Currency> {
    const existing = await this.currencyRepo.findOne({
      where: { code: dto.code.toUpperCase() },
    });
    if (existing) {
      throw new ConflictException(`La devise ${dto.code} existe déjà`);
    }

    const currency = this.currencyRepo.create({
      ...dto,
      code: dto.code.toUpperCase(),
    });
    return this.currencyRepo.save(currency);
  }

  async findAllCurrencies(): Promise<Currency[]> {
    return this.currencyRepo.find({
      where: { isActive: true },
      order: { code: 'ASC' },
    });
  }

  async findCurrencyByCode(code: string): Promise<Currency> {
    const currency = await this.currencyRepo.findOne({
      where: { code: code.toUpperCase() },
    });
    if (!currency) {
      throw new NotFoundException(`Devise ${code} introuvable`);
    }
    return currency;
  }

  async updateCurrency(code: string, dto: UpdateCurrencyDto): Promise<Currency> {
    const currency = await this.findCurrencyByCode(code);
    Object.assign(currency, dto);
    return this.currencyRepo.save(currency);
  }

  async deleteCurrency(code: string): Promise<void> {
    const currency = await this.findCurrencyByCode(code);
    currency.isActive = false;
    await this.currencyRepo.save(currency);
  }

  // ─── Exchange Rate CRUD ───────────────────────────────────────────

  async createExchangeRate(dto: CreateExchangeRateDto): Promise<ExchangeRate> {
    const fromCode = dto.fromCurrencyCode.toUpperCase();
    const toCode = dto.toCurrencyCode.toUpperCase();

    if (fromCode === toCode) {
      throw new BadRequestException('Les devises source et cible doivent être différentes');
    }

    await this.findCurrencyByCode(fromCode);
    await this.findCurrencyByCode(toCode);

    const existing = await this.exchangeRateRepo.findOne({
      where: { fromCurrencyCode: fromCode, toCurrencyCode: toCode },
    });
    if (existing) {
      throw new ConflictException(
        `Le taux de change ${fromCode} → ${toCode} existe déjà`,
      );
    }

    const rate = this.exchangeRateRepo.create({
      ...dto,
      fromCurrencyCode: fromCode,
      toCurrencyCode: toCode,
    });
    return this.exchangeRateRepo.save(rate);
  }

  async findAllExchangeRates(): Promise<ExchangeRate[]> {
    return this.exchangeRateRepo.find({
      where: { isActive: true },
      relations: ['fromCurrency', 'toCurrency'],
      order: { fromCurrencyCode: 'ASC', toCurrencyCode: 'ASC' },
    });
  }

  async findExchangeRate(fromCode: string, toCode: string): Promise<ExchangeRate> {
    const rate = await this.exchangeRateRepo.findOne({
      where: {
        fromCurrencyCode: fromCode.toUpperCase(),
        toCurrencyCode: toCode.toUpperCase(),
      },
      relations: ['fromCurrency', 'toCurrency'],
    });
    if (!rate) {
      throw new NotFoundException(
        `Taux de change ${fromCode} → ${toCode} introuvable`,
      );
    }
    return rate;
  }

  async updateExchangeRate(
    fromCode: string,
    toCode: string,
    dto: UpdateExchangeRateDto,
  ): Promise<ExchangeRate> {
    const rate = await this.findExchangeRate(fromCode, toCode);
    Object.assign(rate, dto);
    return this.exchangeRateRepo.save(rate);
  }

  async deleteExchangeRate(fromCode: string, toCode: string): Promise<void> {
    const rate = await this.findExchangeRate(fromCode, toCode);
    rate.isActive = false;
    await this.exchangeRateRepo.save(rate);
  }

  async convertAmount(
    amount: number,
    fromCode: string,
    toCode: string,
  ): Promise<{ amount: number; rate: number; from: string; to: string }> {
    if (fromCode.toUpperCase() === toCode.toUpperCase()) {
      return { amount, rate: 1, from: fromCode.toUpperCase(), to: toCode.toUpperCase() };
    }

    const rate = await this.findExchangeRate(fromCode, toCode);
    const convertedAmount = amount * Number(rate.rate);

    return {
      amount: convertedAmount,
      rate: Number(rate.rate),
      from: fromCode.toUpperCase(),
      to: toCode.toUpperCase(),
    };
  }

  async seedCurrencies(currencies: CreateCurrencyDto[]): Promise<Currency[]> {
    const results: Currency[] = [];
    for (const dto of currencies) {
      const existing = await this.currencyRepo.findOne({
        where: { code: dto.code.toUpperCase() },
      });
      if (!existing) {
        const currency = this.currencyRepo.create({
          ...dto,
          code: dto.code.toUpperCase(),
        });
        results.push(await this.currencyRepo.save(currency));
      }
    }
    return results;
  }

  async seedExchangeRates(
    rates: CreateExchangeRateDto[],
  ): Promise<ExchangeRate[]> {
    const results: ExchangeRate[] = [];
    for (const dto of rates) {
      const fromCode = dto.fromCurrencyCode.toUpperCase();
      const toCode = dto.toCurrencyCode.toUpperCase();

      const existing = await this.exchangeRateRepo.findOne({
        where: { fromCurrencyCode: fromCode, toCurrencyCode: toCode },
      });
      if (!existing) {
        const rate = this.exchangeRateRepo.create({
          ...dto,
          fromCurrencyCode: fromCode,
          toCurrencyCode: toCode,
        });
        results.push(await this.exchangeRateRepo.save(rate));
      }
    }
    return results;
  }
}
