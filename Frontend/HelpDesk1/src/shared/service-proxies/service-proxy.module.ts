import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AbpHttpInterceptor } from 'abp-ng2-module';
import {CategoryServiceProxy} from '../../shared/api-services/category/category.service'
import { ApiServicesModule } from '@shared/api-services/api-services.module'
import * as ApiServiceProxies from './service-proxies';
import { SubCategoryServiceProxy } from '../api-services/sub-category/sub-category.service';
import { ServicesServiceProxy } from '../api-services/services/services.service';
import { PriorityLevelServiceProxy } from '../api-services/priority-level/priority-level.service';
import { IssuesTypeServiceProxy} from '../api-services/issues-types/issues-type.service';
import { CallCenterIssuesServiceProxy } from '../api-services/issues/call-center-issues.service';
import { IssuesStatusesServiceProxy } from '../api-services/issues-statuses/issues-statuses.service';
import { LanguagesTextServiceProxy } from '../api-services/localize/languages-text.service';
import { FaultGroupServiceProxy } from '../api-services/fault-group/fault-group.service';
import { IssuesServiceProxy } from '../api-services/issues/issues.service';
import { RepairIssuesServiceProxy } from '../api-services/issues/repair-issues.service';
import { TechDepartmentIssuesServiceProxy } from '../api-services/issues/tech-department-issues.service';
import { CityServiceProxy } from '../api-services/cities/city.service';
import { IssuesCommentsServiceProxy } from '../api-services/issues-comments/issues-comments.service';
import { IssuesHistoryServiceProxy } from '../api-services/issues-history/issues-history.service';
import { LookupServiceProxy } from '../api-services/bonus-systems/lookups/lookup.service';
import { BonusSystemServiceProxy} from '../api-services/bonus-systems/bonus-system.service';
import { BonusSystemUserServiceProxy } from '../api-services/bonus-systems/bonus-system-user.service'
@NgModule({
    imports: [
        
    ],
    providers: [
        ApiServiceProxies.RoleServiceProxy,
        ApiServiceProxies.SessionServiceProxy,
        ApiServiceProxies.TenantServiceProxy,
        ApiServiceProxies.UserServiceProxy,
        ApiServiceProxies.TokenAuthServiceProxy,
        ApiServiceProxies.AccountServiceProxy,
        ApiServiceProxies.ConfigurationServiceProxy,
        CategoryServiceProxy,
        SubCategoryServiceProxy,
        ServicesServiceProxy,
        PriorityLevelServiceProxy,
        IssuesTypeServiceProxy,
        CallCenterIssuesServiceProxy,
        IssuesStatusesServiceProxy,
        LanguagesTextServiceProxy,
        FaultGroupServiceProxy,
        IssuesServiceProxy,
        CallCenterIssuesServiceProxy,
        RepairIssuesServiceProxy,
        TechDepartmentIssuesServiceProxy,
        CityServiceProxy,
        IssuesCommentsServiceProxy,
        IssuesHistoryServiceProxy,
        LookupServiceProxy,
        BonusSystemServiceProxy,
        BonusSystemUserServiceProxy,
        { provide: HTTP_INTERCEPTORS, useClass: AbpHttpInterceptor, multi: true },
    ],
})
export class ServiceProxyModule {}
