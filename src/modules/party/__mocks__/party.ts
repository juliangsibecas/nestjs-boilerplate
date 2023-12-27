import { v4 } from 'uuid';

import { MOCKED_USERS } from '../../../modules/user/__mocks__/user';

import { Party } from '../schema';
import { PartyAvailability, PartyStatus } from '../types';

export const mockParty = (
  data: Pick<Party, 'name' | 'slug' | 'availability'>,
): Party => ({
  _id: v4(),
  status: PartyStatus.ENABLED,
  date: new Date(),
  description: 'Descripcion',
  address: '17 N2906 ESQ 503',
  coordinate: {
    longitude: 0,
    latitude: 0,
  },
  attenders: [],
  attendersCount: 0,
  organizer: MOCKED_USERS[0],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...data,
});

export const MOCKED_PARTIES = [
  mockParty({
    name: 'Fiesta 1',
    slug: 'fiesta-1',
    availability: PartyAvailability.PUBLIC,
  }),
  mockParty({
    name: 'Fiesta 2',
    slug: 'fiesta-2',
    availability: PartyAvailability.FOLLOWERS,
  }),
  mockParty({
    name: 'Fiesta 3',
    slug: 'fiesta-3',
    availability: PartyAvailability.FOLLOWING,
  }),
  mockParty({
    name: 'Fiesta 4',
    slug: 'fiesta-4',
    availability: PartyAvailability.PRIVATE,
  }),
];
