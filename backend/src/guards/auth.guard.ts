import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { Accounts } from 'src/accounts/entities/account.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { UserRoles } from './roles.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly accountsRepository: Repository<Accounts>;
  constructor(
    private readonly dataSource: DataSource,
    private jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {
    this.accountsRepository = this.dataSource.getRepository(Accounts);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roleApi = this.reflector.get<string[]>(
      UserRoles,
      context.getHandler(),
    );
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new BadRequestException({ message: 'Token không được để trống.' });
    }

    let accessToken: any;
    try {
      accessToken = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Access token không hợp lệ.');
    }

    const account = await this.accountsRepository.findOne({
      relations: { roles: true },
      where: {
        id: accessToken.id,
        refresh_token: accessToken.refresh_token,
        ban: false,
      },
      select: {
        id: true,
        refresh_token: true,
        avatar: true,
        fullname: true,
        gender: true,
        phone: true,
        birthday: true,
        email: true,
        usid: true,
        roles: { role: true, description: true, rating: true },
      },
    });

    if (!account) {
      throw new ForbiddenException('Tài khoản không tồn tại hoặc đã bị cấm.');
    }

    let refreshToken: any;
    try {
      refreshToken = await this.jwtService.verifyAsync(
        account?.refresh_token ?? '',
        {
          secret: process.env.JWT_SECRET,
        },
      );
    } catch {
      throw new ForbiddenException('Refresh token không hợp lệ.');
    }

    if (
      accessToken.id !== refreshToken.id ||
      accessToken.udid !== refreshToken.udid
    ) {
      throw new ForbiddenException('Token không khớp.');
    }

    const {
      id,
      avatar,
      fullname,
      gender,
      phone,
      birthday,
      email,
      usid,
      roles,
    } = account;

    if (!roleApi || roleApi.includes(roles?.role ?? '')) {
      request.user = {
        id,
        fullname,
        avatar,
        avatarOrigin: avatar,
        gender,
        phone,
        birthday,
        email,
        usid,
        roles: roles?.role,
        description: roles?.description,
        rating: roles?.rating,
      };
      return true;
    }

    throw new ForbiddenException('Không có quyền truy cập.');
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
