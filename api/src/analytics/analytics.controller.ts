import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';
import { TrackEventDto } from './dto/track-event.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post(':slug/events')
  track(@Param('slug') slug: string, @Body() dto: TrackEventDto, @Req() req: any) {
    const ipHash = req.ip ? Buffer.from(req.ip).toString('base64') : undefined;
    const ua: string | undefined = req.headers['user-agent'];
    return this.analyticsService.trackBySlug(slug, dto, {
      ipHash,
      device: ua ? ua.slice(0, 512) : undefined,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/summary')
  summary(@Req() req: any) {
    return this.analyticsService.summaryForUser(req.user.userId);
  }
}
