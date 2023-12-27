import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { LoggerModule } from '../../core/logger';

import { FeatureToggle, FeatureToggleSchema } from './schema';
import { FeatureToggleService } from './service';
import { FeatureToggleResolver } from './resolver';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    MongooseModule.forFeature([
      { name: FeatureToggle.name, schema: FeatureToggleSchema },
    ]),
  ],
  exports: [FeatureToggleService],
  providers: [FeatureToggleService, FeatureToggleResolver],
})
export class FeatureToggleModule {}
