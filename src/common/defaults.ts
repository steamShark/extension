import { HistoryStore, SettingsData, SettingsStore } from "./interfaces";

/* Default Settings Data */
export const defaultSettings : SettingsData = {
    /* Refresh Lists */
    refreshListsTimeMs: 3600000,
    /* Popup Settings */
    popupPosition: "tr",
    showPopUpInRepeatedTrustedWebsite: true,
    popupDurationMs: 10000,
    /* Scam alert Settings */
    redirectOnScamDetected: true,
    ignoreScamSiteDurationMs: 300000,
    /* History Settings */
    enableHistory: true,
    maxHistoryEntries: 50,
    historyRepeatEntryCooldownMs: 60000
}

/* DEFAULT STORES */

export const defaultHistoryStore: HistoryStore = {
    description: "The history of websites the user visited.",
    data: []
}

export const defaultSettingsStore: SettingsStore = {
    description: "Settings used by SteamShark.",
    data: defaultSettings
}