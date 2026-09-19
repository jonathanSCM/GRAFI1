import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TrackEventDto } from './dto/track-event.dto';
import { hasFeature } from '../plans/limits';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async trackBySlug(slug: string, dto: TrackEventDto, meta: { ipHash?: string; device?: string; browser?: string; country?: string }) {
    const profile = await this.prisma.profile.findUnique({ where: { slug } });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    await this.prisma.analyticsEvent.create({
      data: {
        profileId: profile.id,
        eventType: dto.eventType,
        linkId: dto.linkId,
        source: dto.source,
        ...meta,
      },
    });

    if (dto.linkId) {
      // updateMany ignores missing/wrong-profile links instead of throwing 500
      await this.prisma.link.updateMany({
        where: { id: dto.linkId, profileId: profile.id },
        data: { clickCount: { increment: 1 } },
      });
    }

    return { ok: true };
  }

  async summaryForUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { plan: true, company: { include: { plan: true } } },
    });
    if (!hasFeature(user!, 'hasAnalytics')) {
      throw new ForbiddenException('Tu plan no incluye analíticas. Actualiza a Grafi Pro.');
    }
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const [totalViews, byType, clicksByLink, recentEvents] = await Promise.all([
      this.prisma.analyticsEvent.count({ where: { profileId: profile.id, eventType: 'PROFILE_VIEW' } }),
      this.prisma.analyticsEvent.groupBy({
        by: ['eventType'],
        where: { profileId: profile.id },
        _count: { _all: true },
      }),
      this.prisma.link.findMany({
        where: { profileId: profile.id },
        select: { id: true, title: true, clickCount: true },
        orderBy: { clickCount: 'desc' },
      }),
      this.prisma.analyticsEvent.findMany({
        where: { profileId: profile.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ]);

    return { totalViews, byType, clicksByLink, recentEvents };
  }
}
