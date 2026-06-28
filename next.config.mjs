/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === "true";
const githubPagesBasePath = "/spline-interaction-hero";

const nextConfig = {
  output: "export",
  ...(isGithubPages
    ? {
        assetPrefix: `${githubPagesBasePath}/`,
        basePath: githubPagesBasePath,
      }
    : {}),
};

export default nextConfig;
