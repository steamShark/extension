export const setLocalJSON = async (key: string, value: unknown): Promise<void> => {
  await chrome.storage.local.set({ [key]: JSON.stringify(value) });
};

export const getLocalJSON = async <T>(key: string): Promise<T | undefined> => {
  const res = await chrome.storage.local.get([key]);
  const raw = res?.[key];
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return undefined;
    }
  }
  return undefined;
};