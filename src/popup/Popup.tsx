/// <reference types="chrome" />
import { useMemo } from "react";
import "./popup.css";
import { Database, History, Settings } from "lucide-react";
import { Badge } from "./components/Badge";

// Guard for dev/preview (where chrome may not exist)
const hasChrome = typeof globalThis !== "undefined" && "chrome" in globalThis;

// build an extension-absolute URL (falls back for local preview)
const extUrl = (path: string) =>
    hasChrome ? chrome.runtime.getURL(path) : `/${path}`;

export default function Popup() {
    // Icon path from /public (works in extension build).
    // Fallback to absolute path for local preview.
    /* const iconSrc = useMemo(
        () =>
        (hasChrome
            ? chrome.runtime.getURL("logos/icon32.png")
            : "/logos/icon32.png"),
        []
    ); */

    // Read version from manifest (fallback to hardcoded)
    const version = useMemo(() => {
        try {
            if (hasChrome) return `v${chrome.runtime.getManifest().version}`;
        } catch {
            /* ignore */
        }
        return "v1.1.0";
    }, []);

    const settingsHref = extUrl("src/options/index.html#/settings");
    const historyHref = extUrl("src/options/index.html#/history");
    const localDatabaseHref = extUrl("src/options/index.html#/database");

    return (
        <div className="wrapper">
            {/* HEADER */}
            <header>
                <div className="image">
                    <img src="/logos/32.png" alt="SteamShark logo" />
                </div>
                <h1>SteamShark</h1>
                <div className="sub-header">
                    <Badge text={version} />
                </div>
            </header>

            {/* CONTENT (add your links/list here if needed) */}
            <div className="content">
                <ul>
                    <li>
                        <Settings className="icon" />
                        <a href={settingsHref} target="_blank" rel="noreferrer">Settings</a>
                    </li>
                    <li>
                        <History className="icon" />
                        <a href={historyHref} target="_blank" rel="noreferrer">History</a>
                    </li>
                    <li>
                        <Database className="icon" />
                        <a href={localDatabaseHref} target="_blank" rel="noreferrer">Local Database</a>
                    </li>
                </ul>
            </div>

            {/* FOOTER */}
            <footer>
                <a
                    href="https://franciscoborges2002.github.io/steamShark/"
                    target="_blank"
                    rel="noreferrer"
                >
                    Website
                </a>{" "}
                |
                <a
                    href="https://github.com/steamShark"
                    target="_blank"
                    rel="noreferrer"
                    style={{ marginLeft: 6 }}
                >
                    Github
                </a>
            </footer>
        </div>
    );
}
