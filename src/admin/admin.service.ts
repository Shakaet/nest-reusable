import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { getCredentials } from '../config/config.js';
import { JwtService } from '@nestjs/jwt';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { Admin, AdminDocument } from './admin.schema.js';
import { CreateAdminDto } from './create-admin.dto.js';
import { LoginAdminDto } from './login-admin.dto.js';
import { UpdateAdminDto } from './update-admin.dto.js';

@Injectable()
export class AdminService {
    private readonly credentials = getCredentials();
  constructor(
    @InjectModel(Admin.name)
    private readonly adminModel: Model<AdminDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async getMe(token: string) {
    let payload: { admin_phone: string };

    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: this.credentials.jwt_token,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const admin = await this.adminModel
      .findOne({ admin_phone: payload.admin_phone })
      .populate('admin_role_id')
      .select('-admin_password');

    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }

    return admin;
  }

  async create(data: CreateAdminDto) {
    const exists = await this.adminModel.exists({
      admin_phone: data.admin_phone,
    });

    if (exists) {
      throw new BadRequestException('Admin already exists');
    }

    const admin = {
      ...data,
      admin_password: await bcrypt.hash(data.admin_password, 10),
    };

    return this.adminModel.create(admin);
  }

  async login(data: LoginAdminDto) {
    console.log('Login data received:', data); // Debugging line
    const admin = await this.adminModel
      .findOne({ admin_phone: data.admin_phone })
      .select('+admin_password');

    if (!admin) {
      throw new UnauthorizedException('Invalid phone or password');
    }

    if (admin.admin_status !== 'active') {
      throw new UnauthorizedException('Inactive Admin');
    }

    const matched = await bcrypt.compare(
      data.admin_password,
      admin.admin_password,
    );

    if (!matched) {
      throw new UnauthorizedException('Invalid phone or password');
    }

    return this.jwtService.signAsync(
      { admin_phone: admin.admin_phone },
      {
        secret: this.credentials.jwt_token,
        expiresIn: '365d',
      },
    );
  }

  async getPublic() {
    return this.adminModel
      .find({ admin_status: 'active' })
      .populate([
        'admin_role_id',
        'publisher_id',
        'updated_id',
      ])
      .select('-admin_password');
  }

  async getDashboard(
    page = 1,
    limit = 50,
    searchTerm?: string,
  ) {
    page = Math.max(1, page);
    limit = Math.min(100, Math.max(1, limit));

    const filter: Record<string, unknown> = {};

    if (searchTerm?.trim()) {
      const escaped = searchTerm.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&',
      );

      filter.$or = [
        { admin_name: { $regex: escaped, $options: 'i' } },
        { admin_phone: { $regex: escaped, $options: 'i' } },
        { admin_status: { $regex: escaped, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.adminModel
        .find(filter)
        .populate([
          'admin_role_id',
          'publisher_id',
          'updated_id',
        ])
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-admin_password'),
      this.adminModel.countDocuments(filter),
    ]);

    return { data, total };
  }

  async update(id: string, data: UpdateAdminDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid admin ID');
    }

    const { _id, ...updateData } = data;

    if (updateData.admin_password) {
      updateData.admin_password = await bcrypt.hash(
        updateData.admin_password,
        10,
      );
    }

    const result = await this.adminModel.updateOne(
      { _id: id },
      { $set: updateData },
      { runValidators: true },
    );

    if (result.matchedCount === 0) {
      throw new NotFoundException('Admin not found');
    }

    return result;
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid admin ID');
    }

    const result = await this.adminModel.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Admin not found');
    }

    return result;
  }
}