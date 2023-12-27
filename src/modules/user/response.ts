import { Field, ObjectType, PickType } from '@nestjs/graphql';
import { User } from './schema';

@ObjectType()
export class UserPreviewResponse extends PickType(User, [
  '_id',
  'nickname',
  'pictureId',
]) {
  @Field({ nullable: true })
  fullName?: string;
}

@ObjectType()
export class UserGetResponse extends PickType(User, [
  '_id',
  'nickname',
  'pictureId',
  'fullName',
]) {
  @Field()
  followingCount: number;

  @Field()
  followersCount: number;

  @Field()
  attendedPartiesCount: number;

  @Field()
  isFollowing: boolean;

  @Field()
  isFollower: boolean;
}
