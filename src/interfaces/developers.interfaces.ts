export interface IDevelopers {
  name: string;
  email: string;
}

export interface IDevelopersRes extends IDevelopers {
  id: number;
}

export interface IDeveloper {
  developerId: number;
  developerName: string;
  developerEmail: string;
  developerInfoDeveloperSince: Date | null;
  developerInfoPreferredOS: string | null;
}

export interface IDevInfo {
  developerSince: Date;
  preferredOS: string;
}

export interface IDevInfoRes extends IDevInfo {
  id: number;
  developerSince: Date;
  preferredOS: string;
  developerId: number;
}
