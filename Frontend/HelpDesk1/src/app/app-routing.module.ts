import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppRouteGuard } from '@shared/auth/auth-route-guard';
import { AppComponent } from './app.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: AppComponent,
                children: [
                    {
                        path: 'home',
                        loadChildren: () => import('./home/home.module').then((m) => m.HomeModule),
                        canActivate: [AppRouteGuard],
                    },
                    {
                        path: 'about',
                        loadChildren: () => import('./about/about.module').then((m) => m.AboutModule),
                        canActivate: [AppRouteGuard],
                    },
                    {
                        path: 'users',
                        loadChildren: () => import('./users/users.module').then((m) => m.UsersModule),
                        data: { permission: 'Pages.Users' },
                        canActivate: [AppRouteGuard],
                    },
                    {
                        path: 'roles',
                        loadChildren: () => import('./roles/roles.module').then((m) => m.RolesModule),
                        data: { permission: 'Pages.Roles' },
                        canActivate: [AppRouteGuard],
                    },
                    {
                        path: 'tenants',
                        loadChildren: () => import('./tenants/tenants.module').then((m) => m.TenantsModule),
                        data: { permission: 'Pages.Tenants' },
                        canActivate: [AppRouteGuard],
                    },
                    {
                        path: 'update-password',
                        loadChildren: () => import('./users/users.module').then((m) => m.UsersModule),
                        canActivate: [AppRouteGuard],
                    },
                    { 
                        path: 'categories', 
                        loadChildren: () => import('./categories/categories.module').then(m => m.CategoriesModule),
                        data: { permission: 'Pages.Categories' },
                        canActivate: [AppRouteGuard],
                    },
                    { 
                        path: 'subcategories',
                        loadChildren: () => import('./sub-categories/sub-categories.module').then(m => m.SubCategoriesModule)
                    },
                    { 
                        path: 'services',
                        loadChildren: () => import('./services/services.module').then(m => m.ServicesModule)
                    },
                    { 
                        path: 'prioritylevels', 
                        loadChildren: () => import('./priority-level/priority-level.module').then(m => m.PriorityLevelModule) 
                    },
                    { 
                        path: 'issuetypes', 
                        loadChildren: () => import('./issues-types/issues-types.module').then(m => m.IssuesTypesModule) 
                    },
                    { 
                        path: 'callcenterissues', 
                        loadChildren: () => import('./call-center-issues/call-center-issues.module').then(m => m.CallCenterIssuesModule) 
                    },
                    { 
                        path: 'faultgroups', 
                        loadChildren: () => import('./fault-groups/fault-groups.module').then(m => m.FaultGroupsModule) 
                    },
                    { 
                        path: 'my_issues', 
                        loadChildren: () => import('./my-issues/my-issues.module').then(m => m.MyIssuesModule) 
                    },
                    {   path: 'repair_issues', 
                        loadChildren: () => import('./repair-issues/repair-issues.module').then(m => m.RepairIssuesModule) 
                    },
                    { 
                        path: 'tech_issues', 
                        loadChildren: () => import('./tech-issues/tech-issues.module').then(m => m.TechIssuesModule) 
                    },
                    { 
                        path: 'issues', 
                        loadChildren: () => import('./issues/issues.module').then(m => m.IssuesModule) 
                    },
                    { 
                        path: 'issue_workspace/:id', 
                        loadChildren: () => import('./issue-workspace/issue-workspace.module').then(m => m.IssueWorkspaceModule) 
                    },
                    { 
                        path: 'bonus_systems', 
                        loadChildren: () => import('./bonus-systems/bonus-systems.module').then(m => m.BonusSystemsModule) 
                    },
                        
                ],
            },
            { path: 'issues', loadChildren: () => import('./issues/issues.module').then(m => m.IssuesModule) },
            { path: 'tech_issues', loadChildren: () => import('./tech-issues/tech-issues.module').then(m => m.TechIssuesModule) },
            { path: 'bonus_systems', loadChildren: () => import('./bonus-systems/bonus-systems.module').then(m => m.BonusSystemsModule) },
        ]),
    ],
    exports: [RouterModule],
})
export class AppRoutingModule {}
