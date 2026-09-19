import { Controller, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { QrService } from './qr.service';

@UseGuards(JwtAuthGuard)
@Controller('qr')
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @Get('me')
  async getMine(@Req() req: any, @Res() res: Response) {
    const buffer = await this.qrService.getQrPngForUser(req.user.userId);
    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': 'inline; filename="qr.png"',
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
    });
    res.send(buffer);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('regenerate-all')
  regenerateAll() {
    return this.qrService.regenerateAll();
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('user/:userId')
  async getForUser(@Param('userId') userId: string, @Res() res: Response) {
    const buffer = await this.qrService.getQrPngForUser(userId);
    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': 'inline; filename="qr.png"',
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
    });
    res.send(buffer);
  }
}
