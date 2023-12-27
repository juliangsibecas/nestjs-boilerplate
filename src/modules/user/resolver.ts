import { forwardRef, Inject } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { Id } from '../../common/types';
import { ErrorCode, NotFoundError, UnknownError } from '../../core/graphql';
import { LoggerService } from '../../core/logger';

import { CurrentUser } from '../auth/graphql/decorators';
import { Features, FeatureToggleName } from '../featureToggle';
import { AuthService } from '../auth';
import { PartyService } from '../party';

import { UserGetInput } from './input';
import { UserGetResponse, UserPreviewResponse } from './response';
import { User, UserDocument } from './schema';
import { UserService } from './service';

@Resolver(() => User)
export class UserResolver {
  constructor(
    private logger: LoggerService,
    private users: UserService,
    @Inject(forwardRef(() => AuthService)) private auth: AuthService,
    @Inject(forwardRef(() => PartyService)) private parties: PartyService,
  ) {}

  @Query(() => [UserPreviewResponse])
  @Features([FeatureToggleName.USER_GET])
  userSearch(
    @CurrentUser() user: UserDocument,
    @Args('q', { nullable: true }) q: string = '',
  ): Promise<Array<UserPreviewResponse>> {
    try {
      return this.users.search({ id: user._id, search: q });
    } catch (e) {
      this.logger.error({
        path: 'UserSearch',
        data: {
          q,
        },
      });
      throw new UnknownError();
    }
  }

  @Query(() => UserGetResponse)
  @Features([FeatureToggleName.USER_GET])
  async userGet(
    @CurrentUser() { _id: myId }: UserDocument,
    @Args('data') data: UserGetInput,
  ): Promise<UserGetResponse> {
    try {
      let user: UserDocument;
      const select: Array<keyof User> = [
        '_id',
        'nickname',
        'fullName',
        'pictureId',
        'following',
        'followers',
        'attendedParties',
      ];

      if (data.id) {
        user = await this.users.getById({
          id: data.id,
          select,
        });
      } else if (data.nickname) {
        user = await this.users.getByNickname({
          nickname: data.nickname,
          select,
        });
      }

      if (!user) throw new NotFoundError();

      return {
        ...user.toObject(),
        followingCount: user.following.length,
        followersCount: user.followers.length,
        attendedPartiesCount: user.attendedParties.length,
        isFollowing: Boolean(
          (user.followers as Array<Id>).find((id) => id === myId),
        ),
        isFollower: Boolean(
          (user.following as Array<Id>).find((id) => id === myId),
        ),
      };
    } catch (e) {
      if (e.message === ErrorCode.NOT_FOUND_ERROR) {
        throw e;
      }

      this.logger.error({
        path: 'UserGet',
        data: {
          myId,
          data,
        },
      });

      throw new UnknownError();
    }
  }
}
