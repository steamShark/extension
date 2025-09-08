import { SettingsData } from "./interfaces";

export type WhereToLocate = "tr" | "tl" | "br" | "bl";

/* PopUp Settings for the page */
export type PopupSettings = Pick<
  SettingsData,
  "popupPosition" | "showPopUpInRepeatedTrustedWebsite" | "popupDurationMs"
>;