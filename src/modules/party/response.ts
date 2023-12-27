import { Field, ObjectType, PickType } from '@nestjs/graphql';
import { Party } from './schema';

@ObjectType()
export class PartyPreview extends PickType(Party, ['_id', 'name']) {
  @Field({ nullable: true })
  organizerNickname?: string;
}

@ObjectType()
export class PartyMapPreview extends PickType(Party, [
  '_id',
  'name',
  'coordinate',
  'date',
]) {
  @Field({ nullable: true })
  organizerNickname?: string;
}

@ObjectType()
export class PartyGetResponse extends PickType(Party, [
  '_id',
  'status',
  'availability',
  'name',
  'slug',
  'organizer',
  'address',
  'date',
  'description',
  'attenders',
  'attendersCount',
]) {
  @Field()
  isAttender: boolean;
  @Field()
  isOrganizer: boolean;
}
