import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserFollowDocument = UserFollow & Document;

@Schema({ timestamps: true })
export class UserFollow {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  followerId: Types.ObjectId; // Quem está seguindo

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  followingId: Types.ObjectId; // Quem está sendo seguido

  @Prop({ default: true })
  active: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const UserFollowSchema = SchemaFactory.createForClass(UserFollow);

// Índice composto para evitar seguir o mesmo usuário duas vezes
UserFollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

// Índices para buscas frequentes
UserFollowSchema.index({ followerId: 1, active: 1 });
UserFollowSchema.index({ followingId: 1, active: 1 });