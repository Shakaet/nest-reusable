
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  AdminRole,
  AdminRoleSchema,
} from './admin-role.schema.js';
import { AdminRoleService } from './admin-role.service.js';
import { AdminRoleController } from './admin-role.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AdminRole.name,
        schema: AdminRoleSchema,
      },
    ]),
  ],
  controllers: [AdminRoleController],
  providers: [AdminRoleService],
  exports: [AdminRoleService],
})
export class AdminRoleModule {}
