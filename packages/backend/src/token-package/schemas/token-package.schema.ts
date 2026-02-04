import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Role } from '../../role/schemas/role.schema';

export type TokenPackageDocument = TokenPackage & Document;

@Schema({ timestamps: true })
export class TokenPackage {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true, min: 1 })
  tokenAmount: number;

  @Prop({ type: Types.ObjectId, ref: 'Role', required: true })
  role: Types.ObjectId;

  @Prop({ type: [String] })
  features: string[];

  @Prop({ default: true })
  active: boolean;

  @Prop({ type: Number })
  validityDays?: number; // Número de dias de validade (null/undefined = vitalício)

  @Prop({ type: Number })
  value?: number; // Valor do plano em reais

  @Prop({ type: String })
  externalId?: string; // ID externo para integração com AbacatePay

  createdAt: Date;
  updatedAt: Date;
}

export const TokenPackageSchema = SchemaFactory.createForClass(TokenPackage);

// Transform toJSON to include id and exclude _id and __v
TokenPackageSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    (ret as any).id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});

// Índices
TokenPackageSchema.index({ name: 1 });
TokenPackageSchema.index({ externalId: 1 });