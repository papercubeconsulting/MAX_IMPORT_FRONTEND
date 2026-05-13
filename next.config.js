const isStaticExport = process.env.NEXT_OUTPUT === "export";

module.exports = {
  trailingSlash: true,
  output: isStaticExport ? "export" : undefined,
  images: {
    unoptimized: isStaticExport,
  },
  webpack: (config) => {
    config.optimization.minimize = false;
    return config;
  },
  ...(isStaticExport
    ? {}
    : {
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
              ],
            },
          ];
        },
      }),
};
