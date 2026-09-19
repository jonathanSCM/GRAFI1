import { Body, Controller, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';

@Controller()
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  // 5 leads por IP cada 10 minutos — frena bots sin bloquear visitantes reales
  @Throttle({ default: { ttl: 600_000, limit: 5 } })
  @Post('profiles/:slug/leads')
  createPublic(@Param('slug') slug: string, @Body() dto: CreateLeadDto) {
    return this.leadsService.createForSlug(slug, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('leads')
  listMine(@Req() req: any) {
    return this.leadsService.listForUser(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('leads/export')
  async exportCsv(@Req() req: any, @Res() res: Response) {
    const leads = await this.leadsService.exportForUser(req.user.userId);
    const header = 'Nombre,Email,Telefono,Mensaje,Fuente,Fecha';
    const esc = (v: string | null | undefined) => `"${(v ?? '').replace(/"/g, '""')}"`;
    const rows = leads.map((l) =>
      [esc(l.name), esc(l.email), esc(l.phone), esc(l.message), esc(l.source), esc(l.createdAt.toISOString())].join(','),
    );
    const csv = [header, ...rows].join('\n');
    const date = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="leads-${date}.csv"`);
    res.send('﻿' + csv); // BOM para Excel
  }

  @UseGuards(JwtAuthGuard)
  @Get('companies/me/leads')
  listForCompany(@Req() req: any) {
    return this.leadsService.listForCompany(req.user.userId);
  }
}
