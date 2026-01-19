/// <reference types="chrome" />
export { }; // ensure this file is treated as a module

import { defaultSettingsStore } from "@/common/defaults";
import { HistoryStore, NotTrustedItem, NotTrustedStore, PermittedStore, SettingsStore, TrustedItem, TrustedStore } from "../common/interfaces";
import { PopupSettings } from "../common/types";
import { getStorageData } from "./utils";

/** ===== Chrome guard (handy for unit tests / localhost) ===== */
const hasChrome: boolean =
  typeof globalThis !== "undefined" && "chrome" in globalThis;

async function getDataFromLocal(): Promise<
  [TrustedStore, NotTrustedStore, HistoryStore, SettingsStore, PermittedStore]
> {
  try {
    // Start all storage retrievals concurrently
    const [
      resultJSONTrust,
      resultJSONNotTrusted,
      resultJSONhistory,
      resultJSONsettings,
      resultJSONpermittedWebsites,
    ] = await Promise.all([
      getStorageData<TrustedStore>("trustedWebsites", hasChrome),
      getStorageData<NotTrustedStore>("notTrustedWebsites", hasChrome),
      getStorageData<HistoryStore>("historyWebsites", hasChrome),
      getStorageData<SettingsStore>("settings", hasChrome),
      getStorageData<PermittedStore>("permittedWebsites", hasChrome),
    ]);

    // Return the results
    return [
      resultJSONTrust,
      resultJSONNotTrusted,
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
  resultJSONtrusted: TrustedStore,
  resultJSONnotTrusted: NotTrustedStore,
  resultJSONsettings: SettingsStore,
  resultJSONpermittedWebsites: PermittedStore
) {
  if (!hasChrome && !resultJSONtrusted && !resultJSONnotTrusted && !resultJSONsettings && !resultJSONpermittedWebsites) return;

  //Just to register what ASteamShark did on console
  console.log("🦈steamShark started!");

  //Get the url of the page
  const url = window.location.href;
  console.log("🦈steamShark: url is " + url);

  //Create the objects to verify in the lists
  const urlObject = new URL(url); // Make an URL object
  const origin = urlObject.origin;

  //Check if the website is localhost
  if (urlObject.hostname.includes("localhost") || urlObject.hostname.includes("127.0.0.1")) {
    return;
  }

  //Register the website to the history
  try {
    await chrome.runtime.sendMessage({ action: "registerHistoryStorage", trusted: false });
  } catch {/* ignore */ }

  // Check if its Permitted
  const permittedList = Array.isArray(resultJSONpermittedWebsites.data)
    ? resultJSONpermittedWebsites.data
    : [];
  const permittedItem = permittedList.find(
    (item) => item.url.toLowerCase() === urlObject.hostname.toLowerCase()
  );

  if (permittedItem) {
    const now = Date.now();

    if (permittedItem.expiresAt && permittedItem.expiresAt > now) {//Verify if the expiresAt is still active
      alert("olaaaa")
      if (permittedItem.action === "add") {
        console.log("🦈steamShark: The website is permitted to view!");
        return; // stop execution
      }

      //Check if permitted items has block action
      if (permittedItem.action === "block") {
        console.log("🦈steamShark: Website is blocked!");
        if (resultJSONsettings.data.redirectToWarningPage) {//Get user preference for not trusted websites
          console.log("🦈steamShark: Redirecting to warning page!");
          try {
            await chrome.runtime.sendMessage({ action: "redirectWarningPage" });
          } catch {//Catch to alwways appear something
            injectPopup("error", origin, {
              popupPosition: resultJSONsettings.data.popupPosition,
              showPopUpInRepeatedTrustedWebsite:
                resultJSONsettings.data.showPopUpInRepeatedTrustedWebsite,
              popupDurationMs: resultJSONsettings.data.popupDurationMs,
            });
          }
          return;
        } else {
          console.log("🦈steamShark: Show scam popup!");
          injectPopup(false, urlObject.hostname, {
            popupPosition: resultJSONsettings.data.popupPosition,
            showPopUpInRepeatedTrustedWebsite:
              resultJSONsettings.data.showPopUpInRepeatedTrustedWebsite,
            popupDurationMs: resultJSONsettings.data.popupDurationMs,
          });
        }
        return; // also stop, since we handled it
      }
    } else {//time already expired, remove from the permitted list
      alert("oioioioi")
      try {
        await chrome.runtime.sendMessage({ action: "removeFromPermitted", domain: urlObject.hostname  });
      } catch {/* ignore */ }
    }

    // ExpiresAt is expired, removed from the permitted db

  }

  const notTrusted =
    Array.isArray(resultJSONnotTrusted.data) &&
    resultJSONnotTrusted.data.some((item: NotTrustedItem) => item.url === origin);

  console.log("notTrusted ", notTrusted)

  // Verify if it's in the list of scam websites
  if (notTrusted) {
    console.log("🦈steamShark: The website is in the not trusted list!");

    //Check settings to redirect to warning or just show popup
    if (resultJSONsettings.data.redirectToWarningPage) {
      console.log("🦈steamShark: Redirecting to warning page!");
      try {
        await chrome.runtime.sendMessage({ action: "redirectWarningPage" });
      } catch {
        injectPopup("error", origin, {
          popupPosition: resultJSONsettings.data.popupPosition,
          showPopUpInRepeatedTrustedWebsite:
            resultJSONsettings.data.showPopUpInRepeatedTrustedWebsite,
          popupDurationMs: resultJSONsettings.data.popupDurationMs,
        });
      }
      return;
    } else {
      console.log("🦈steamShark: Show scam popup!");
      injectPopup(false, urlObject.hostname, {
        popupPosition: resultJSONsettings.data.popupPosition,
        showPopUpInRepeatedTrustedWebsite:
          resultJSONsettings.data.showPopUpInRepeatedTrustedWebsite,
        popupDurationMs: resultJSONsettings.data.popupDurationMs,
      });
    }
  }

  // Iterate through the data from the JSON to see if the URL is in the list
  const trusted =
    Array.isArray(resultJSONtrusted.data) &&
    resultJSONtrusted.data.some((item: TrustedItem) => item.url === origin);

  // Verify if it's in the list of trustworthy websites
  if (trusted) {
    console.log("🦈steamShark: The website is in the trust list!");

    try {
      await chrome.runtime.sendMessage({ action: "registerHistoryStorage", trusted: true });
    } catch {/* ignore */ }

    injectPopup(true, origin, {
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

  const body = document.body;
  if (!body) return;

  const divWrapper = document.createElement("div");
  const firstDiv = document.createElement("div");
  const secondDiv = document.createElement("div");
  const newParagraph = document.createElement("p");
  const returnSafetyLink = document.createElement("a");
  const learnMoreLink = document.createElement("a");
  const closeButton = document.createElement("button");//button to make the popup disapear

  //console.log(popupSettings);

  switch (succeeded) {
    case true: //If succeded
      newParagraph.innerHTML = "🦈 This website is trusted!";
      newParagraph.style.fontSize = "large"
      learnMoreLink.innerHTML = "Learn more about the website"
      learnMoreLink.href = `http://localhost:8080/website/${textAdd}`
      secondDiv.appendChild(learnMoreLink)
      divWrapper.style.backgroundColor = "rgba(11,156,49,0.85)";
      break;
    case false: //In case user wants popup instaed of redirecting to warning page
      newParagraph.innerHTML = "🦈 This website is NOT trusted!";
      newParagraph.style.fontSize = "large"
      learnMoreLink.innerHTML = "Learn more about the website"
      learnMoreLink.href = `http://localhost:8080/website/${textAdd}`
      returnSafetyLink.innerHTML = "Return to safety"
      returnSafetyLink.href = `http://localhost:8080/`
      secondDiv.appendChild(returnSafetyLink)
      secondDiv.appendChild(learnMoreLink)
      divWrapper.style.backgroundColor = "rgba(252, 94, 94, 0.85)";
      break;
    case "error": //If one error occurred
      newParagraph.innerHTML = "🦈 An error occurred while trying to fetch information!";
      newParagraph.style.fontSize = "large"
      divWrapper.style.backgroundColor = "rgba(255,165,0,0.85)";
      break;
  }

  firstDiv.appendChild(newParagraph);
  // Assign a unique ID to the div
  divWrapper.id = "steamSharkPopUp";

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
  closeButton.addEventListener("click", () => divWrapper.remove());
  // Append the button to the divWrapper
  firstDiv.appendChild(closeButton);

  //Div style
  divWrapper.style.position = "fixed"; // Added this line
  divWrapper.style.zIndex = "9999"; // Increased z-index
  divWrapper.style.padding = "1rem"; // Add padding around the content
  divWrapper.style.display = "flex";
  divWrapper.style.flexDirection = "column";
  divWrapper.style.gap = "12px";
  divWrapper.style.justifyContent = "space-between";
  divWrapper.style.borderRadius = "0.75rem";
  divWrapper.style.width = "300px";
  divWrapper.style.color = "white";
  divWrapper.style.alignItems = "center";

  firstDiv.style.display = "flex";
  firstDiv.style.flexDirection = "row";
  firstDiv.style.justifyContent = "space-between";
  secondDiv.style.display = "flex";
  secondDiv.style.flexDirection = "row";
  secondDiv.style.gap = "12px";

  /* Change the position of the popup */
  switch (popupSettings.popupPosition) {
    case "tr":
      divWrapper.style.top = "4rem";
      divWrapper.style.right = "1rem";
      break;
    case "tl":
      divWrapper.style.top = "4rem";
      divWrapper.style.left = "1rem";
      break;
    case "br":
      divWrapper.style.bottom = "4rem";
      divWrapper.style.right = "1rem";
      break;
    case "bl":
      divWrapper.style.bottom = "4rem";
      divWrapper.style.left = "1rem";
      break;
    default:
      divWrapper.style.top = "4rem";
      divWrapper.style.right = "1rem";
      break;
  }

  divWrapper.appendChild(firstDiv)
  divWrapper.appendChild(secondDiv)

  //Append the popup in the page
  body.insertAdjacentElement("beforebegin", divWrapper);

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
