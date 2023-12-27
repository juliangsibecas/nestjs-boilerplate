import { Party, PartyService } from '../../modules/party';
import { User, UserService } from '../../modules/user';

export type Entities = {
  users: Array<User>;
  parties: Array<Party>;
};

export type EntitiesServices = {
  users: UserService;
  parties: PartyService;
};
