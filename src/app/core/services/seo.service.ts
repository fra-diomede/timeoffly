import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter, startWith } from 'rxjs/operators';
import { buildSiteUrl } from '../config/site.config';

type JsonLdSchema = Record<string, unknown>;

interface SeoRouteData {
  description?: string;
  robots?: string;
  canonicalPath?: string;
  ogType?: 'website' | 'profile' | 'article';
  structuredData?: JsonLdSchema;
}

const DEFAULT_SEO = {
  title: 'TimeOffly | Gestione ferie e permessi',
  description:
    'Gestisci ferie e permessi in modo semplice e intuitivo con TimeOffly. Calendario condiviso, approvazioni e visione chiara delle assenze del team.',
  robots: 'index, follow',
  canonicalPath: '/',
  ogType: 'website' as const
};
const APPLICATION_NAME = 'TimeOffly';
const STRUCTURED_DATA_SELECTOR = 'script[data-seo-structured-data]';

@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(
    private router: Router,
    private title: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        startWith(null)
      )
      .subscribe(() => this.updateSeo());
  }

  private updateSeo() {
    const route = this.getDeepestRoute(this.router.routerState.snapshot.root);
    const seo = route.data['seo'] as SeoRouteData | undefined;
    const title = route.title ?? DEFAULT_SEO.title;
    const description = seo?.description ?? DEFAULT_SEO.description;
    const robots = seo?.robots ?? DEFAULT_SEO.robots;
    const ogType = seo?.ogType ?? DEFAULT_SEO.ogType;
    const structuredData = seo?.structuredData ?? null;
    const canonicalUrl = this.buildAbsoluteUrl(seo?.canonicalPath ?? this.router.url ?? DEFAULT_SEO.canonicalPath);

    this.title.setTitle(title);

    this.updateNameTag('application-name', APPLICATION_NAME);
    this.updateNameTag('apple-mobile-web-app-title', APPLICATION_NAME);
    this.updateNameTag('description', description);
    this.updateNameTag('robots', robots);
    this.updateNameTag('twitter:card', 'summary');
    this.updateNameTag('twitter:title', title);
    this.updateNameTag('twitter:description', description);

    this.updatePropertyTag('og:site_name', 'TimeOffly');
    this.updatePropertyTag('og:locale', 'it_IT');
    this.updatePropertyTag('og:type', ogType);
    this.updatePropertyTag('og:title', title);
    this.updatePropertyTag('og:description', description);
    this.updatePropertyTag('og:url', canonicalUrl);

    this.updateCanonical(canonicalUrl);
    this.updateStructuredData(structuredData);
  }

  private getDeepestRoute(snapshot: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
    let current = snapshot;

    while (current.firstChild) {
      current = current.firstChild;
    }

    return current;
  }

  private buildAbsoluteUrl(path: string): string {
    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    const normalizedPath = this.normalizePath(path);
    return buildSiteUrl(normalizedPath);
  }

  private normalizePath(path: string): string {
    const cleanPath = this.stripQueryAndFragment(path).trim();

    if (!cleanPath || cleanPath === '/') {
      return '';
    }

    return cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  }

  private stripQueryAndFragment(url: string): string {
    return url.split('#')[0].split('?')[0] || '/';
  }

  private updateCanonical(url: string) {
    let canonicalLink = this.document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;

    if (!canonicalLink) {
      canonicalLink = this.document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      this.document.head.appendChild(canonicalLink);
    }

    canonicalLink.setAttribute('href', url);
  }

  private updateStructuredData(schema: JsonLdSchema | null) {
    this.document.querySelectorAll(STRUCTURED_DATA_SELECTOR).forEach(node => node.remove());

    if (!schema) {
      return;
    }

    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo-structured-data', 'true');
    script.textContent = JSON.stringify(schema);
    this.document.head.appendChild(script);
  }

  private updateNameTag(name: string, content: string) {
    this.meta.updateTag({ name, content }, `name='${name}'`);
  }

  private updatePropertyTag(property: string, content: string) {
    this.meta.updateTag({ property, content }, `property='${property}'`);
  }
}
