import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { ReorderLinksDto } from './dto/reorder-links.dto';
import { effectiveButtonLimit } from '../plans/limits';

@Injectable()
export class LinksService {
  constructor(private readonly prisma: PrismaService) {}

  private async getOwnedProfileId(userId: string) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile.id;
  }

  private async assertOwnership(userId: string, linkId: string) {
    const link = await this.prisma.link.findUnique({ where: { id: linkId } });
    if (!link) {
      throw new NotFoundException('Link not found');
    }
    const profileId = await this.getOwnedProfileId(userId);
    if (link.profileId !== profileId) {
      throw new ForbiddenException();
    }
    return link;
  }

  async list(userId: string) {
    const profileId = await this.getOwnedProfileId(userId);
    return this.prisma.link.findMany({ where: { profileId }, orderBy: { order: 'asc' } });
  }

  async getLimit(userId: string) {
    const profileId = await this.getOwnedProfileId(userId);
    const count = await this.prisma.link.count({ where: { profileId } });
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { plan: true, company: { include: { plan: true } } },
    });
    return { count, limit: effectiveButtonLimit(user!) };
  }

  async create(userId: string, dto: CreateLinkDto) {
    const profileId = await this.getOwnedProfileId(userId);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { plan: true, company: { include: { plan: true } } },
    });
    const limit = effectiveButtonLimit(user!);

    return this.prisma.$transaction(async (tx) => {
      const count = await tx.link.count({ where: { profileId } });
      if (count >= limit) {
        throw new ForbiddenException(
          `Alcanzaste el límite de ${limit} botones de tu plan. Contacta a soporte para ampliarlo.`,
        );
      }
      return tx.link.create({ data: { ...dto, profileId, order: count } });
    });
  }

  async update(userId: string, linkId: string, dto: UpdateLinkDto) {
    await this.assertOwnership(userId, linkId);
    return this.prisma.link.update({ where: { id: linkId }, data: dto });
  }

  async remove(userId: string, linkId: string) {
    await this.assertOwnership(userId, linkId);
    return this.prisma.link.delete({ where: { id: linkId } });
  }

  async reorder(userId: string, dto: ReorderLinksDto) {
    const profileId = await this.getOwnedProfileId(userId);
    const links = await this.prisma.link.findMany({ where: { profileId } });
    const ownedIds = new Set(links.map((l) => l.id));
    const invalid = dto.orderedIds.some((id) => !ownedIds.has(id));
    if (invalid) {
      throw new ForbiddenException('Invalid link ids');
    }

    await this.prisma.$transaction(
      dto.orderedIds.map((id, index) =>
        this.prisma.link.update({ where: { id }, data: { order: index } }),
      ),
    );
    return this.list(userId);
  }
}
