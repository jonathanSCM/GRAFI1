import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateUserLimitDto {
  @IsOptional()
  @IsString()
  planId?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  buttonLimitOverride?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  socialLinkLimitOverride?: number | null;

  @IsOptional()
  @IsDateString()
  planExpiresAt?: string | null;
}
