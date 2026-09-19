import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterCardDto } from './dto/register-card.dto';
import { MarkProgrammedDto } from './dto/mark-programmed.dto';

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}

  private buildProfileUrl(slug: string) {
    const base = process.env.PUBLIC_BASE_URL ?? 'https://grafi.digital';
    return `${base}/${slug}`;
  }

  async getMine(userId: string) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const card = await this.prisma.card.findUnique({ where: { profileId: profile.id } });
    return {
      card,
      profileUrl: this.buildProfileUrl(profile.slug),
    };
  }

  async registerMine(userId: string, dto: RegisterCardDto) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    if (dto.serial) {
      const existing = await this.prisma.card.findUnique({ where: { serial: dto.serial } });
      if (existing && existing.profileId !== profile.id) {
        throw new ConflictException('Ese número de serie ya está registrado en otra tarjeta');
      }
    }

    const url = this.buildProfileUrl(profile.slug);

    return this.prisma.card.upsert({
      where: { profileId: profile.id },
      update: { serial: dto.serial, url },
      create: { profileId: profile.id, serial: dto.serial, url },
    });
  }

  async markProgrammed(userId: string, dto: MarkProgrammedDto) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    const card = await this.prisma.card.findUnique({ where: { profileId: profile.id } });
    if (!card) {
      throw new NotFoundException('Card not registered yet');
    }
    return this.prisma.card.update({ where: { id: card.id }, data: { programmed: dto.programmed } });
  }

  listAllForAdmin() {
    return this.prisma.card.findMany({
      include: { profile: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
