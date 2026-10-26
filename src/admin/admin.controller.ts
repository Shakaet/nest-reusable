import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { Auth } from '../common/guard/auth.decorator.js';

import { AdminService } from './admin.service.js';
import { CreateAdminDto } from './create-admin.dto.js';
import { LoginAdminDto } from './login-admin.dto.js';
import { UpdateAdminDto } from './update-admin.dto.js';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly configService: ConfigService,
  ) {}

  private get cookieOptions() {
      const isProduction = process.env.NODE_ENV === 'production';

    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? ('none' as const) : ('lax' as const),
      path: '/',
    };
  }

  @Get()
  async getMe(@Req() req: Request) {
    const token = req.cookies?.admin_token;

    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }

    return {
      success: true,
      message: 'Admin fetched',
      data: await this.adminService.getMe(token),
    };
  }

  @Post("admin")
  async create(@Body() body: CreateAdminDto) {
    await this.adminService.create(body);

    return {
      success: true,
      message: 'Admin created successfully',
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: LoginAdminDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log('Login request body:', body); // Debugging line
    const token = await this.adminService.login(body);

    res.cookie('admin_token', token, this.cookieOptions);

    return {
      success: true,
      message: 'Login successful',
    };
  }

  @Get('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('admin_token', this.cookieOptions);

    return {
      success: true,
      message: 'Logout successful',
    };
  }

  @Get('public')
  async getPublic() {
    return {
      success: true,
      message: 'Admins fetched',
      data: await this.adminService.getPublic(),
    };
  }

  @Get('admin')
  @Auth('all_create', 'admin')
  async getDashboard(
    @Query('page') page = '1',
    @Query('limit') limit = '50',
    @Query('searchTerm') searchTerm?: string,
  ) {
    const result = await this.adminService.getDashboard(
      Number(page),
      Number(limit),
      searchTerm,
    );

    return {
      success: true,
      message: 'Admins fetched',
      data: result.data,
      totalData: result.total,
    };
  }

  @Patch("admin")
  async update(@Body() body: UpdateAdminDto) {
    const { _id } = body;

    await this.adminService.update(_id, body);

    return {
      success: true,
      message: 'Admin updated',
    };
  }

  @Delete("admin")
  async remove(@Body() body: UpdateAdminDto) {
    await this.adminService.remove(body._id);

    return {
      success: true,
      message: 'Admin deleted',
    };
  }
}
