import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { UnknownError } from '../../core/graphql';
import { LoggerService } from '../../core/logger';
import { AllowAny } from '../auth/graphql';
import { Role, Roles } from '../auth/role';

import { Info } from './schema';
import { InfoService } from './service';
import { checkMeetMinVersion } from './utils';

@Resolver(() => Info)
export class InfoResolver {
  constructor(
    private logger: LoggerService,
    private infe: InfoService,
  ) {}

  @Mutation(() => Boolean)
  @Roles([Role.ADMIN])
  async infeInitialize(): Promise<boolean> {
    try {
      await this.infe.initInfo();

      return true;
    } catch (e) {
      this.logger.error({
        path: 'AppInfoInitialize',
        data: {},
      });
      throw new UnknownError();
    }
  }

  @Query(() => Boolean)
  @AllowAny()
  async infeMeetMinVersion(@Args('version') version: string): Promise<boolean> {
    try {
      const minVersion = await this.infe.getMinVersion();

      return checkMeetMinVersion(minVersion, version);
    } catch (e) {
      this.logger.error({
        path: 'AppInfoMeetMinVersion',
        data: e,
      });
      throw new UnknownError();
    }
  }

  @Mutation(() => Boolean)
  @Roles([Role.ADMIN])
  async infeChangeMinVersion(
    @Args('version') version: string,
  ): Promise<boolean> {
    try {
      await this.infe.setMinVersion(version);

      return true;
    } catch (e) {
      this.logger.error({
        path: 'AppInfoChangeMinVersion',
        data: { version },
      });
      throw new UnknownError();
    }
  }
}
