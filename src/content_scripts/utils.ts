/** Safe JSON parse: accepts already-parsed objects too */
function safeParse<T>(v: unknown): T {
    if (typeof v === "string") {
        try {
            return JSON.parse(v) as T;
        } catch {
            // Fall through to as-cast
        }
    }
    return v as T;
}

/** Promise wrapper for chrome.storage.local.get with robust typing */
export function getStorageData<T>(key: string, hasChrome: boolean): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        if (!hasChrome) return reject("chrome API is unavailable in this context.");
        chrome.storage.local.get([key], (result) => {
            const err = chrome.runtime.lastError?.message;
            if (err) return reject(err);
            resolve(safeParse<T>(result[key]));
        });
    });
}