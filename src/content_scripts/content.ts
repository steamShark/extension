/// <reference types="chrome" />
export { }; // ensure this file is treated as a module

import { defaultSettingsStore } from "@/common/defaults";
import { HistoryStore, PermittedStore, ScamStore, SettingsStore, TrustStore } from "../common/interfaces";
import { PopupSettings } from "../common/types";
import { getStorageData } from "./utils";

/** ===== Chrome guard (handy for unit tests / localhost) ===== */
const hasChrome: boolean =
  typeof globalThis !== "undefined" && "chrome" in globalThis;

async function getDataFromLocal(): Promise<
  [TrustStore, ScamStore, HistoryStore, SettingsStore, PermittedStore]
> {
  try {
    // Start all storage retrievals concurrently
    const [
      resultJSONTrust,
      resultJSONScam,
      resultJSONhistory,
      resultJSONsettings,
      resultJSONpermittedWebsites,
    ] = await Promise.all([
      getStorageData<TrustStore>("trustWebsites", hasChrome),
      getStorageData<ScamStore>("scamWebsites", hasChrome),
      getStorageData<HistoryStore>("historyWebsites", hasChrome),
      getStorageData<SettingsStore>("settings", hasChrome),
      getStorageData<PermittedStore>("permittedWebsites", hasChrome),
    ]);

    // Return the results
    return [
      resultJSONTrust,
      resultJSONScam,
      resultJSONhistory,
      resultJSONsettings,
      resultJSONpermittedWebsites,
    ];
  } catch (error) {
    console.error("Error retrieving data:", error);

    // Try to fetch settings so we can still show a meaningful popup, have defaults
    let fallbackSettings: SettingsStore = defaultSettingsStore;

    try {
      const s = await getStorageData<SettingsStore>("settings", hasChrome);
      if (s?.data) fallbackSettings = s;
    } catch {
      /* ignore, keep defaults */
    }
    injectPopup("error", "getting the data from storage", {
      popupPosition: fallbackSettings.data.popupPosition,
      showPopUpInRepeatedTrustedWebsite:
        fallbackSettings.data.showPopUpInRepeatedTrustedWebsite,
      popupDurationMs: fallbackSettings.data.popupDurationMs,
    });

    throw error; // rethrow so callers can handle if they want
  }
}

//Main function
async function verifyWebsite(
  resultJSONTrust: TrustStore,
  resultJSONScam: ScamStore,
  resultJSONsettings: SettingsStore,
  resultJSONpermittedWebsites: PermittedStore
) {
  if (!hasChrome) return;

  //console.log(resultJSONScam); // This will log the data once it's available
  //console.log(resultJSONTrust); // This will log the data once it's available
  //console.log(resultJSONhistory); // This will log the data once it's available
  //console.log(resultJSONsettings); // This will log the data once it's available
  //console.log(resultJSONpermittedWebsites); // This will log the data once it's available

  console.log("🦈steamShark started!"); //Just to register what ASteamShark did on console

  const url = window.location.href; //Get the url of the page
  console.log("🦈steamShark: url is " + url);

  /* let isLegit = true; */

  // Remove the http and https for scam website list
  const urlVerify = url
    .replace("http://", "")
    .replace("https://", "")
    .replace("/", "");

  //Check if the website is localhost
  if (urlVerify.includes("localhost") || urlVerify.includes("127.0.0.1")) {
    return;
  }

  //Create the objects to verify in trust list
  const urlObject = new URL(url); // Make an URL object
  const domain = urlObject.origin + "/"; // Get the origin of the url and add "/"

  // Verify if it's in the list of scam websites
  if (Array.isArray(resultJSONScam.data) && resultJSONScam.data.includes(urlVerify)) {
    console.log("🦈steamShark: The website is in the scam list!");
    let isPermitted = false;

    //Register the website to the history
    try {
      await chrome.runtime.sendMessage({ action: "registerHistoryStorage", trusted: false });
    } catch {/* ignore */ }

    // Check if urlVerify is inside resultJSONpermittedWebsites
    const list = Array.isArray(resultJSONpermittedWebsites.data)
      ? resultJSONpermittedWebsites.data
      : [];
    isPermitted = list.some(
      (item) => item.url.toLowerCase() === urlVerify.toLowerCase()
      // you can add expiry check here if needed:
      // && (!item.expiresAt || Date.now() < item.expiresAt)
    );

    //verify if its not in permitted list, then send inject popup, or redirect from website
    if (!isPermitted) {
      if (resultJSONsettings.data.redirectToWarningPage) {
        console.log("🦈steamShark: Redirecting to warning page!");
        try {
          await chrome.runtime.sendMessage({ action: "redirectWarningPage" });
        } catch {/* ignore */ }
        return;
      } else {
        console.log("🦈steamShark: Show scam popup!");
        injectPopup(false, domain, {
          popupPosition: resultJSONsettings.data.popupPosition,
          showPopUpInRepeatedTrustedWebsite:
            resultJSONsettings.data.showPopUpInRepeatedTrustedWebsite,
          popupDurationMs: resultJSONsettings.data.popupDurationMs,
        });
      }
    }
    return;
  }

  // Iterate through the data from the JSON to see if the URL is in the list
  const trusted =
    Array.isArray(resultJSONTrust.data) &&
    resultJSONTrust.data.some((item) => item.url === domain);

  // Verify if it's in the list of trustworthy websites
  if (trusted) {
    console.log("The website is in the trust list.");

    try {
      await chrome.runtime.sendMessage({ action: "registerHistoryStorage", trusted: true });
    } catch {/* ignore */ }

    injectPopup(true, domain, {
      popupPosition: resultJSONsettings.data.popupPosition,
      showPopUpInRepeatedTrustedWebsite:
        resultJSONsettings.data.showPopUpInRepeatedTrustedWebsite,
      popupDurationMs: resultJSONsettings.data.popupDurationMs,
    });
  }

  //If its an user profile, need to make sure its from steam
  /* if (
    urlObject.origin === "https://steamcommunity.com" &&
    (urlObject.pathname.includes("/profiles/") ||
      urlObject.pathname.includes("/id/"))
  ) {
    console.log("é um perfil");
    const flagged = true; // For example
    if (flagged) {
      injectUserSteamProfileInformation(
        {
          steamid64: "76561198012345678",
          reason: "", // No reason for clean accounts
          date: "", // Optional
        },
        "clean",
        {
          position: "top",
          animate: true,
          fontSize: "13px",
          rounded: true,
          hideClean: false, // Show even if clean
          borderStyle: "solid",
        }
      );
    }
  }*/
}

