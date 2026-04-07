/// <reference types="chrome" />

import { defaultHistoryStore, defaultSettingsStore } from "@/common/defaults";
import { HistoryStore, NotTrustedStore, PermittedItem, PermittedStore, SettingsStore, TrustedStore } from "../common/interfaces";
import { getLocalJSON, setLocalJSON } from "./utils";
import { apiGetResponse } from "@/common/apiResponses";

export { }; // ensure this file is treated as a module

/** ===================== Install bootstrap ===================== */
/*
 * When the extension is installed, initialize storages and fetch remote lists.
 */
chrome.runtime.onInstalled.addListener(() => {
  // fire-and-forget; the service worker can await these as needed
  void fetchDataAndStore();
  void createHistory();
  void createSettings();
  void createPermitted();
});

/** ===================== Storage initializers ===================== */
/*
 * Create the initial permitted list (storage.local)
 */
async function createPermitted(): Promise<void> {
  const permittedWebsites: PermittedStore = {
    description: "A list of permitted websites!",
    data: [],
  };
  try {
    await setLocalJSON("permittedWebsites", permittedWebsites);
    console.log("🦈steamShark[BG]: permitted Websites Storage Created.");
  } catch (error) {
    console.log(
      `🦈steamShark[BG]: Error adding permitted Websites in storage.\n ${error}`
    );
  }
}

/*
 * Create the initial settings (storage.local)
 */
async function createSettings(): Promise<void> {
  const settings: SettingsStore = defaultSettingsStore;
  try {
    await setLocalJSON("settings", settings);
    console.log("🦈steamShark[BG]: Settings Storage Created.");
  } catch (error) {
    console.log(
      `🦈steamShark[BG]: Error adding Settings in storage.\n ${error}`
    );
  }
}

/*
 * Create the initial history (storage.local)
 */
async function createHistory(): Promise<void> {
  const history: HistoryStore = defaultHistoryStore;
  try {
    await setLocalJSON("historyWebsites", history);
    console.log("🦈steamShark[BG]: History Storage Created.");
  } catch (error) {
    console.log(
      `🦈steamShark[BG]: Error adding History in storage.\n ${error}`
    );
  }
}

/** ===================== Fetch remote lists ===================== */
/*
 * Fetch data from GitHub and store locally (with lastCheckup)
 */
async function fetchDataAndStore(): Promise<void> {
  /* const urls = [
    "https://raw.githubusercontent.com/Franciscoborges2002/steamShark/main/utils/scam.json",
    "https://raw.githubusercontent.com/Franciscoborges2002/steamShark/main/utils/trust.json",
  ]; */

  const urls = [
    "https://api.steamshark.app/api/v1/websites?is_not_trusted=true",
    "https://api.steamshark.app/api/v1/websites?is_not_trusted=false"
  ]

  // If you need current trust list for merging, read it here:
  // const currentTrust = await getLocalJSON<TrustStore>("trustWebsites");

  for (const url of urls) {
    try {
      const response = await fetch(url);
      const data = (await response.json()) as apiGetResponse;

      console.log(data);

      const items = Array.isArray(data.data?.data)
        ? data.data.data.map(({ url, description }) => ({ url, description }))
        : null;

      const enrichedData = {
        data: items,
        lastCheckup: new Date().toISOString(),
      };

      if (url.includes("is_not_trusted=true")) {
        console.log("not trusted ", enrichedData);
        await setLocalJSON("notTrustedWebsites", enrichedData satisfies NotTrustedStore);
      } else {
        console.log("trusted ", enrichedData);
        await setLocalJSON("trustedWebsites", enrichedData satisfies TrustedStore);
      }

      console.log(
        `🦈steamShark[BG]: Data from ${url} stored successfully.`);
    } catch (error) {
      console.error(
        `🦈steamShark[BG]: Failed to fetch data from ${url}:`,
        error
      );
    }
  }
}


