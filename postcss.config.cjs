const isProd = process.env.NODE_ENV === "production";

module.exports = {
  plugins: [
    require("postcss-import"),
    require("tailwindcss/nesting"),
    require("tailwindcss"),
    require("autoprefixer"),

    // Add cssnano only in production for minification
    ...(isProd
      ? [
          require("cssnano")({
            preset: [
              "default",
              {
                discardComments: { removeAll: true },
                normalizeWhitespace: true,
                minifyFontValues: true,
                minifySelectors: true,
                reduceIdents: false,
                zindex: false,
              },
            ],
          }),
        ]
      : []),
  ],
};