/*
Function to initiate everything, 
*/
async function start(): Promise<void> {
  try {
    const data = await getDataFromLocal();

    await verifyWebsite(data[0], data[1], data[3], data[4]);
  } catch (error) {
    console.error("Error retrieving data: ", error);
  }
}

//Start the initial function to execute all stuff
start();

/*
Function to inject a popup in the page
*/
function injectPopup(
  succeeded: true | false | "error",
  textAdd: string,
  popupSettings: PopupSettings
): void {
  //If user doesnt want to show the popup
  if (!popupSettings.showPopUpInRepeatedTrustedWebsite) return;

  const body = document.querySelector("body");
  if (!body) return;

  const newDiv = document.createElement("div");
  const closeButton = document.createElement("button");//button to make the popup disapear

  //console.log(popupSettings);

  switch (succeeded) {
    case true: //If succeded
      newDiv.innerHTML = `<h5>🦈 ${textAdd} is trusted!</h5>`;
      newDiv.style.backgroundColor = "rgba(11,156,49,0.85)";
      break;
    case false: //In case user wants popup instaed of redirecting to warning page
      newDiv.innerHTML = `<h5>🦈 ${textAdd} is NOT trusted!</h5>`;
      newDiv.style.backgroundColor = "rgba(255,3,3,0.85)";
      break;
    case "error": //If one error occurred
      newDiv.innerHTML = `<h5>🦈steamShark An error occurred while trying to ${textAdd}.</h5>`;
      newDiv.style.backgroundColor = "rgba(255,165,0,0.85)";
      break;
  }

  // Assign a unique ID to the div
  newDiv.id = "steamSharkPopUp";

  //Add propreties to the butotn
  closeButton.textContent = "X";
  closeButton.style.width = "30px";
  closeButton.style.height = "30px";
  closeButton.style.backgroundColor = "white";
  closeButton.style.border = "none";
  closeButton.style.borderRadius = "5px";
  closeButton.style.cursor = "pointer";
  closeButton.style.fontWeight = "bold";
  closeButton.style.color = "black";
  closeButton.style.fontSize = "small";
  // Remove the popup when the button is clicked
  closeButton.addEventListener("click", () => newDiv.remove());
  // Append the button to the newDiv
  newDiv.appendChild(closeButton);

  //Div style
  newDiv.style.position = "fixed"; // Added this line
  newDiv.style.zIndex = "9999"; // Increased z-index
  newDiv.style.padding = "1rem"; // Add padding around the content
  newDiv.style.display = "flex";
  newDiv.style.flexDirection = "row";
  newDiv.style.gap = "1.5rem";
  newDiv.style.justifyContent = "space-between";
  newDiv.style.borderRadius = "0.75rem";
  newDiv.style.width = "300px";
  newDiv.style.fontSize = "x-large";
  newDiv.style.color = "white";
  newDiv.style.display = "flex";
  newDiv.style.flexDirection = "row";
  newDiv.style.alignItems = "center";

  /* Change the position of the popup */
  switch (popupSettings.popupPosition) {
    case "tr":
      newDiv.style.top = "4rem";
      newDiv.style.right = "1rem";
      break;
    case "tl":
      newDiv.style.top = "4rem";
      newDiv.style.left = "1rem";
      break;
    case "br":
      newDiv.style.bottom = "4rem";
      newDiv.style.right = "1rem";
      break;
    case "bl":
      newDiv.style.bottom = "4rem";
      newDiv.style.left = "1rem";
      break;
    default:
      newDiv.style.top = "4rem";
      newDiv.style.right = "1rem";
      break;
  }

  //Append the popup in the page
  body.insertAdjacentElement("beforebegin", newDiv);

  // Schedule the div to be removed after 10 seconds
  setTimeout(function () {
    let popupToRemove = document.getElementById("steamSharkPopUp");
    if (popupToRemove) {
      popupToRemove.remove();
    }
  }, popupSettings.popupDurationMs); // 10000 milliseconds = 10 seconds
}

