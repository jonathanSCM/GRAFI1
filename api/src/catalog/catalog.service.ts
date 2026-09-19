import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCatalogItemDto } from './dto/create-catalog-item.dto';
import { UpdateCatalogItemDto } from './dto/update-catalog-item.dto';
import { hasFeature } from '../plans/limits';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  private async getCompanyId(userId: string) {
    const me = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!me?.companyId) {
      throw new ForbiddenException('Not assigned to a company');
    }
    return me.companyId;
  }

  private async assertOwnership(userId: string, itemId: string) {
    const companyId = await this.getCompanyId(userId);
    const item = await this.prisma.catalogItem.findUnique({ where: { id: itemId } });
    if (!item) throw new NotFoundException('Catalog item not found');
    if (item.companyId !== companyId) throw new ForbiddenException();
    return { item, companyId };
  }

  private async assertProfilesBelongToCompany(profileIds: string[], companyId: string) {
    const count = await this.prisma.profile.count({
      where: { id: { in: profileIds }, user: { companyId } },
    });
    if (count !== profileIds.length) {
      throw new BadRequestException('Uno o más perfiles no pertenecen a esta empresa');
    }
  }

  private async assertCatalogFeature(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { plan: true, company: { include: { plan: true } } },
    });
    if (!hasFeature(user!, 'hasCatalog')) {
      throw new ForbiddenException('Tu plan no incluye catálogo. Actualiza a Grafi Empresa.');
    }
  }

  async list(userId: string) {
    await this.assertCatalogFeature(userId);
    const companyId = await this.getCompanyId(userId);
    return this.prisma.catalogItem.findMany({
      where: { companyId },
      include: { assignedTo: { select: { id: true, fullName: true, slug: true } } },
      orderBy: { order: 'asc' },
    });
  }

  async create(userId: string, dto: CreateCatalogItemDto) {
    await this.assertCatalogFeature(userId);
    const companyId = await this.getCompanyId(userId);
    if (dto.assignedProfileIds?.length) {
      await this.assertProfilesBelongToCompany(dto.assignedProfileIds, companyId);
    }
    const count = await this.prisma.catalogItem.count({ where: { companyId } });
    return this.prisma.catalogItem.create({
      data: {
        companyId,
        title: dto.title,
        description: dto.description,
        image: dto.image,
        link: dto.link,
        isActive: dto.isActive ?? true,
        order: count,
        assignedTo: dto.assignedProfileIds
          ? { connect: dto.assignedProfileIds.map((id) => ({ id })) }
          : undefined,
      },
      include: { assignedTo: { select: { id: true, fullName: true, slug: true } } },
    });
  }

  async update(userId: string, itemId: string, dto: UpdateCatalogItemDto) {
    const { companyId } = await this.assertOwnership(userId, itemId);
    if (dto.assignedProfileIds?.length) {
      await this.assertProfilesBelongToCompany(dto.assignedProfileIds, companyId);
    }
    return this.prisma.catalogItem.update({
      where: { id: itemId },
      data: {
        title: dto.title,
        description: dto.description,
        image: dto.image,
        link: dto.link,
        isActive: dto.isActive,
        assignedTo: dto.assignedProfileIds
          ? { set: dto.assignedProfileIds.map((id) => ({ id })) }
          : undefined,
      },
      include: { assignedTo: { select: { id: true, fullName: true, slug: true } } },
    });
  }

  async remove(userId: string, itemId: string) {
    await this.assertOwnership(userId, itemId);
    return this.prisma.catalogItem.delete({ where: { id: itemId } });
  }

  async listForProfile(slug: string) {
    const profile = await this.prisma.profile.findUnique({ where: { slug } });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return this.prisma.catalogItem.findMany({
      where: { isActive: true, assignedTo: { some: { id: profile.id } } },
      orderBy: { order: 'asc' },
    });
  }

  async listForCompanySlug(slug: string) {
    const company = await this.prisma.company.findUnique({ where: { slug } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return this.prisma.catalogItem.findMany({
      where: { companyId: company.id, isActive: true },
      orderBy: { order: 'asc' },
    });
  }
}
