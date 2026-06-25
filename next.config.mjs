// On GitHub Pages the site is served from /<repo-name>/. The Actions workflow
// sets PAGES_BASE_PATH to the repo name; locally and on Vercel it stays empty.
const basePath = process.env.PAGES_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Fully client-side app → emit a static site (the `out/` folder).
  output: "export",
  images: { unoptimized: true },
  basePath: basePath || undefined,
  // Folder-style URLs so deep links work on static hosts.
  trailingSlash: true,
};

export default nextConfig;
