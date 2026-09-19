import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PlanActiveGuard } from './auth/plan-active.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProfilesModule } from './profiles/profiles.module';
import { LinksModule } from './links/links.module';
import { QrModule } from './qr/qr.module';
import { VcardModule } from './vcard/vcard.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AdminModule } from './admin/admin.module';
import { SocialLinksModule } from './social-links/social-links.module';
import { UploadsModule } from './uploads/uploads.module';
import { CompaniesModule } from './companies/companies.module';
import { CardsModule } from './cards/cards.module';
import { LeadsModule } from './leads/leads.module';
import { CatalogModule } from './catalog/catalog.module';
import { PlansModule } from './plans/plans.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60_000, limit: 60 },
    ]),
    PrismaModule,
    AuthModule,
    ProfilesModule,
    LinksModule,
    QrModule,
    VcardModule,
    AnalyticsModule,
    AdminModule,
    SocialLinksModule,
    UploadsModule,
    CompaniesModule,
    CardsModule,
    LeadsModule,
    CatalogModule,
    PlansModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: PlanActiveGuard },
  ],
})
export class AppModule {}
