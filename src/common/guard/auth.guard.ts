// src/common/guards/auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin, AdminDocument } from '../../admin/admin.schema.js';
import { PERMISSIONS_KEY, ALLOWED_USERS_KEY, UserType } from './auth.decorator.js';
import { getCredentials } from '../../config/config.js';
@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);
  private readonly credentials = getCredentials(); 

  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    const allowedUsers = this.reflector.getAllAndOverride<UserType[]>(
      ALLOWED_USERS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!allowedUsers || !allowedUsers.length) {
      throw new ForbiddenException('Access Denied');
    }

    if (!requiredPermissions || !requiredPermissions.length) {
      throw new InternalServerErrorException('Permissions not defined in guard');
    }

    const request = context.switchToHttp().getRequest();
    const adminToken = request.cookies?.admin_token;

    if (!adminToken) {
      throw new UnauthorizedException('Unauthorized');
    }

    let user: any = null;
    let userType: UserType | null = null;

    /**
     * 🔹 ADMIN CHECK
     */
    if (adminToken && allowedUsers.includes('admin')) {
      let decoded: any;
      try {
        decoded = await this.jwtService.verifyAsync(adminToken, {
          secret: this.credentials.jwt_token, // <-- এখানে ব্যবহার করা হলো
        });
      } catch {
        throw new UnauthorizedException('Invalid or expired token');
      }

      user = await this.adminModel
        .findOne({ admin_phone: decoded.admin_phone })
        .populate('admin_role_id');

      if (!user || user.admin_status !== 'active') {
        throw new ForbiddenException('Invalid Admin');
      }

      userType = 'admin';
    }

    if (!user) {
      throw new ForbiddenException('Access Denied');
    }

    /**
     * 🔐 PERMISSION CHECK
     */
    if (userType === 'admin') {
      const role: any = user.admin_role_id;

      if (!role || !Array.isArray(role.permissions)) {
        throw new ForbiddenException('No permissions assigned');
      }

      const hasPermission = requiredPermissions.some((p) =>
        role.permissions.includes(p),
      );

      if (!hasPermission) {
        throw new ForbiddenException('Permission Denied');
      }

      request.user = user;
      request.user_type = userType;

      this.logger.log(
        `${request.method} ${request.originalUrl}, Admin: ${user?.admin_name}, ${user?.admin_phone}, accessed with permissions: ${requiredPermissions.join(', ')}`,
      );

      return true;
    }

    return false;
  }
}