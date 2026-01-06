import { Component, Injector, ChangeDetectionStrategy } from '@angular/core';
import { AppComponentBase } from '@shared/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { LocalizePipe } from '@shared/pipes/localize.pipe';
import { IssueWorkspaceComponent } from "@app/issue-workspace/issue-workspace.component";

@Component({
    templateUrl: './home.component.html',
    animations: [appModuleAnimation()],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [LocalizePipe, IssueWorkspaceComponent],
})
export class HomeComponent extends AppComponentBase {
    constructor(injector: Injector) {
        super(injector);
    }
}
