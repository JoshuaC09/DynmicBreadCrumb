import { Injectable } from '@angular/core';
import { ActivatedRoute, Data, NavigationEnd, Router, ActivatedRouteSnapshot } from '@angular/router';
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
        const root = this.router.routerState.snapshot.root;
        const clientCode = this.getRouteParam('clientCode');
        const branchCode = this.getRouteParam('branchCode');
        const breadcrumbs: Breadcrumb[] = [];

        if (clientCode) {
          breadcrumbs.push({
            label: clientCode,
            url: `/${clientCode}`
          });
        }

        if (branchCode) {
          breadcrumbs.push({
            label: branchCode,
            url: `/${clientCode}/${branchCode}`
          });
        }

        this.addBreadcrumb(root, [], breadcrumbs);
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

  private addBreadcrumb(
    route: ActivatedRouteSnapshot,
    parentUrl: string[],
    breadcrumbs: Breadcrumb[]
  ) {
    const routeUrl = parentUrl.concat(route.url.map(url => url.path));
    const breadcrumb = this.getLabel(route.data);
    const parentBreadcrumb = route.parent && route.parent.data ?
      this.getLabel(route.parent.data) : null;

    if (breadcrumb && breadcrumb !== parentBreadcrumb) {
      breadcrumbs.push({
        label: breadcrumb,
        url: '/' + routeUrl.join('/')
      });
    }

    if (route.firstChild) {
      this.addBreadcrumb(route.firstChild, routeUrl, breadcrumbs);
    }
  }

  private getLabel(data: Data): string | null {
    return data['breadcrumb'] || null;
  }
}








//for nested parameter

// import { Injectable } from '@angular/core';
// import { ActivatedRoute, NavigationEnd, Router, ActivatedRouteSnapshot } from '@angular/router';
// import { BehaviorSubject } from 'rxjs';
// import { filter } from 'rxjs/operators';

// export interface Breadcrumb {
//   label: string;
//   url?: string;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class BreadcrumbService {
//   private readonly breadcrumbs$ = new BehaviorSubject<Breadcrumb[]>([]);

//   constructor(private router: Router, private activatedRoute: ActivatedRoute) {
//     this.router.events.pipe(
//       filter((event): event is NavigationEnd => event instanceof NavigationEnd)
//     ).subscribe(() => {
//       const breadcrumbs: Breadcrumb[] = [];

//       const params = new Map<string, string>();
//       let route: ActivatedRoute | null = this.activatedRoute;
//       while (route) {
//         ['clientCode', 'branchCode'].forEach(param => {
//           if (route?.snapshot.paramMap.has(param)) {
//             params.set(param, route.snapshot.paramMap.get(param)!);
//           }
//         });
//         route = route.firstChild;
//       }

//       params.forEach(value => breadcrumbs.push({ label: value }));
//       this.addBreadcrumb(this.router.routerState.snapshot.root, breadcrumbs);
//       this.breadcrumbs$.next(breadcrumbs);
//     });
//   }

//   private addBreadcrumb(route: ActivatedRouteSnapshot, breadcrumbs: Breadcrumb[]) {
//     const label = route.data['breadcrumb'];
//     if (label && (!route.parent?.data['breadcrumb'] || label !== route.parent.data['breadcrumb'])) {
//       breadcrumbs.push({ label });
//     }
//     if (route.firstChild) {
//       this.addBreadcrumb(route.firstChild, breadcrumbs);
//     }
//   }

//   getBreadcrumbs() {
//     return this.breadcrumbs$.asObservable();
//   }
// }


// fastest direct 

// import { Injectable } from '@angular/core';
// import { ActivatedRoute, NavigationEnd, Router, ActivatedRouteSnapshot } from '@angular/router';
// import { BehaviorSubject } from 'rxjs';
// import { filter } from 'rxjs/operators';

// export interface Breadcrumb {
//   label: string;
//   url?: string;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class BreadcrumbService {
//   private readonly breadcrumbs$ = new BehaviorSubject<Breadcrumb[]>([]);

//   constructor(private router: Router, private activatedRoute: ActivatedRoute) {
//     this.router.events.pipe(
//       filter((event): event is NavigationEnd => event instanceof NavigationEnd)
//     ).subscribe(() => {
//       const breadcrumbs: Breadcrumb[] = [];

//       const params = this.activatedRoute.snapshot.root.firstChild?.params || {};
//       if (params['clientCode']) { breadcrumbs.push({ label: params['clientCode'] });}
//       if (params['branchCode']) { breadcrumbs.push({ label: params['branchCode'] });}

//       this.addBreadcrumb(this.router.routerState.snapshot.root, breadcrumbs);
//       this.breadcrumbs$.next(breadcrumbs);
//     });
//   }

//   private addBreadcrumb(route: ActivatedRouteSnapshot, breadcrumbs: Breadcrumb[]) {
//     const label = route.data['breadcrumb'];
//     if (label && (!route.parent?.data['breadcrumb'] || label !== route.parent.data['breadcrumb'])) {
//       breadcrumbs.push({ label });
//     }
//     if (route.firstChild) {
//       this.addBreadcrumb(route.firstChild, breadcrumbs);
//     }
//   }

//   getBreadcrumbs() {
//     return this.breadcrumbs$.asObservable();
//   }
// }









