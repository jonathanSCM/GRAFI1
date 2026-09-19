import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    try {
      const user = await this.prisma.user.create({
        data: { name: dto.name, email: dto.email, password: passwordHash },
      });
      return this.buildToken(user.id, user.email, user.role);
    } catch (e: any) {
      if (e?.code === 'P2002') throw new ConflictException('Email already registered');
      throw e;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    // Compare even when user doesn't exist to prevent timing-based enumeration
    const dummyHash = '$2b$10$invalidhashpaddingtomakeconstanttime000000000000000000000';
    const valid = user
      ? await bcrypt.compare(dto.password, user.password)
      : await bcrypt.compare(dto.password, dummyHash).then(() => false);

    if (!user || !valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildToken(user.id, user.email, user.role);
  }

  private buildToken(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    return {
      accessToken: this.jwt.sign(payload),
    };
  }
}
