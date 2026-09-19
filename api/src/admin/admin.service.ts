import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { AdminUpdateCardDto } from '../cards/dto/admin-update-card.dto';
import { UpdateUserLimitDto } from '../plans/dto/update-user-limit.dto';
import { effectiveButtonLimit } from '../plans/limits';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async listUsers() {
    const users = await this.prisma.user.findMany({
      include: { profile: true, plan: true, company: { include: { plan: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return users.map(({ password, ...rest }) => ({
      ...rest,
      effectiveButtonLimit: effectiveButtonLimit(rest),
    }));
  }

  async updateUserLimits(userId: string, dto: UpdateUserLimitDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.planId !== undefined ? { planId: dto.planId } : {}),
        ...(dto.buttonLimitOverride !== undefined ? { buttonLimitOverride: dto.buttonLimitOverride } : {}),
        ...(dto.planExpiresAt !== undefined ? { planExpiresAt: dto.planExpiresAt ? new Date(dto.planExpiresAt) : null } : {}),
      },
      include: { plan: true },
    });
  }

  async createUser(dto: CreateUserDto) {
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
        planId: dto.planId,
        companyId: dto.companyId,
      },
    });
    const { password, ...rest } = user;
    return rest;
  }

  async updateStatus(userId: string, dto: UpdateUserStatusDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.prisma.user.update({ where: { id: userId }, data: { status: dto.status } });
  }

  async listCards() {
    const profiles = await this.prisma.profile.findMany({
      include: { card: true, user: true },
      orderBy: { createdAt: 'desc' },
    });
    return profiles.map(({ user, ...rest }) => {
      const { password, ...userRest } = user;
      return { ...rest, user: userRest };
    });
  }

  async updateCard(profileId: string, dto: AdminUpdateCardDto) {
    const profile = await this.prisma.profile.findUnique({ where: { id: profileId } });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    if (dto.serial) {
      const existing = await this.prisma.card.findUnique({ where: { serial: dto.serial } });
      if (existing && existing.profileId !== profile.id) {
        throw new ConflictException('Ese número de serie ya está registrado en otra tarjeta');
      }
    }

    const base = process.env.PUBLIC_BASE_URL ?? 'https://grafi.digital';
    const url = `${base}/${profile.slug}`;

    return this.prisma.card.upsert({
      where: { profileId: profile.id },
      update: {
        ...(dto.serial !== undefined ? { serial: dto.serial } : {}),
        ...(dto.programmed !== undefined ? { programmed: dto.programmed } : {}),
        url,
      },
      create: { profileId: profile.id, serial: dto.serial, programmed: dto.programmed ?? false, url },
    });
  }

  analyticsOverview() {
    return this.prisma.analyticsEvent.groupBy({
      by: ['eventType'],
      _count: { _all: true },
    });
  }
}
