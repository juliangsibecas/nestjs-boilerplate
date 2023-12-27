import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { v4 } from 'uuid';

import { Id } from '../../common/types';

@Schema()
@ObjectType()
export class Info {
  @Prop({ type: String, default: v4 })
  @Field(() => String)
  _id: Id;

  @Prop()
  @Field()
  minVersion: string;
}

export type InfoDocument = Info & mongoose.Document;
export const InfoSchema = SchemaFactory.createForClass(Info);
