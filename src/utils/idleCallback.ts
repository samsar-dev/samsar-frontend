export const safeIdleCallback = (cb: () => void) => {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    return (window as any).requestIdleCallback(cb, { timeout: 2000 });
  }
  return setTimeout(cb, 2000);
};

export const cancelIdleCallback = (id: number | any) => {
  if (typeof window !== "undefined" && "cancelIdleCallback" in window) {
    return (window as any).cancelIdleCallback(id);
  }
  return clearTimeout(id);
};
