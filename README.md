Html
<nav class="layout-breadcrumb">
  <ol class="flex">
    <ng-container *ngFor="let breadcrumb of breadcrumbs$ | async; let last = last">
      <li class="flex items-center">
        <a 
          [routerLink]="[breadcrumb.url]" 
          class="hover:underline"
          [style.color]="last ? 'var(--primary-color)' : 'var(--secondary-color)'"
          [class.font-semibold]="last"
        >
          {{ breadcrumb.label }}
        </a>
        <span *ngIf="!last" class="mx-2" [style.color]="'var(--secondary-color)'">></span>
      </li>
    </ng-container>
  </ol>
</nav>

ts file 
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Breadcrumb, BreadcrumbService } from '../ breadcrumb.service';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumbs.component.html'
})
export class BreadcrumbComponent {
  breadcrumbs$: Observable<Breadcrumb[]>;

  constructor(private breadcrumbService: BreadcrumbService) {
    this.breadcrumbs$ = this.breadcrumbService.getBreadcrumbs();
  }
}

and service 

import { Injectable } from '@angular/core';
import { ActivatedRoute, Data, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

export interface Breadcrumb {
  label: string;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  private breadcrumbs$ = new BehaviorSubject<Breadcrumb[]>([]);

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const clientCode = this.getRouteParam('clientCode');
        const branchCode = this.getRouteParam('branchCode');
        const breadcrumbs = this.createBreadcrumbs(this.activatedRoute.root, '', clientCode, branchCode);
        this.breadcrumbs$.next(breadcrumbs);
      });
  }

  getBreadcrumbs(): Observable<Breadcrumb[]> {
    return this.breadcrumbs$.asObservable();
  }

  private getRouteParam(param: string): string | null {
    let route: ActivatedRoute | null = this.activatedRoute;
    while (route) {
      if (route.snapshot.paramMap.has(param)) {
        return route.snapshot.paramMap.get(param);
      }
      route = route.firstChild;
    }
    return null;
  }

  private createBreadcrumbs(
    route: ActivatedRoute,
    url: string = '',
    clientCode: string | null = null,
    branchCode: string | null = null,
    breadcrumbs: Breadcrumb[] = []
  ): Breadcrumb[] {
    if (clientCode && breadcrumbs.length === 0) {
      breadcrumbs.push({
        label: `${clientCode}`,
        url: `/${clientCode}`
      });
    }

    if (branchCode && (breadcrumbs.length === 1 || breadcrumbs.length === 0)) {
      breadcrumbs.push({
        label: `${branchCode}`,
        url: `/${clientCode}/${branchCode}`
      });
    }

    const children = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url
        .map(segment => segment.path)
        .join('/');

      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      const label = this.getLabel(child.snapshot.data);
      if (label) {
        breadcrumbs.push({ label, url });
      }

      return this.createBreadcrumbs(
        child,
        url,
        clientCode,
        branchCode,
        breadcrumbs
      );
    }

    return breadcrumbs;
  }

  private getLabel(data: Data): string | null {
    return data['breadcrumb'] || null;
  }
}
