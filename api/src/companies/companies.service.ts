import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { AssignUserDto } from './dto/assign-user.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { AddCompanyUserDto } from './dto/add-company-user.dto';
import { effectiveCollaboratorLimit } from '../plans/limits';
import { UpdateCompanyLimitDto } from '../plans/dto/update-company-limit.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async listAll() {
    const companies = await this.prisma.company.findMany({
      include: { _count: { select: { users: true } }, plan: true },
      orderBy: { createdAt: 'desc' },
    });
    return companies.map((c) => ({ ...c, effectiveCollaboratorLimit: effectiveCollaboratorLimit(c) }));
  }

  async create(dto: CreateCompanyDto) {
    const existing = await this.prisma.company.findUnique({ where: { slug: dto.slug } });
    if (existing) {
      throw new ConflictException('Slug already in use');
    }
    return this.prisma.company.create({ data: dto });
  }

  async update(companyId: string, dto: UpdateCompanyDto) {
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return this.prisma.company.update({ where: { id: companyId }, data: dto });
  }

  private async assertCollaboratorRoom(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: { plan: true, _count: { select: { users: true } } },
    });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    const limit = effectiveCollaboratorLimit(company);
    if (company._count.users >= limit) {
      throw new ForbiddenException(
        `Alcanzaste el límite de ${limit} colaboradores de tu plan empresarial. Contacta a soporte para ampliarlo.`,
      );
    }
  }

  async updateLimits(companyId: string, dto: UpdateCompanyLimitDto) {
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return this.prisma.company.update({
      where: { id: companyId },
      data: {
        ...(dto.planId !== undefined ? { planId: dto.planId } : {}),
        ...(dto.collaboratorLimitOverride !== undefined
          ? { collaboratorLimitOverride: dto.collaboratorLimitOverride }
          : {}),
      },
      include: { plan: true },
    });
  }

  async assignUser(companyId: string, dto: AssignUserDto) {
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    // Admin can always assign — limit only applies to self-service (addUserToMyCompany)
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      include: { company: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.companyId && user.companyId !== companyId) {
      throw new ConflictException(
        `Este usuario ya pertenece a la empresa "${user.company?.name}". Desasígnalo primero.`,
      );
    }
    return this.prisma.user.update({
      where: { id: dto.userId },
      data: { companyId, role: user.role === 'ADMIN' ? user.role : 'COMPANY_ADMIN' },
    });
  }

  async updateMine(userId: string, dto: UpdateCompanyDto) {
    const me = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!me?.companyId) {
      throw new ForbiddenException('Not assigned to a company');
    }
    return this.prisma.company.update({ where: { id: me.companyId }, data: dto });
  }

  async addUserToMyCompany(userId: string, dto: AddCompanyUserDto) {
    const me = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!me?.companyId) {
      throw new ForbiddenException('Not assigned to a company');
    }
    await this.assertCollaboratorRoom(me.companyId);
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: passwordHash,
        companyId: me.companyId,
        role: 'COMPANY_ADMIN',
      },
    });
    const { password, ...rest } = user;
    return rest;
  }

  async unassignUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: { companyId: null, role: user.role === 'ADMIN' ? user.role : 'USER' },
    });
  }

  async getPublicBySlug(slug: string) {
    const company = await this.prisma.company.findUnique({
      where: { slug },
      include: {
        users: {
          where: { status: 'ACTIVE', profile: { isActive: true } },
          include: { profile: true },
        },
      },
    });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return {
      name: company.name,
      slug: company.slug,
      description: company.description,
      logo: company.logo,
      website: company.website,
      redirectEnabled: company.redirectEnabled,
      theme: company.theme,
      backgroundType: company.backgroundType,
      backgroundColor: company.backgroundColor,
      backgroundTo: company.backgroundTo,
      buttonColor: company.buttonColor,
      buttonTextColor: company.buttonTextColor,
      textColor: company.textColor,
      collaborators: company.users
        .filter((u) => u.profile)
        .map((u) => ({
          slug: u.profile!.slug,
          fullName: u.profile!.fullName,
          position: u.profile!.position,
          photo: u.profile!.photo,
        })),
    };
  }

  private async getCompanyDetail(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: {
        plan: true,
        users: {
          include: {
            profile: {
              include: {
                _count: { select: { links: true } },
              },
            },
          },
        },
      },
    });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const profileIds = company.users.map((u) => u.profile?.id).filter((id): id is string => !!id);

    const analyticsByProfile = await this.prisma.analyticsEvent.groupBy({
      by: ['profileId'],
      where: { profileId: { in: profileIds } },
      _count: { _all: true },
    });

    const viewsMap = new Map(analyticsByProfile.map((a) => [a.profileId, a._count._all]));

    const leadsByProfile = await this.prisma.lead.groupBy({
      by: ['profileId'],
      where: { profileId: { in: profileIds } },
      _count: { _all: true },
    });
    const leadsMap = new Map(leadsByProfile.map((l) => [l.profileId, l._count._all]));

    return {
      id: company.id,
      name: company.name,
      slug: company.slug,
      description: company.description,
      logo: company.logo,
      website: company.website,
      redirectEnabled: company.redirectEnabled,
      theme: company.theme,
      backgroundType: company.backgroundType,
      backgroundColor: company.backgroundColor,
      backgroundTo: company.backgroundTo,
      buttonColor: company.buttonColor,
      buttonTextColor: company.buttonTextColor,
      textColor: company.textColor,
      plan: company.plan,
      collaboratorLimitOverride: company.collaboratorLimitOverride,
      effectiveCollaboratorLimit: effectiveCollaboratorLimit(company),
      collaborators: company.users.map((u) => ({
        id: u.id,
        profileId: u.profile?.id ?? null,
        name: u.name,
        email: u.email,
        status: u.status,
        slug: u.profile?.slug ?? null,
        linkCount: u.profile?._count.links ?? 0,
        totalEvents: u.profile ? viewsMap.get(u.profile.id) ?? 0 : 0,
        leadCount: u.profile ? leadsMap.get(u.profile.id) ?? 0 : 0,
      })),
      totalEvents: [...viewsMap.values()].reduce((sum, v) => sum + v, 0),
      totalLeads: [...leadsMap.values()].reduce((sum, v) => sum + v, 0),
    };
  }

  async getMyCompany(userId: string) {
    const me = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!me?.companyId) {
      throw new ForbiddenException('Not assigned to a company');
    }
    return this.getCompanyDetail(me.companyId);
  }

  async getDetailForAdmin(companyId: string) {
    return this.getCompanyDetail(companyId);
  }
}
