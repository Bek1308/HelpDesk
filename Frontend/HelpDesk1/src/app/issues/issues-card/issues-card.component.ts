import { Component, Input, OnInit } from '@angular/core';
import { LocalizePipe } from '@shared/pipes/localize.pipe';
import { IssuesDto } from '@shared/api-services/issues/model/issues-dto.model';
import { PriorityLevelServiceProxy } from '@shared/api-services/priority-level/priority-level.service';
import { NgClass, NgStyle } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-issue-card',
  templateUrl: './issues-card.component.html',
  imports: [NgClass, NgStyle, LocalizePipe, CommonModule],
  standalone: true
})
export class IssueCardComponent implements OnInit {
  @Input() issue!: IssuesDto;
  activeTab: string = 'main';
  priorityColor: string = '#90EE90'; // Default light green
  progress: number = 0;
  progressColor: string = '#90EE90'; // Default light green

  constructor(private priorityLevelService: PriorityLevelServiceProxy) {}

  ngOnInit() {
    this.updatePriorityColor();
    this.updateProgress();
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  onActionClick() {
    alert(`Issue ID: ${this.issue.id}`);
  }

  private updatePriorityColor(): void {
    this.priorityLevelService.get(this.issue.priorityId).subscribe({
      next: (result) => {
        const percentage = result.percentage || 0;
        const p = Math.min(Math.max(percentage, 0), 100);
        let r: number, g: number, b: number;

        if (p <= 33) {
          const t = p / 33;
          r = Math.round(144 + (34 - 144) * t);
          g = Math.round(238 + (139 - 238) * t);
          b = Math.round(144 + (34 - 144) * t);
        } else if (p <= 66) {
          const t = (p - 34) / 33;
          r = 255;
          g = Math.round(255 + (140 - 255) * t);
          b = Math.round(224 + (0 - 224) * t);
        } else {
          const t = (p - 67) / 33;
          r = Math.round(255 + (139 - 255) * t);
          g = Math.round(182 + (0 - 182) * t);
          b = Math.round(193 + (0 - 193) * t);
        }

        this.priorityColor = `rgb(${r}, ${g}, ${b})`;
      },
      error: () => {
        this.priorityColor = '#90EE90'; // Fallback color
      }
    });
  }

  private updateProgress(): void {
    const creationTime = new Date(this.issue.creationTime).getTime();
    const deadline = new Date(this.issue.deadline).getTime();
    const currentTime = new Date().getTime();

    const totalDuration = deadline - creationTime;
    const elapsed = currentTime - creationTime;

    // Calculate progress percentage, clamp between 0 and 100
    this.progress = totalDuration > 0 ? Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100) : 100;

    // Calculate progress bar color based on progress percentage
    const p = this.progress;
    let r: number, g: number, b: number;

    if (p <= 33) {
      const t = p / 33;
      r = Math.round(144 + (34 - 144) * t);
      g = Math.round(238 + (139 - 238) * t);
      b = Math.round(144 + (34 - 144) * t);
    } else if (p <= 66) {
      const t = (p - 34) / 33;
      r = 255;
      g = Math.round(255 + (140 - 255) * t);
      b = Math.round(224 + (0 - 224) * t);
    } else {
      const t = (p - 67) / 33;
      r = Math.round(255 + (139 - 255) * t);
      g = Math.round(182 + (0 - 182) * t);
      b = Math.round(193 + (0 - 193) * t);
    }

    this.progressColor = `rgb(${r}, ${g}, ${b})`;
  }
}