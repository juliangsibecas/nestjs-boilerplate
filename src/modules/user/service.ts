import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Maybe } from '../../common/types';

import {
  UserAddOrganizedPartyDto,
  UserCheckAvailabilityDto,
  UserCreateDto,
  UserGetByEmailDto,
  UserGetByIdDto,
  UserGetByNicknameDto,
  UserSearchDto,
  UserSetPasswordDto,
  UserSetRecoveryCodeDto,
} from './dto';
import { User, UserDocument } from './schema';
import { ErrorDescription, ValidationError } from 'src/core/graphql';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private model: Model<UserDocument>) {}

  async create(dto: UserCreateDto): Promise<UserDocument> {
    return this.model.create(dto);
  }
  async search(dto: UserSearchDto): Promise<Array<UserDocument>> {
    const like = { $regex: dto.search, $options: 'i' };

    return this.model.find(
      {
        _id: {
          $ne: dto.id,
        },
        $or: [{ nickname: like }, { fullName: like }],
      },
      ['_id', 'nickname', 'fullName', 'pictureId'],
    );
  }

  async getById({
    id,
    select = [],
    relations = [],
  }: UserGetByIdDto): Promise<Maybe<UserDocument>> {
    return this.model.findOne({ _id: id }, select).populate(relations);
  }

  async getByEmail({
    email,
    select,
  }: UserGetByEmailDto): Promise<Maybe<UserDocument>> {
    return this.model.findOne({ email }, select);
  }

  async getByNickname({
    nickname,
    select = [],
    relations = [],
  }: UserGetByNicknameDto): Promise<Maybe<UserDocument>> {
    return this.model.findOne({ nickname }, select).populate(relations);
  }

  async checkNicknameAvailability(nickname: string): Promise<boolean> {
    const sameNickname = Boolean(await this.model.findOne({ nickname }));

    if (!sameNickname) return true;

    throw new ValidationError({
      nickname: ErrorDescription.USER_NAME_NOT_AVAILABLE,
    });
  }

  async checkEmailAvailability(email: string): Promise<boolean> {
    const sameEmail = Boolean(await this.model.findOne({ email }));

    if (!sameEmail) return true;

    throw new ValidationError({
      email: ErrorDescription.EMAIL_NOT_AVAILABLE,
    });
  }

  async checkAvailability({
    email,
    nickname,
  }: UserCheckAvailabilityDto): Promise<void> {
    await this.checkEmailAvailability(email);
    await this.checkNicknameAvailability(nickname);
  }

  async addOrganizedParty({ user, party }: UserAddOrganizedPartyDto) {}

  async setRecoveryCode({ id, code }: UserSetRecoveryCodeDto): Promise<void> {
    await this.model.findByIdAndUpdate(id, { recoveryCode: code });
  }

  async setPassword({ id, password }: UserSetPasswordDto): Promise<void> {
    await this.model.findByIdAndUpdate(id, {
      password: password,
      recoveryCode: null,
    });
  }
}
