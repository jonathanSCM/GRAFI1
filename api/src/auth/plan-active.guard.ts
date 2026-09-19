import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlanActiveGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user } = context.switchToHttp().getRequest();
    if (!user?.userId) return true;

    // ADMINs are never blocked
    if (user.role === 'ADMIN') return true;

    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.userId },
      select: { planExpiresAt: true, companyId: true, company: { select: { planExpiresAt: true } } },
    });
    if (!dbUser) return true;

    const expiry = dbUser.company?.planExpiresAt ?? dbUser.planExpiresAt;
    if (expiry && expiry < new Date()) {
      throw new ForbiddenException('Tu plan ha vencido. Contacta a soporte para renovarlo.');
    }

    return true;
  }
}
