import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, trim: true, minlength: 3, maxlength: 20 })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 1 })
  level: number;

  @Prop({ default: 0 })
  exp: number;

  @Prop({ default: 0 })
  gold: number;

  @Prop({ type: [String], default: [] })
  heroes: string[];

  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
