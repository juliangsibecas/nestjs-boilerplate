import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';

import { ErrorDescription, ValidationError } from '../../core/graphql';
import { Id, Maybe } from '../../common/types';

import {
  PartyAddinvitedDto,
  PartyChangeAttendingStateDto,
  PartyCreateDto,
  PartyGetByIdDto,
  PartyGetBySlugDto,
  PartyRemoveOrganizerDto,
  PartySearchDto,
} from './dto';
import { PartyMapPreview, PartyPreview } from './response';
import { Party, PartyDocument } from './schema';
import { PartyAvailability, PartyStatus } from './types';

@Injectable()
export class PartyService {
  constructor(@InjectModel(Party.name) private model: Model<PartyDocument>) {}
  private readonly logger = new Logger(PartyService.name);

  async create(dto: PartyCreateDto): Promise<PartyDocument> {
    return this.model.create(dto);
  }

  async getById({
    id,
    select = [],
    relations = [],
  }: PartyGetByIdDto): Promise<Maybe<PartyDocument>> {
    return this.model.findOne({ _id: id }, select).populate(relations);
  }

  async checkAvailability(name: string): Promise<void> {
    const party = await this.model.findOne({ name });

    if (!party) return;

    throw new ValidationError({
      name: ErrorDescription.PARTY_NAME_NOT_AVAILABLE,
    });
  }
}
