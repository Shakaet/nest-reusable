
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
} from '@nestjs/common';

import { AdminRoleService } from './admin-role.service.js';
import { CreateAdminRoleDto } from './create-admin-role.dto.js';
import { UpdateAdminRoleDto } from './update-admin-role.dto.js';
import { AdminRoleIdDto } from './admin-role-id.dto.js';

@Controller('admin_role')
export class AdminRoleController {
  constructor(
    private readonly adminRoleService: AdminRoleService,
  ) {}

  // PUBLIC: GET ALL ACTIVE ROLES
  @Get()
  async getAll() {
    const result = await this.adminRoleService.getAll();

    return {
      success: true,
      data: result,
    };
  }

  // DASHBOARD: GET ALL ROLES WITH SEARCH + PAGINATION
  @Get('admin')
  async getDashboard(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('searchTerm') searchTerm?: string,
  ) {
    const result = await this.adminRoleService.getDashboard(
      Number(page),
      Number(limit),
      searchTerm,
    );

    return {
      success: true,
      data: result.data,
      totalData: result.total,
    };
  }

  // CREATE
  @Post('admin')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: CreateAdminRoleDto) {
    await this.adminRoleService.create(body);

    return {
      success: true,
      message: 'Role created successfully',
    };
  }

  // UPDATE
  @Patch('admin')
  async update(@Body() body: UpdateAdminRoleDto) {
    const { _id, ...data } = body;

    await this.adminRoleService.update(_id, data);

    return {
      success: true,
      message: 'Role updated successfully',
    };
  }

  // DELETE
  @Delete('admin')
  async remove(@Body() body: AdminRoleIdDto) {
    await this.adminRoleService.remove(body._id);

    return {
      success: true,
      message: 'Role deleted successfully',
    };
  }
}
