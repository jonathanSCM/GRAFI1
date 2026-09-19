import { IsBoolean, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class AdminUpdateCardDto {
  @IsOptional()
  @IsString()
  @MinLength(4)
  @MaxLength(32)
  @Matches(/^[A-Fa-f0-9:]+$/, { message: 'Serial debe ser hexadecimal (ej: A1:B2:C3:D4)' })
  serial?: string;

  @IsOptional()
  @IsBoolean()
  programmed?: boolean;
}
