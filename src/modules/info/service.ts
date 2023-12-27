import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Info, InfoDocument } from './schema';

@Injectable()
export class InfoService {
  constructor(
    @InjectModel(Info.name)
    private appInfo: Model<InfoDocument>,
  ) {}

  initInfo() {
    return this.appInfo.create({ minVersion: '0.0.0' });
  }

  async getMinVersion() {
    const appInfo = await this.appInfo.findOne();

    return appInfo.minVersion;
  }

  setMinVersion(version: string) {
    return this.appInfo.findOneAndUpdate({}, { minVersion: version });
  }
}
