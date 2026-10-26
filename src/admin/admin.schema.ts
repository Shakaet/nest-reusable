import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AdminDocument = HydratedDocument<Admin>;

@Schema({
  timestamps: true,
  collection: 'admins',
})
export class Admin {
  @Prop({ required: true })
  admin_name: string;

  @Prop({ required: true, unique: true })
  admin_phone: string;

  @Prop({ required: true, select: false })
  admin_password: string;

  @Prop({
    type: String,
    enum: ['active', 'in-active'],
    default: 'active',
  })
  admin_status: 'active' | 'in-active';

  @Prop({
    type: Types.ObjectId,
    ref: 'AdminRole',
    required: true,
  })
  admin_role_id: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Admin',
    required: true,
  })
  publisher_id: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Admin',
  })
  updated_id?: Types.ObjectId;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);