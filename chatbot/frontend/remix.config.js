/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*"],
  // Configure the server's build directory
  serverBuildPath: "build/server/index.js",
  // Configure the client's build directory
  assetsBuildDirectory: "build/client",
  // Configure the public path
  publicPath: "/",
  // Updated future flags (removed obsolete ones)
  future: {
    v3_fetcherPersist: true,
    v3_relativeSplatPath: true,
    v3_throwAbortReason: true,
    v3_singleFetch: true,
    v3_lazyRouteDiscovery: true,
  },
};