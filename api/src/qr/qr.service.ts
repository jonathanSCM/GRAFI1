import { Injectable, NotFoundException } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QrService {
  constructor(private readonly prisma: PrismaService) {}

  private buildProfileUrl(slug: string) {
    const base = process.env.PUBLIC_BASE_URL ?? 'https://grafi.digital';
    return `${base}/${slug}`;
  }

  async regenerateAll(): Promise<{ updated: number }> {
    const base = process.env.PUBLIC_BASE_URL ?? 'https://grafi.digital';
    const profiles = await this.prisma.profile.findMany({ select: { id: true, slug: true } });
    for (const p of profiles) {
      const url = `${base}/${p.slug}`;
      await this.prisma.qrCode.upsert({
        where: { profileId: p.id },
        update: { url },
        create: { profileId: p.id, url },
      });
    }
    return { updated: profiles.length };
  }

  async getQrPngForUser(userId: string): Promise<Buffer> {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const url = this.buildProfileUrl(profile.slug);

    await this.prisma.qrCode.upsert({
      where: { profileId: profile.id },
      update: { url },
      create: { profileId: profile.id, url },
    });

    return QRCode.toBuffer(url, { type: 'png', width: 512, margin: 2 });
  }
}
