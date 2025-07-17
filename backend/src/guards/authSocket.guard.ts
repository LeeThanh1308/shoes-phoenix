import {
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
import { Socket } from 'socket.io';
import { UserRoles } from './roles.decorator';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class AuthSocketGuard implements CanActivate {
  private readonly accountsRepository: Repository<Accounts>;
  constructor(
    private readonly dataSource: DataSource,
    private jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {
    this.accountsRepository = this.dataSource.getRepository(Accounts);
  }

  async canActivate(context: ExecutionContext) {
    const roleApi = this.reflector.get(UserRoles, context.getHandler());

    const client = context.switchToWs().getClient(); // lấy socket client
    const token = client.handshake?.auth?.token;

    if (!token) {
      throw new WsException('Token is missing');
    }
    try {
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      client.userID = decoded.id; // gắn vào socket
      return true;
    } catch (error) {
      throw new WsException('Invalid token');
    }
  }
}
