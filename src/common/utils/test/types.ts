import { Server } from 'https';
import { Party } from '../../../modules/party';
import { User } from '../../../modules/user';

export type Params = {
  server: Server;
  users: Array<User>;
  parties: Array<Party>;
};
