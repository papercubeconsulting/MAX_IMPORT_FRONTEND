const withCSS = require("@zeit/next-css");

module.exports = withCSS({
  trailingSlash: true,
  optimization: {
    minimize: false,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        // source: "/proformas/:proformaId/pdf",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN", // Set your desired value here
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'",
          },
        ],
      },
    ];
  },
});
