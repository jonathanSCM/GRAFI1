import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VcardService {
  constructor(private readonly prisma: PrismaService) {}

  async buildVcardBySlug(slug: string): Promise<string> {
    const profile = await this.prisma.profile.findUnique({
      where: { slug },
      include: { links: true, user: true },
    });
    if (!profile || !profile.isActive || profile.user.status !== 'ACTIVE') {
      throw new NotFoundException('Profile not found');
    }

    const phoneLink = profile.links.find((l) => l.type === 'CALL' || l.type === 'WHATSAPP');
    const emailLink = profile.links.find((l) => l.type === 'EMAIL');
    const websiteLink = profile.links.find((l) => l.type === 'WEBSITE');

    const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\r/g, '');
    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${esc(profile.fullName ?? '')}`,
      profile.companyName ? `ORG:${esc(profile.companyName)}` : null,
      profile.position ? `TITLE:${esc(profile.position)}` : null,
      phoneLink ? `TEL;TYPE=CELL:${this.extractValue(phoneLink.url)}` : null,
      emailLink ? `EMAIL:${this.extractValue(emailLink.url)}` : `EMAIL:${profile.user.email}`,
      websiteLink ? `URL:${websiteLink.url}` : null,
      'END:VCARD',
    ].filter(Boolean);

    return lines.join('\r\n');
  }

  private extractValue(url: string) {
    return url.replace(/^(tel:|mailto:|https?:\/\/wa\.me\/)/, '');
  }
}
