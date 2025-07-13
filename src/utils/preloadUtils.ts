export const safeIdleCallback = (cb: () => void) =>
  "requestIdleCallback" in window
    ? window.requestIdleCallback(cb)
    : setTimeout(cb, 2000);

export const preloadCriticalAssets = () => {
  if (typeof window !== "undefined") {
    const preloadLink = document.createElement("link");
    preloadLink.rel = "preload";
    preloadLink.href = "/assets/main-BYW6yWLQ.css";
    preloadLink.as = "style";
    document.head.appendChild(preloadLink);

    const fonts = [
      { href: "/fonts/inter.woff2", as: "font", type: "font/woff2" },
      { href: "/fonts/roboto.woff2", as: "font", type: "font/woff2" },
    ];
    fonts.forEach(font => {
      const link = document.createElement("link");
      Object.entries(font).forEach(([k, v]) => link.setAttribute(k, v));
      link.setAttribute("crossorigin", "anonymous");
      document.head.appendChild(link);
    });
  }
};
