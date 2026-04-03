import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const siteConfigPath = path.join(projectRoot, 'src', 'config', 'site.config.json');
const indexPath = path.join(projectRoot, 'src', 'index.html');
const robotsPath = path.join(projectRoot, 'public', 'robots.txt');
const sitemapPath = path.join(projectRoot, 'public', 'sitemap.xml');

function normalizeOrigin(url) {
  return String(url ?? '').trim().replace(/\/+$/, '');
}

function assertValidOrigin(url) {
  if (!/^https?:\/\/.+/i.test(url)) {
    throw new Error(`Invalid publicAppUrl: "${url}"`);
  }
}

function replaceOrThrow(content, pattern, replacement, filePath) {
  if (!pattern.test(content)) {
    throw new Error(`Could not find expected SEO tag in ${filePath}`);
  }

  return content.replace(pattern, replacement);
}

function buildSitemap(siteUrl) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
  </url>
  <url>
    <loc>${siteUrl}/auth/login</loc>
  </url>
  <url>
    <loc>${siteUrl}/auth/register</loc>
  </url>
</urlset>
`;
}

function buildRobots(siteUrl) {
  return `User-agent: *
Allow: /
Allow: /auth/login
Allow: /auth/register
Allow: /privacy
Allow: /terms
Disallow: /dashboard
Disallow: /ferie
Disallow: /calendario
Disallow: /team
Disallow: /approvals
Disallow: /admin
Disallow: /profilo

Sitemap: ${siteUrl}/sitemap.xml
`;
}

const siteConfig = JSON.parse(await readFile(siteConfigPath, 'utf8'));
const siteUrl = normalizeOrigin(siteConfig.publicAppUrl);

assertValidOrigin(siteUrl);

let indexContent = await readFile(indexPath, 'utf8');
indexContent = replaceOrThrow(
  indexContent,
  /(<meta property="og:url" content=")[^"]*(">\r?\n)/,
  `$1${siteUrl}/$2`,
  indexPath
);
indexContent = replaceOrThrow(
  indexContent,
  /(<link rel="canonical" href=")[^"]*(">\r?\n)/,
  `$1${siteUrl}/$2`,
  indexPath
);

await Promise.all([
  writeFile(indexPath, indexContent, 'utf8'),
  writeFile(robotsPath, buildRobots(siteUrl), 'utf8'),
  writeFile(sitemapPath, buildSitemap(siteUrl), 'utf8')
]);

console.log(`Synced site configuration with ${siteUrl}`);
