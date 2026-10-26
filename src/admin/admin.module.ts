import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';
import { Admin, AdminSchema } from './admin.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Admin.name,
        schema: AdminSchema,
      },
    ]),
    JwtModule.register({}),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
