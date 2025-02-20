import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Breadcrumb, BreadcrumbService } from './app.breadcrumb.service';


@Component({
  selector: 'app-breadcrumb',
  templateUrl: './app.breadcrumb.component.html'
})
export class AppBreadcrumbComponent {
  breadcrumbs$: Observable<Breadcrumb[]>;

  constructor(private breadcrumbService: BreadcrumbService) {
    this.breadcrumbs$ = this.breadcrumbService.getBreadcrumbs();
  }
}
