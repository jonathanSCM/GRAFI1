import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'La URL (slug) solo puede tener minúsculas, números y guiones (sin espacios ni tildes).',
  })
  slug: string;

  @IsString()
  @MaxLength(100)
  fullName: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  position?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  companyName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;
}