/** ===================== Message handler ===================== */
chrome.runtime.onMessage.addListener(
  (request: unknown, sender, sendResponse): boolean => {
    (async () => {
      const msg = request as
        | { action: "redirectWarningPage" }
        | { action: "registerHistoryStorage"; trusted?: boolean }
        | { action: "registerHistoryStorage" }
        | { action: "fetchData" }
        | { action: string;[k: string]: unknown };

      /* Redirect the user to the scam alert page inside the extension */
      if (msg.action === "redirectWarningPage") {
        console.log("🦈steamShark[BG]: Redirecting from warning page");
        const extensionId = chrome.runtime.id;
        const warningPageUrl = `chrome-extension://${extensionId}/src/warning/index.html`;
        const tabId = sender.tab?.id;
        if (tabId != null) {
          await chrome.tabs.update(tabId, { url: warningPageUrl });
          sendResponse("Redirected");
        } else {
          sendResponse("No active tab to redirect.");
        }
        return;
      }

      /* Register the website in history */
      if (msg.action === "registerHistoryStorage") {
        console.log("🦈steamShark[BG]: Registering to history!");

        // Parse URL
        let domain = "";
        try {
          const parsedUrl = new URL(sender.url ?? "");
          domain = parsedUrl.hostname;
        } catch {
          sendResponse({
            message: "🦈steamShark[BG]: Invalid sender URL.",
          });
          return;
        }

        // Remove subdomain
        if (domain.includes(".")) {
          domain = domain.split(".").slice(-2).join(".");
        }

        // If trusted, normalize to https://domain/ to match trust list format
        if ("trusted" in msg && msg.trusted) {
          domain = `https://${domain}/`;
        }else{
          sendResponse(
            "🦈steamShark[BG]: Trustworthiness was not provided; cannot properly register in history."
          );
          return;
        }

        let history = await getLocalJSON<HistoryStore>("historyWebsites");
        const settings = await getLocalJSON<SettingsStore>("settings");

        if (!settings) {
          sendResponse(
            "🦈steamShark[BG]: Settings missing; cannot register history."
          );
          return;
        }

        const now = new Date();
        if (!history) {
          // Initialize if missing
          history = defaultHistoryStore;
          history.data.push({ url: domain, timestamp: now.toISOString() })
          try {
            await setLocalJSON("historyWebsites", history);
            console.log("🦈steamShark[BG]: History Storage Created.");
          } catch (error) {
            console.log(
              "🦈steamShark[BG]: Error while saving into localStorage.\nError: " +
              error
            );
            sendResponse(
              "🦈steamShark[BG]: Error while saving into localStorage!"
            );
          }
          sendResponse({
            message:
              "🦈steamShark[BG]: Website Registered to storage history!",
          });
          return;
        }

        // Non-empty history: apply rules
        console.log("🦈steamShark[BG]: Adding Website to the list.");
        const { data } = history;

        if (data.length === 0) {
          data.unshift({ url: domain, timestamp: now.toISOString() });
        } else if (
          data.length > 0 &&
          data[0].url === domain &&
          now.getTime() - new Date(data[0].timestamp).getTime() <
          settings.data.historyRepeatEntryCooldownMs
        ) {
          const minutes =
            settings.data.historyRepeatEntryCooldownMs / 60000;
          console.log(
            `🦈steamShark[BG]: Skipping ${domain} as it was recently visited.`
          );
          sendResponse({
            message: `🦈steamShark[BG]: Skipping ${domain}. Already registered less than ${minutes} minutes ago!`,
          });
          return;
        } else if (
          data.length >= settings.data.maxHistoryEntries
        ) {
          // Keep only the most recent (you may prefer to keep N-1 instead)
          history.data = history.data.slice(-1);
          history.data.unshift({ url: domain, timestamp: now.toISOString() });
        } else {
          history.data.unshift({ url: domain, timestamp: now.toISOString() });
        }

        try {
          await setLocalJSON("historyWebsites", history);
          console.log(`🦈steamShark[BG]: ${domain} stored successfully.`);
          sendResponse({
            message:
              "🦈steamShark[BG]: Website Registered to storage history!",
          });
        } catch (error) {
          console.log(
            "🦈steamShark[BG]: Error while saving into localStorage.\nError: " +
            error
          );
          sendResponse({
            message:
              "🦈steamShark[BG]: Error while saving into localStorage!",
          });
        }
        return;
      }

      /* Refetch remote data (e.g., hourly job) */
      if (msg.action === "fetchData") {
        try {
          await fetchDataAndStore();
          console.log("🦈steamShark[BG]: Data fetched!");
          sendResponse("🦈steamShark[BG]: Data fetched and stored!");
        } catch (error) {
          console.error(
            "🦈steamShark[BG]: Failed to fetch and store data:",
            error
          );
          sendResponse("🦈steamShark[BG]: Failed to fetch and store data!");
        }
        return;
      }

      /* Register the website in history */
      if (msg.action === "registerHistoryStorage") {
        console.log("🦈steamShark[BG]: Removing Website from permitted list!");

        // Parse URL
        let domain = "";
        try {
          const parsedUrl = new URL(sender.url ?? "");
          domain = parsedUrl.hostname;
        } catch {
          sendResponse({
            message: "🦈steamShark[BG]: Invalid URL.",
          });
          return;
        }

        // Remove subdomain
        if (domain.includes(".")) {
          domain = domain.split(".").slice(-2).join(".");
        }

        //Get both stores that are needed
        let permittedStore = await getLocalJSON<PermittedStore>("permittedWebsites");

        if (!permittedStore || permittedStore === undefined) {
          sendResponse({
            message: "🦈steamShark[BG]: Couldn't get the permittedStore.",
          });
          return;
        }

        //verify if there is any record 
        const permittedItem = permittedStore.data.filter((item) => item.url === domain);

        //Verify if item exists
        if (permittedItem.length < 1) {
          sendResponse({
            message: "🦈steamShark[BG]: Item does not exist.",
          });
          return;
        }

        //Get the index of the item to remove it
        const indexOfPermittedItem = permittedStore.data.indexOf(permittedItem[0])

        //Verify if item exists
        if (indexOfPermittedItem < 0) {
          sendResponse({
            message: "🦈steamShark[BG]: Couldn't get the item from the array.",
          });
          return;
        }

        const nextPermittedData: PermittedItem[] = permittedStore.data.splice(indexOfPermittedItem)

        permittedStore.data = nextPermittedData;

        try {
          await chrome.storage.local.set({ permittedWebsites: JSON.stringify(permittedStore) });
        } catch (err) {
          console.log("error " + err)
        }
      }

      // Unknown action
      sendResponse("🦈steamShark[BG]: Unknown action.");
    })();

    // Return true to indicate we'll respond asynchronously.
    return true;
  }
);