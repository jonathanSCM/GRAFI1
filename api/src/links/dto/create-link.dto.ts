import { IsEnum, IsOptional, IsString, MaxLength, Matches } from 'class-validator';
import { LinkType } from '@prisma/client';

export class CreateLinkDto {
  @IsEnum(LinkType)
  type: LinkType;

  @IsString()
  @MaxLength(100)
  title: string;

  @IsString()
  @MaxLength(2048)
  @Matches(/^(?!javascript:)/i, { message: 'URL no permitida' })
  url: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  icon?: string;
}
