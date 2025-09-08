import { useEffect, useState } from "react";

export function useChromeStorage<T>(key: string, initial: T) {
    const [value, setValue] = useState<T>(initial);

    useEffect(() => {
        chrome.storage.sync.get([key]).then((res) => {
            if (res[key] !== undefined) setValue(res[key]);
        });
        const listener = (changes: { [k: string]: chrome.storage.StorageChange }, area: string) => {
            if (area === "sync" && changes[key]) setValue(changes[key].newValue);
        };
        chrome.storage.onChanged.addListener(listener);
        return () => chrome.storage.onChanged.removeListener(listener);
    }, [key]);

    const save = (next: T) => {
        setValue(next);
        return chrome.storage.sync.set({ [key]: next });
    };

    return [value, save] as const;
}
