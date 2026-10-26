
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  AdminRole,
  AdminRoleDocument,
} from './admin-role.schema.js';
import { CreateAdminRoleDto } from './create-admin-role.dto.js';
import { UpdateAdminRoleDto } from './update-admin-role.dto.js';
import { adminRoleSearchableField } from './admin-role.interface.js';

@Injectable()
export class AdminRoleService {
  constructor(
    @InjectModel(AdminRole.name)
    private readonly adminRoleModel: Model<AdminRoleDocument>,
  ) {}

  // CREATE
  async create(data: CreateAdminRoleDto) {
    const roleName = data.admin_role_name.trim();

    const exists = await this.adminRoleModel.exists({
      admin_role_name: roleName,
    });

    if (exists) {
      throw new BadRequestException('Role already exists');
    }

    try {
      return await this.adminRoleModel.create({
        ...data,
        admin_role_name: roleName,
      });
    } catch (error: any) {
      // Handles duplicate-key errors if concurrent requests race.
      if (error?.code === 11000) {
        throw new BadRequestException('Role already exists');
      }
      throw error;
    }
  }

  // GET ALL ACTIVE ROLES
  async getAll() {
    return this.adminRoleModel
      .find({ admin_role_status: 'active' })
      .sort({ _id: -1 });
  }

  // DASHBOARD: SEARCH + PAGINATION
  async getDashboard(
    page = 1,
    limit = 10,
    searchTerm?: string,
  ) {
    page = Number.isFinite(page)
      ? Math.max(1, Math.floor(page))
      : 1;

    limit = Number.isFinite(limit)
      ? Math.min(100, Math.max(1, Math.floor(limit)))
      : 10;

    const filter: Record<string, any> = {};

    if (searchTerm?.trim()) {
      const escaped = searchTerm
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      filter.$or = adminRoleSearchableField.map((field) => ({
        [field]: { $regex: escaped, $options: 'i' },
      }));
    }

    const [data, total] = await Promise.all([
      this.adminRoleModel
        .find(filter)
        .populate(['publisher_id', 'updated_id'])
        .sort({ _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.adminRoleModel.countDocuments(filter),
    ]);

    return { data, total };
  }

  // UPDATE
  async update(id: string, data: Partial<CreateAdminRoleDto>) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid role ID');
    }

    const role = await this.adminRoleModel.findById(id);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const updateData = data;

    if (updateData.admin_role_name !== undefined) {
      updateData.admin_role_name =
        updateData.admin_role_name.trim();

      const exists = await this.adminRoleModel.exists({
        _id: { $ne: id },
        admin_role_name: updateData.admin_role_name,
      });

      if (exists) {
        throw new BadRequestException('Role already exists');
      }
    }

    try {
      const result = await this.adminRoleModel.updateOne(
        { _id: id },
        { $set: updateData },
        { runValidators: true },
      );

      return result;
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new BadRequestException('Role already exists');
      }
      throw error;
    }
  }

  // DELETE
  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid role ID');
    }

    const result = await this.adminRoleModel.deleteOne({
      _id: id,
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Role not found');
    }

    return result;
  }
}
