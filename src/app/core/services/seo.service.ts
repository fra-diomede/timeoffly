import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter, startWith } from 'rxjs/operators';

interface SeoRouteData {
  description?: string;
  robots?: string;
  canonicalPath?: string;
  ogType?: 'website' | 'profile' | 'article';
}

const DEFAULT_SEO = {
  title: 'TimeOffly | Gestione ferie, permessi e approvazioni',
  description:
    'TimeOffly semplifica la gestione di ferie, permessi e approvazioni per dipendenti, manager e amministratori.',
  robots: 'index, follow',
  canonicalPath: '/auth/login',
  ogType: 'website' as const
};

const SITE_URL = 'https://app.timeoffly.com';

@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(
    private router: Router,
    private title: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: object
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
    const canonicalUrl = this.buildAbsoluteUrl(seo?.canonicalPath ?? this.router.url ?? DEFAULT_SEO.canonicalPath);

    this.title.setTitle(title);

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
    return `${this.getSiteOrigin()}${normalizedPath}`;
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

  private getSiteOrigin(): string {
    const documentOrigin = this.document.location?.origin?.replace(/\/+$/, '');

    if (isPlatformBrowser(this.platformId) && documentOrigin) {
      return documentOrigin;
    }

    return SITE_URL.replace(/\/+$/, '');
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

  private updateNameTag(name: string, content: string) {
    this.meta.updateTag({ name, content }, `name='${name}'`);
  }

  private updatePropertyTag(property: string, content: string) {
    this.meta.updateTag({ property, content }, `property='${property}'`);
  }
}
