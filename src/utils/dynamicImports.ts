import { lazy } from "react";

export const dynamicImport = (path: string) => {
  return lazy(() => import(path));
};

// Predefined dynamic imports for common components
export const ImageFallback = dynamicImport("@/components/media/ImageFallback");
export const SkeletonGrid = dynamicImport("@/components/common/SkeletonGrid");
export const PreloadImages = dynamicImport("@/components/media/PreloadImages");
export const PriceConverter = dynamicImport(
  "@/components/common/PriceConverter",
);
export const ErrorBoundary = dynamicImport("@/components/common/ErrorBoundary");

// Utility function to preload components
export const preloadComponents = async (components: string[]) => {
  await Promise.all(
    components.map((component) => {
      const importPath = `@/components/${component}`;
      return import(importPath);
    }),
  );
};
