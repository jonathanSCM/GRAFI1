import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { hasFeature } from '../plans/limits';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async createForSlug(slug: string, dto: CreateLeadDto) {
    const profile = await this.prisma.profile.findUnique({ where: { slug } });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return this.prisma.lead.create({
      data: {
        profileId: profile.id,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        message: dto.message,
        source: dto.source,
      },
    });
  }

  async listForUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { plan: true, company: { include: { plan: true } } },
    });
    if (!hasFeature(user!, 'hasLeads')) {
      throw new ForbiddenException('Tu plan no incluye captura de leads. Actualiza a Grafi Pro.');
    }
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');
    return this.prisma.lead.findMany({
      where: { profileId: profile.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async exportForUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { plan: true, company: { include: { plan: true } } },
    });
    if (!hasFeature(user!, 'hasExportLeads')) {
      throw new ForbiddenException('Tu plan no incluye exportación de leads. Actualiza a Grafi Pro.');
    }
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');
    return this.prisma.lead.findMany({
      where: { profileId: profile.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listForCompany(userId: string) {
    const me = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!me?.companyId) {
      throw new ForbiddenException('Not assigned to a company');
    }
    const profiles = await this.prisma.profile.findMany({
      where: { user: { companyId: me.companyId } },
      select: { id: true, fullName: true, slug: true },
    });
    const profileIds = profiles.map((p) => p.id);
    const profileMap = new Map(profiles.map((p) => [p.id, p]));

    const leads = await this.prisma.lead.findMany({
      where: { profileId: { in: profileIds } },
      orderBy: { createdAt: 'desc' },
    });

    return leads.map((lead) => ({
      ...lead,
      collaborator: profileMap.get(lead.profileId) ?? null,
    }));
  }
}
