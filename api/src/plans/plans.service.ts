import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  listAll() {
    return this.prisma.plan.findMany({ orderBy: { priceMonthly: 'asc' } });
  }

  async create(dto: CreatePlanDto) {
    const existing = await this.prisma.plan.findFirst({
      where: { OR: [{ name: dto.name }, { slug: dto.slug }] },
    });
    if (existing) {
      throw new ConflictException('Ya existe un plan con ese nombre o slug');
    }
    return this.prisma.plan.create({ data: { ...dto, features: {} } });
  }

  async update(id: string, dto: UpdatePlanDto) {
    const plan = await this.prisma.plan.findUnique({ where: { id } });
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }
    return this.prisma.plan.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const plan = await this.prisma.plan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Plan not found');

    const [usersCount, companiesCount] = await Promise.all([
      this.prisma.user.count({ where: { planId: id } }),
      this.prisma.company.count({ where: { planId: id } }),
    ]);
    if (usersCount > 0 || companiesCount > 0) {
      throw new BadRequestException(
        `No se puede eliminar: ${usersCount} usuario(s) y ${companiesCount} empresa(s) usan este plan. Reasígnalos primero.`,
      );
    }

    await this.prisma.plan.delete({ where: { id } });
    return { ok: true };
  }
}
