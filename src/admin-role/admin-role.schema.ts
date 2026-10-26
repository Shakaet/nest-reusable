
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type AdminRoleDocument = HydratedDocument<AdminRole>;

@Schema({
  timestamps: true,
  collection: 'adminroles',
})
export class AdminRole {
  @Prop({
    type: String,
    required: true,
    unique: true,
    trim: true,
  })
  admin_role_name: string;

  @Prop({
    type: String,
    enum: ['active', 'in-active'],
    default: 'active',
  })
  admin_role_status: 'active' | 'in-active';

  @Prop({
    type: [String],
    default: [],
  })
  permissions: string[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  })
  publisher_id: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  })
  updated_id?: mongoose.Types.ObjectId;
}

export const AdminRoleSchema =
  SchemaFactory.createForClass(AdminRole);

