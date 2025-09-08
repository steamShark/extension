import { WhereToLocate } from "./types";

/* STORES */
/*  */
export interface TrustStore {
  description?: string;
  data: TrustItem[];
  lastCheckup?: string;
}

/*  */
export interface ScamStore {
  description?: string;
  data: string[]; // you use includes(urlVerify)
  lastCheckup?: string;
}

/*  */
export interface HistoryStore {
  description: string;
  data: HistoryItem[];
}

/*  */
export interface SettingsStore {
  description: string;
  data: SettingsData;
}

/*  */
export interface PermittedStore {
  description: string;
  data: PermittedItem[];
}

/* ITEMS */
export interface HistoryItem {
  url: string;
  /** ISO string date */
  timestamp: string;
}

export interface PermittedItem {
  url: string;
  /** optional expiry timestamp (ms since epoch) */
  expiresAt?: number;
}

export interface TrustItem {
  url: string;
}

/* data */
/* Default data in /src/common/defaults.ts */
export interface SettingsData {
  /* Refresh Lists */
  refreshListsTimeMs: number, //default: 3600000
  /* Popup Settings */
  popupPosition: WhereToLocate; //default: tr
  showPopUpInRepeatedTrustedWebsite: boolean;// default: true
  popupDurationMs: number; // ms, default: 10000 (10s)
  /* Scam alert Settings */
  redirectOnScamDetected: boolean; //default: true
  ignoreScamSiteDurationMs: number; // ms, default:  300000 (5mins)
  /* History Settings */
  enableHistory: boolean; //default: true
  historyRepeatEntryCooldownMs: number; //default: 50
  maxHistoryEntries: number; // ms, default: 60000 (1min)
};