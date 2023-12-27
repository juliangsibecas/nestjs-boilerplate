import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { LoggerModule } from '../../core/logger';
import { Info, InfoSchema } from './schema';
import { InfoService } from './service';
import { InfoResolver } from './resolver';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    MongooseModule.forFeature([{ name: Info.name, schema: InfoSchema }]),
  ],
  exports: [InfoService],
  providers: [InfoService, InfoResolver],
})
export class InfoModule {}
