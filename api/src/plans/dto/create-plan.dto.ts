import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { BillingCycle } from '@prisma/client';

export class CreatePlanDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsNumber()
  @Min(0)
  priceMonthly: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  priceBolivares?: number;

  @IsOptional()
  @IsEnum(BillingCycle)
  billingCycle?: BillingCycle;

  @IsOptional()
  @IsString()
  durationLabel?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationMonths?: number | null;

  @IsInt()
  @Min(0)
  maxButtons: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxSocialLinks?: number;

  @IsInt()
  @Min(1)
  maxCollaborators: number;
}
