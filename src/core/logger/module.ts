import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegramModule } from 'nestjs-telegram';

import { telegramModuleOptions } from '../telegram';

import { LoggerService } from './service';

@Module({
  imports: [
    ConfigModule,
    TelegramModule.forRootAsync(telegramModuleOptions as any),
  ],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
