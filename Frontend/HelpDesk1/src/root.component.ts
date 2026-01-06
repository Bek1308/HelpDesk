import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from "@app/layout/sidebar.component";
import { FooterComponent } from "@app/layout/footer.component";
import { CategoriesComponent } from "@app/categories/categories.component";

@Component({
    selector: 'app-root',
    // template: '<router-outlet></router-outlet>',
    templateUrl: './root.component.html',
    standalone: true,
    imports: [RouterOutlet],
})
export class RootComponent {}
