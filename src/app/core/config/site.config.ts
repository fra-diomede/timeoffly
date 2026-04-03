import siteConfigJson from '../../../config/site.config.json';

interface SiteConfig {
  readonly publicAppUrl: string;
}

function normalizeOrigin(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

function stripQueryAndFragment(url: string): string {
  return url.split('#')[0].split('?')[0] || '/';
}

export const siteConfig: SiteConfig = {
  publicAppUrl: normalizeOrigin(siteConfigJson.publicAppUrl)
};

export function buildSiteUrl(path = '/'): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const cleanPath = stripQueryAndFragment(path).trim();

  if (!cleanPath || cleanPath === '/') {
    return siteConfig.publicAppUrl;
  }

  const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  return `${siteConfig.publicAppUrl}${normalizedPath}`;
}
