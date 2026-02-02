import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Transform } from 'class-transformer';

export type RoleDocument = Role & Document;

@Schema({ timestamps: true })
export class Role {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  color: string; // Hex color like #FF0000

  @Prop({ default: true })
  active: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const RoleSchema = SchemaFactory.createForClass(Role);

// Transform toJSON to include id and exclude _id and __v
RoleSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    (ret as any).id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});