import { Injectable, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

export interface BreadcrumbItem {
  label: string;
  url: string;
}

@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  readonly breadcrumbs = signal<BreadcrumbItem[]>([]);

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.breadcrumbs.set(this.buildBreadcrumbs(this.activatedRoute.root));
      });
    this.breadcrumbs.set(this.buildBreadcrumbs(this.activatedRoute.root));
  }

  private buildBreadcrumbs(
    route: ActivatedRoute,
    url = '',
    items: BreadcrumbItem[] = [],
  ): BreadcrumbItem[] {
    const children = route?.children ?? [];
    if (!children || children.length === 0) {
      return items;
    }

    for (const child of children) {
      const segments = child?.snapshot?.url ?? [];
      const routeUrl = segments.map((segment) => segment.path).join('/');
      const nextUrl = routeUrl ? `${url}/${routeUrl}` : url;
      const label = child?.snapshot?.data?.['breadcrumb'] as string | undefined;
      if (label) {
        items.push({ label, url: nextUrl || '/' });
      }
      return this.buildBreadcrumbs(child, nextUrl, items);
    }
    return items;
  }
}
