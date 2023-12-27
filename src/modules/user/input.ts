import { Field, InputType } from '@nestjs/graphql';

import { Id } from '../../common/types';

@InputType()
export class UserGetInput {
  @Field(() => String, { nullable: true })
  id?: Id;

  @Field(() => String, { nullable: true })
  nickname?: string;
}

@InputType()
export class UserChangeFollowingStateInput {
  @Field(() => String)
  followingId: Id;

  @Field()
  state: boolean;
}
