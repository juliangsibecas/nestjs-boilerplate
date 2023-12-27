import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { jwtModuleOptions } from '../../core/jwt';
import { LoggerModule } from '../../core/logger';

import { UserModule } from '../user';

import { AuthResolver } from './resolver';
import { JwtStrategy } from './jwt';
import { AuthService } from './service';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    JwtModule.registerAsync(jwtModuleOptions),
    PassportModule,
    UserModule,
  ],
  providers: [AuthService, AuthResolver, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
