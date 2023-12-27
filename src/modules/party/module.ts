import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { LoggerModule } from '../../core/logger';

import { UserModule } from '../user/module';

import { Party, PartySchema } from './schema';
import { PartyService } from './service';
import { PartyResolver } from './resolver';

@Module({
  imports: [
    LoggerModule,
    forwardRef(() => UserModule),
    MongooseModule.forFeature([{ name: Party.name, schema: PartySchema }]),
  ],
  exports: [PartyService],
  providers: [PartyService, PartyResolver],
})
export class PartyModule {}
