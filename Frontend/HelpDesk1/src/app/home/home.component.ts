import { Component, ViewChild, ElementRef, AfterViewInit, Injector, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { AppComponentBase } from '@shared/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { LocalizePipe } from '@shared/pipes/localize.pipe';

import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
  Legend,
  BarController,
  DoughnutController,
  LineController,
} from 'chart.js';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  animations: [appModuleAnimation()],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [LocalizePipe],
})
export class HomeComponent extends AppComponentBase implements AfterViewInit, OnDestroy {
  @ViewChild('statusChart') statusChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('priorityChart') priorityChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryChart') categoryChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('trendChart') trendChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('slaChart') slaChartRef!: ElementRef<HTMLCanvasElement>;

  private statusChart!: Chart;
  private priorityChart!: Chart;
  private categoryChart!: Chart;
  private trendChart!: Chart;
  private slaChart!: Chart;

  readonly mockData = {
    totalTickets: 3156,
    openTickets: 392,
    inProgressTickets: 184,
    closedToday: 96,
    slaCompliance: 96.8,
    avgResolutionTime: '2.7 ч',
    statusData: [392, 184, 87, 2493],
    statusLabels: ['Открытые', 'В работе', 'Ожидают', 'Закрытые'],
    priorityData: [1120, 1380, 580, 76],
    priorityLabels: ['Низкий', 'Средний', 'Высокий', 'Критический'],
    categoryData: [940, 720, 550, 430, 310, 206],
    categoryLabels: ['CallCenter', 'Repair', 'TechDept', 'ATM', 'PayvandW.', 'PayvandC.'],
    trendLabels: ['1', '4', '7', '10', '13', '16', '19', '22', '25', '28', '31 Янв'],
    newTicketsTrend: [78, 92, 105, 88, 115, 132, 98, 120, 140, 155, 162],
    closedTicketsTrend: [65, 80, 95, 102, 98, 110, 115, 125, 130, 138, 145],
    slaData: [96.8, 95.2, 97.5, 94.1, 96.8],
    slaLabels: ['Сент', 'Окт', 'Нояб', 'Дек', 'Янв'],
    topAgents: [
      { name: 'Иванов А.В.', closed: 168, avgTime: '1.9 ч', rating: 4.92 },
      { name: 'Сидорова Е.П.', closed: 152, avgTime: '2.3 ч', rating: 4.87 },
      { name: 'Кузнецов М.С.', closed: 139, avgTime: '2.6 ч', rating: 4.81 },
      { name: 'Петрова Н.А.', closed: 127, avgTime: '2.8 ч', rating: 4.78 },
      { name: 'Мирзаев Ш.Р.', closed: 114, avgTime: '3.1 ч', rating: 4.75 },
    ],
  };

  constructor(injector: Injector) {
    super(injector);
    Chart.register(
      CategoryScale,
      LinearScale,
      BarElement,
      ArcElement,
      LineElement,
      PointElement,
      Filler,
      Tooltip,
      Legend,
      BarController,
      DoughnutController,
      LineController
    );
  }

  ngAfterViewInit(): void {
    this.createCharts();
  }

  private createCharts(): void {
    const {
      statusData,
      statusLabels,
      priorityData,
      priorityLabels,
      categoryData,
      categoryLabels,
      trendLabels,
      newTicketsTrend,
      closedTicketsTrend,
      slaData,
      slaLabels,
    } = this.mockData;

    this.statusChart = new Chart(this.statusChartRef.nativeElement, {
      type: 'doughnut',
      data: { labels: statusLabels, datasets: [{ data: statusData, backgroundColor: ['#fb923c', '#3b82f6', '#a3a3a3', '#10b981'], borderWidth: 0 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { size: 10 }, padding: 10 } } } },
    });

    this.priorityChart = new Chart(this.priorityChartRef.nativeElement, {
      type: 'bar',
      data: { labels: priorityLabels, datasets: [{ data: priorityData, backgroundColor: '#8b5cf6' }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { font: { size: 10 } } }, x: { ticks: { font: { size: 10 } } } } },
    });

    this.categoryChart = new Chart(this.categoryChartRef.nativeElement, {
      type: 'bar',
      data: { labels: categoryLabels, datasets: [{ data: categoryData, backgroundColor: '#14b8a6' }] },
      options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { font: { size: 10 } } }, y: { ticks: { font: { size: 10 } } } } },
    });

    this.trendChart = new Chart(this.trendChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: trendLabels,
        datasets: [
          { label: 'Новые', data: newTicketsTrend, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', tension: 0.4, fill: true },
          { label: 'Закрытые', data: closedTicketsTrend, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', tension: 0.4, fill: true },
        ],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { font: { size: 10 } } } }, scales: { y: { beginAtZero: true, ticks: { font: { size: 10 } } }, x: { ticks: { font: { size: 9 } } } } },
    });

    this.slaChart = new Chart(this.slaChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: slaLabels,
        datasets: [{
          label: 'SLA %',
          data: slaData,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16,185,129,0.2)',
          tension: 0.3,
          fill: true,
          pointBackgroundColor: '#10b981',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: false, min: 90, max: 100, ticks: { font: { size: 10 } } },
          x: { ticks: { font: { size: 10 } } },
        },
      },
    });
  }

  ngOnDestroy(): void {
    this.statusChart?.destroy();
    this.priorityChart?.destroy();
    this.categoryChart?.destroy();
    this.trendChart?.destroy();
    this.slaChart?.destroy();
  }
}