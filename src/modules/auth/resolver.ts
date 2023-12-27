import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { MailerService } from '@nestjs-modules/mailer';

import { UserService } from '../user/service';
import { CustomContext, Id } from '../../common/types';
import {
  ErrorCode,
  ErrorDescription,
  ForbiddenError,
  UnknownError,
  ValidationError,
} from '../../core/graphql';
import { LoggerService } from '../../core/logger';

import { AuthService } from './service';
import { AllowAny, CurrentUser } from './graphql';
import { AuthSignInResponse } from './response';
import {
  AuthSignInInput,
  AuthSignUpInput,
  AuthRecoverPasswordInput,
  AuthGenerateRecoveryCodeInput,
  AuthChangePasswordInput,
} from './input';
import { FeatureToggleName } from '../featureToggle';
import { Features } from '../featureToggle';
import { ConfigService } from '@nestjs/config';

@Resolver()
export class AuthResolver {
  constructor(
    private logger: LoggerService,
    private mailer: MailerService,
    private users: UserService,
    private auth: AuthService,
    private config: ConfigService,
  ) {}

  @Mutation(() => AuthSignInResponse)
  @AllowAny()
  @Features([FeatureToggleName.SIGN_UP])
  async signUp(
    @Context() ctx: CustomContext,
    @Args('data') data: AuthSignUpInput,
  ): Promise<AuthSignInResponse> {
    try {
      const nickname = data.nickname.toLowerCase();

      await this.users.checkAvailability({
        email: data.email,
        nickname,
      });

      const password = await this.auth.encryptPassword(data.password);
      const user = await this.users.create({ ...data, nickname, password });

      const accessToken = this.auth.setAccessToken({ ctx, userId: user._id });

      this.logger.analytic({
        text: `Nuevo usuario: ${user.fullName} - @${user.nickname}`,
      });

      return {
        userId: user._id,
        accessToken,
      };
    } catch (e) {
      if (e.message === ErrorCode.VALIDATION_ERROR) {
        throw e;
      }

      this.logger.error({
        path: 'AuthSignUp',
        data: { ...data },
      });
      throw new UnknownError();
    }
  }

  @Mutation(() => AuthSignInResponse)
  @AllowAny()
  async signIn(
    @Context() ctx: CustomContext,
    @Args('data') data: AuthSignInInput,
  ): Promise<AuthSignInResponse> {
    try {
      const throwError = () => {
        throw new ValidationError({
          password: ErrorDescription.SIGN_IN_INVALID,
        });
      };

      const user = await this.users.getByEmail({
        email: data.email,
        select: ['_id', 'password'],
      });

      if (!user) throwError();

      try {
        await this.auth.comparePasswords({
          raw: data.password,
          encrypted: user.password,
        });
      } catch (e) {
        throwError();
      }

      const accessToken = this.auth.setAccessToken({ ctx, userId: user.id });

      return { userId: user.id, accessToken };
    } catch (e) {
      if (e.message === ErrorCode.VALIDATION_ERROR) {
        throw e;
      }

      this.logger.error({
        path: 'AuthSignIn',
        data: { ...data },
      });
      throw new UnknownError();
    }
  }

  @Mutation(() => AuthSignInResponse)
  @AllowAny()
  async adminSignIn(
    @Context() ctx: CustomContext,
    @Args('data') data: AuthSignInInput,
  ): Promise<AuthSignInResponse> {
    try {
      const throwError = () => {
        throw new ValidationError({
          password: ErrorDescription.SIGN_IN_INVALID,
        });
      };

      const user = await this.users.getByEmail({
        email: data.email,
        select: ['_id', 'email', 'password'],
      });

      if (!user) throwError();

      try {
        await this.auth.comparePasswords({
          raw: data.password,
          encrypted: user.password,
        });
      } catch (e) {
        throwError();
      }

      if (user.email !== this.config.get('app.adminEmail')) {
        throw new ForbiddenError();
      }

      const accessToken = this.auth.setAccessToken({ ctx, userId: user.id });

      return { userId: user.id, accessToken };
    } catch (e) {
      if (
        [ErrorCode.VALIDATION_ERROR, ErrorCode.FORBIDDEN_ERROR].includes(
          e.message,
        )
      ) {
        throw e;
      }

      this.logger.error({
        path: 'AdminAuthSignIn',
        data: { ...data },
      });
      throw new UnknownError();
    }
  }

  @Mutation(() => Boolean)
  @AllowAny()
  @Features([FeatureToggleName.MAILING])
  async generateRecoveryCode(
    @Args('data') data: AuthGenerateRecoveryCodeInput,
  ): Promise<boolean> {
    try {
      const user = await this.users.getByEmail(data);

      if (!user)
        throw new ValidationError({
          email: ErrorDescription.EMAIL_NOT_FOUND,
        });

      const code = Math.floor(Math.random() * (9999 - 1000) + 1000).toString();

      await this.users.setRecoveryCode({ id: user.id, code });

      const res = await this.mailer.sendMail({
        to: data.email,
        subject: 'Recuperar contraseña',
        html: `<h1>Recuperar contraseña</h1><p>El código de recuperación es: <b>${code}</b></p>`,
      });

      if (!res.accepted.length) throw new Error();

      return true;
    } catch (e) {
      if (e.message === ErrorCode.VALIDATION_ERROR) {
        throw e;
      }

      this.logger.error({
        path: 'AuthGenerateRecoveryCode',
        data: { ...data, e },
      });
      throw new UnknownError();
    }
  }

  @Mutation(() => Boolean)
  @AllowAny()
  async recoverPassword(
    @Args('data') data: AuthRecoverPasswordInput,
  ): Promise<boolean> {
    try {
      const user = await this.users.getByEmail({
        email: data.email,
        select: ['recoveryCode'],
      });

      // TODO
      if (!(user.recoveryCode && user.recoveryCode === data.code))
        throw new ValidationError({});

      const encryptedPassword = await this.auth.encryptPassword(data.password);

      await this.users.setPassword({
        id: user.id,
        password: encryptedPassword,
      });

      return true;
    } catch (e) {
      if (e.message === ErrorCode.VALIDATION_ERROR) {
        throw e;
      }

      this.logger.error({
        path: 'AuthRecoveryPassword',
        data: { ...data },
      });
      throw new UnknownError();
    }
  }

  @Mutation(() => Boolean)
  async changePassword(
    @CurrentUser() userId: Id,
    @Args('data') data: AuthChangePasswordInput,
  ): Promise<Boolean> {
    try {
      const user = await this.users.getById({
        id: userId,
        select: ['password'],
      });

      await this.auth.comparePasswords({
        raw: data.currentPassword,
        encrypted: user.password,
      });

      const encryptedPassword = await this.auth.encryptPassword(
        data.newPassword,
      );
      await this.users.setPassword({
        id: user.id,
        password: encryptedPassword,
      });

      return true;
    } catch (e) {
      this.logger.error({
        path: 'AuthChangePassword',
        data: { ...data },
      });
      throw new UnknownError();
    }
  }
}
