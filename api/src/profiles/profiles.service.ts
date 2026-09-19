import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { hasFeature } from '../plans/limits';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async createForUser(userId: string, dto: CreateProfileDto) {
    const existing = await this.prisma.profile.findUnique({ where: { userId } });
    if (existing) throw new ConflictException('Ya tienes un perfil creado');

    const slugTaken = await this.prisma.profile.findUnique({ where: { slug: dto.slug } });
    if (slugTaken) throw new ConflictException('Slug already in use');

    try {
      return await this.prisma.profile.create({ data: { ...dto, userId } });
    } catch (e: any) {
      if (e?.code === 'P2002') throw new ConflictException('Ya tienes un perfil creado');
      throw e;
    }
  }

  async findBySlug(slug: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { slug, isActive: true },
      include: {
        links: { where: { isActive: true }, orderBy: { order: 'asc' } },
        socialLinks: { where: { isActive: true }, orderBy: { order: 'asc' } },
        user: { include: { company: { include: { plan: true } }, plan: true } },
      },
    });
    if (!profile || profile.user.status !== 'ACTIVE') {
      throw new NotFoundException('Profile not found');
    }
    // Hide profile when plan has expired
    const expiry = profile.user.company?.planExpiresAt ?? profile.user.planExpiresAt;
    if (expiry && expiry < new Date()) {
      throw new NotFoundException('Profile not found');
    }
    const { user, ...rest } = profile;
    const saveContact = hasFeature(user, 'hasSaveContact');
    const links = saveContact
      ? rest.links
      : rest.links.filter((l) => l.type !== 'SAVE_CONTACT');
    return {
      ...rest,
      links,
      hasSaveContact: saveContact,
      company: user.company
        ? { id: user.company.id, name: user.company.name, slug: user.company.slug, logo: user.company.logo }
        : null,
    };
  }

  async findByUserId(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { links: true, socialLinks: true, user: { include: { company: true } } },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    const { user, ...rest } = profile;
    return { ...rest, company: user.company };
  }

  async updateByUserId(userId: string, dto: UpdateProfileDto) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    if (dto.slug && dto.slug !== profile.slug) {
      const taken = await this.prisma.profile.findUnique({ where: { slug: dto.slug } });
      if (taken) {
        throw new ConflictException('Slug ya está en uso');
      }
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    const data = user?.company ? { ...dto, companyName: user.company.name } : dto;

    return this.prisma.profile.update({
      where: { userId },
      data,
    });
  }
}
