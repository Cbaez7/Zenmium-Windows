export type FilterListFetch = (input: string, init?: RequestInit) => Promise<Response>;

/** Defers optional filter hydration so a failed list download cannot block browser startup. */
export const deferFilterListHydration = (load: () => Promise<void>, onFailure: () => void): Promise<void> =>
  new Promise<void>((resolve) => setTimeout(resolve, 0)).then(async () => {
    try {
      await load();
    } catch {
      onFailure();
    }
  });
