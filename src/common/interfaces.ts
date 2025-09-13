import { WhereToLocate } from "./types";

/* STORES */
/*  */
export interface TrustedStore {
  description?: string;
  data: TrustedItem[] | null;
  lastCheckup?: string;
}

/*  */
export interface NotTrustedStore {
  description?: string;
  data: NotTrustedItem[] | null;
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

export interface TrustedItem {
  url: string;
  description: string;
}

export interface NotTrustedItem {
  url: string;
  description: string;
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
  redirectToWarningPage: boolean; //default: true
  ignoreScamSiteDurationMs: number; // ms, default:  300000 (5mins)
  /* History Settings */
  enableHistory: boolean; //default: true
  historyRepeatEntryCooldownMs: number; //default: 50
  maxHistoryEntries: number; // ms, default: 60000 (1min)
};