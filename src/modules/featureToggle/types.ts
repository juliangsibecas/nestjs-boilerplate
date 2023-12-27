export enum FeatureToggleName {
  MAILING = 'MAILING',

  SIGN_UP = 'SIGN_UP',

  USER_GET = 'USER_GET',

  PARTY_GET = 'PARTY_GET',
  PARTY_CREATE = 'PARTY_CREATE',
}

export type FeatureToggleMetadata = {
  names: Array<FeatureToggleName>;
};