/* 
  Function to inject user profile information
*/
/* function injectUserSteamProfileInformation(userData: any, status: any, settings = {}) {
  const target = document.querySelector(".profile_rightcol");
  if (!target || document.getElementById("steam-shark-warning")) return;

  const {
    steamid64 = "76561198243929698",
    reason = "No reason provided.",
    date = "Unknown",
    extra = "",
  } = userData;

  const config = {
    position: settings.position || "top", // "top", "bottom"
    rounded: settings.rounded !== false, // true by default
    borderStyle: settings.borderStyle || "solid", // "solid", "dashed", etc.
    fontSize: settings.fontSize || "13px",
    hideClean: settings.hideClean || false,
    animate: settings.animate || false,
  };

  const statusMap = {
    clean: {
      icon: "✅",
      label: "Clean",
      color: "#67c23a",
      message: "This account appears clean.",
    },
    suspicious: {
      icon: "⚠️",
      label: "Suspicious",
      color: "#e6a23c",
      message:
        "This account shows suspicious activity (e.g. VAC or trade ban).",
    },
    flagged: {
      icon: "🚨",
      label: "Flagged",
      color: "#f56c6c",
      message: "This account is flagged for malicious behavior.",
    },
  };

  const { icon, label, color, message } =
    statusMap[status] || statusMap["clean"];

  if (status === "clean" && config.hideClean) return; // skip inject if clean and hidden

  const wrapper = document.createElement("div");
  wrapper.innerHTML = `
    <div id="steam-shark-warning" style="
      background-color: #1b2838;
      border: 1px ${config.borderStyle} ${color};
      border-radius: ${config.rounded ? "6px" : "0"};
      padding: 10px;
      margin-top: 10px;
      color: #c6d4df;
      font-size: ${config.fontSize};
      font-family: 'Motiva Sans', sans-serif;
      ${config.animate ? "transition: all 0.3s ease; opacity: 0;" : ""}
    ">
      <div style="font-weight: bold; color: ${color}; font-size: 14px; margin-bottom: 6px;">
        ${icon} Steam Shark: ${label}
      </div>
      <div style="margin-bottom: 6px;">${message}</div>
      ${
        status !== "clean"
          ? `
        <div><strong>Reason:</strong> ${reason}</div>
        <div><strong>Reported on:</strong> ${date}</div>
        ${extra ? `<div>${extra}</div>` : ""}
      `
          : ""
      }
    </div>
  `;

  const node = wrapper.firstElementChild;
  if (config.animate)
    setTimeout(() => {
      node.style.opacity = 1;
    }, 10);

  if (config.position === "bottom") {
    target.appendChild(node);
  } else {
    target.prepend(node);
  }
} */

/* 
  Function to extract steamid64 from an steamuser page if the urls is of type /id/{custom_url}
*/
/* function getSteamId() {} */
