import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSocialLinkDto } from './dto/create-social-link.dto';
import { UpdateSocialLinkDto } from './dto/update-social-link.dto';
import { effectiveSocialLinkLimit } from '../plans/limits';

@Injectable()
export class SocialLinksService {
  constructor(private readonly prisma: PrismaService) {}

  private async getOwnedProfileId(userId: string) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile.id;
  }

  private async assertOwnership(userId: string, id: string) {
    const link = await this.prisma.socialLink.findUnique({ where: { id } });
    if (!link) {
      throw new NotFoundException('Social link not found');
    }
    const profileId = await this.getOwnedProfileId(userId);
    if (link.profileId !== profileId) {
      throw new ForbiddenException();
    }
    return link;
  }

  async list(userId: string) {
    const profileId = await this.getOwnedProfileId(userId);
    return this.prisma.socialLink.findMany({ where: { profileId }, orderBy: { order: 'asc' } });
  }

  async create(userId: string, dto: CreateSocialLinkDto) {
    const [profile, user] = await Promise.all([
      this.prisma.profile.findUnique({ where: { userId } }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          socialLinkLimitOverride: true,
          plan: { select: { maxSocialLinks: true } },
          company: { select: { plan: { select: { maxSocialLinks: true } } } },
        },
      }),
    ]);
    if (!profile) throw new NotFoundException('Profile not found');
    if (!user) throw new NotFoundException('User not found');

    const limit = effectiveSocialLinkLimit(user);
    const count = await this.prisma.socialLink.count({ where: { profileId: profile.id } });
    if (count >= limit) {
      throw new BadRequestException(`Has alcanzado el límite de ${limit} redes sociales de tu plan.`);
    }

    return this.prisma.socialLink.create({ data: { ...dto, profileId: profile.id, order: count } });
  }

  async update(userId: string, id: string, dto: UpdateSocialLinkDto) {
    await this.assertOwnership(userId, id);
    return this.prisma.socialLink.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string) {
    await this.assertOwnership(userId, id);
    return this.prisma.socialLink.delete({ where: { id } });
  }
}
