import { APP_GUARD, Reflector } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { MailerModule } from '@nestjs-modules/mailer';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';

import { configModuleOptions } from '../core/config';
import { gqlModuleOptions } from '../core/graphql';
import { mailerModuleOptions } from '../core/mailer';
import { mongooseModuleOptions } from '../core/mongoose';

import { AuthModule, GqlAuthGuard } from '../modules/auth';
import { RoleGuard } from '../modules/auth/role';
import {
  FeatureToggleGuard,
  FeatureToggleModule,
} from '../modules/featureToggle';
import { InfoModule } from '../modules/info';
import { PartyModule } from '../modules/party';
import { SupportModule } from '../modules/support';
import { UserModule } from '../modules/user';
import { TypesSyncModule } from '../modules/typesSync';

import { AppController } from './controller';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOptions),
    MailerModule.forRootAsync(mailerModuleOptions),
    MongooseModule.forRootAsync(mongooseModuleOptions),
    GraphQLModule.forRootAsync(gqlModuleOptions),
    ScheduleModule.forRoot(),

    InfoModule,
    TypesSyncModule,
    FeatureToggleModule,
    AuthModule,
    UserModule,
    PartyModule,
    SupportModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useFactory: (ref) => new GqlAuthGuard(ref),
      inject: [Reflector],
    },
    { provide: APP_GUARD, useClass: FeatureToggleGuard },
    { provide: APP_GUARD, useClass: RoleGuard },
  ],
  controllers: [AppController],
})
export class AppModule {}
