import { IsString, MaxLength, Matches } from 'class-validator';

export class CreateSocialLinkDto {
  @IsString()
  @MaxLength(50)
  platform: string;

  @IsString()
  @MaxLength(2048)
  @Matches(/^(?!javascript:)/i, { message: 'URL no permitida' })
  url: string;
}
