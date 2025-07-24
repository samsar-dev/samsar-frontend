import { lazy, memo } from "react";

export const createPage = <P extends object>(
  Component: React.ComponentType<P>,
) => memo(Component);

export interface PreloadableComponent
  extends React.LazyExoticComponent<React.ComponentType<any>> {
  preload: () => Promise<{ default: React.ComponentType }>;
  _preloaded?: boolean;
}

export const lazyWithPreload = (
  importFn: () => Promise<{ default: React.ComponentType }>,
): PreloadableComponent => {
  const Component = lazy(importFn) as PreloadableComponent;
  Component.preload = async () => {
    if (!Component._preloaded) {
      Component._preloaded = true;
      return importFn();
    }
    return { default: Component };
  };
  return Component;
};

export const createLazyPage = (
  importFn: () => Promise<{ default: React.ComponentType }>,
) =>
  lazyWithPreload(async () => {
    const mod = await importFn();
    return { default: createPage(mod.default) };
  });
