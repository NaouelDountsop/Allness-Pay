import { IsEnum, IsInt, IsOptional, IsString, Length, Min, registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { TontineFrequency } from '../entities/tontine.entity';

const MIN_CONTRIBUTION_BY_CURRENCY: Record<string, number> = {
  XAF: 500,
  USD: 1,
  EUR: 1,
  GBP: 1,
  CAD: 1,
};

function MinContributionByCurrency(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'minContributionByCurrency',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: number, args: ValidationArguments) {
          const currency = (args.object as CreateTontineDto).currency ?? 'XAF';
          const min = MIN_CONTRIBUTION_BY_CURRENCY[currency] ?? 500;
          return typeof value === 'number' && !isNaN(value) && value >= min;
        },
        defaultMessage(args: ValidationArguments) {
          const currency = (args.object as CreateTontineDto).currency ?? 'XAF';
          const min = MIN_CONTRIBUTION_BY_CURRENCY[currency] ?? 500;
          return `contributionAmount must not be less than ${min} for ${currency}`;
        },
      },
    });
  };
}

export class CreateTontineDto {
  @IsString()
  @Length(3, 120)
  name: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @IsInt()
  @MinContributionByCurrency({ message: 'contributionAmount is too low for the selected currency' })
  contributionAmount: number;

  @IsEnum(TontineFrequency)
  frequency: TontineFrequency;

  @IsInt()
  @Min(2)
  // @Max(50)
  memberLimit: number;

  @IsOptional()
  @IsString()
  @Length(3, 10)
  currency?: string;
}
