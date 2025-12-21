
export interface ReconSide {
  floor: string;
  fire: string;
  smokeV1: string;
  smokeV2: string;
  smokeC: string;
  smokeD: string;
  door: string;
  window: string;
  groups: string;
  riskSelected: string[];
  riskOther: string;
  time: string;
  image: string | null;
}

export interface MedicRecord {
  id: number;
  time: string;
  monitor: string;
  image: string | null;
  analysis_action: string;
  communicate: string;
}

export interface MaydayLog {
  id: number;
  time: string;
  event: string;
}

export interface MaydayState {
  confirmTime: string;
  trappedCount: string;
  ritOfficer: string;
  lunarLocation: string;
  lunarUnit: string;
  lunarName: string;
  lunarAirTask: string;
  lunarResources: string;
  asoRequestTime: string;
  asoName: string;
  asoArrivalTime: string;
  radioChannel: string;
  equipment: string[];
  equipmentBreaking: string;
  equipmentOther: string;
  eventLog: MaydayLog[];
}

export interface FormDataState {
  isoName: string;
  arrivalTime: string;
  incidentName: string;
  icName: string;
  floorsAbove: string;
  floorsBelow: string;
  usage: string;
  structure: string;
  structureOther: string;
  floorArea: string;
  asoRequestTime: string;
  asoName: string;
  asoArrivalTime: string;
  icConfirmTime: string;
  trapped: string;
  trappedCount: string;
  hospitalizedCount: string;
  deploymentGroups: string;
  briefingTime: string;
  ritTime: string;
  ritLeader: string;
  weatherCondition: string;
  weatherOther: string;
  temperature: string;
  windDirection: string;
  groundStatus: string;
  groundStatusOther: string;
  recon: {
    s1: ReconSide;
    s2: ReconSide;
    s3: ReconSide;
    s4: ReconSide;
  };
  medicRecords: MedicRecord[];
  mayday: MaydayState;
  analysis: string;
}
