import * as moment from 'moment';
import { PopulateOptions } from 'mongoose';
import slugify from 'slugify';
import { forwardRef, Inject } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { Id } from '../../common/types';
import { ErrorCode, NotFoundError, UnknownError } from '../../core/graphql';
import { LoggerService } from '../../core/logger';

import { CurrentUser } from '../auth/graphql';
import { Features, FeatureToggleName } from '../featureToggle';
import { UserService } from '../user';
import { UserDocument } from '../user/schema';

import { PartyCreateInput, PartyGetInput } from './input';
import { Party, PartyDocument } from './schema';
import { PartyService } from './service';
import { PartyGetResponse } from './response';

@Resolver(() => Party)
export class PartyResolver {
  constructor(
    private logger: LoggerService,
    private parties: PartyService,
    @Inject(forwardRef(() => UserService)) private users: UserService,
  ) {}

  @Mutation(() => String)
  @Features([FeatureToggleName.PARTY_GET])
  async partyCreate(
    @CurrentUser() user: UserDocument,
    @Args('data') data: PartyCreateInput,
  ): Promise<string> {
    try {
      await this.parties.checkAvailability(data.name);

      const slug = `${slugify(data.name.toLowerCase())}-${moment(
        data.date,
      ).format('DDMMYY')}`;

      const party = await this.parties.create({
        ...data,
        slug,
        organizer: user._id,
      });

      await this.users.addOrganizedParty({
        user,
        party,
      });

      await this.logger.analytic({
        text: `${user.nickname} creó la fiesta "${party.name}"`,
      });

      return party._id;
    } catch (e) {
      if (e.message === ErrorCode.VALIDATION_ERROR) {
        throw e;
      }

      this.logger.error({
        path: 'partyCreate',
        data: {
          userId: user._id,
          data,
          e,
        },
      });
      throw new UnknownError();
    }
  }

  @Query(() => PartyGetResponse)
  @Features([FeatureToggleName.PARTY_GET])
  async partyGet(
    @CurrentUser() user: UserDocument,
    @Args('data') data: PartyGetInput,
  ): Promise<PartyGetResponse> {
    try {
      let party: PartyDocument;
      const relations: Array<keyof Party | PopulateOptions> = [
        'organizer',
        {
          path: 'attenders',
          options: {
            limit: 10,
          },
          select: ['pictureId'],
        },
      ];

      party = await this.parties.getById({
        id: data.id,
        relations,
      });

      if (!party) throw new NotFoundError();

      return {
        ...party.toObject(),
        isAttender: Boolean(
          (user.attendedParties as Array<Id>).find((id) => id === party.id),
        ),
        isOrganizer: user._id === party.organizer?._id,
      };
    } catch (e) {
      if (
        [ErrorCode.FORBIDDEN_ERROR, ErrorCode.NOT_FOUND_ERROR].includes(
          e.message,
        )
      )
        throw e;
      this.logger.error({
        path: 'partyGet',
        data: {
          userId: user._id,
          data,
        },
      });
      throw new UnknownError();
    }
  }
}
