// src/app/bonus-systems/bonus-systems.component.ts

import { Component, OnInit, HostListener, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { CreateEditBonusSystemDialogComponent } from './create-bonus-system/create-bonus-system.component';
import { BonusSystemServiceProxy } from '@shared/api-services/bonus-systems/bonus-system.service';
import { BonusSystemUserServiceProxy } from '@shared/api-services/bonus-systems/bonus-system-user.service';
import { LookupServiceProxy } from '@shared/api-services/bonus-systems/lookups/lookup.service';
import { BonusSystemDto, CreateBonusSystemDto } from '@shared/api-services/bonus-systems/model/bonus-system-dto.model';
import { lastValueFrom } from 'rxjs'; // Yangi import

interface BonusSystem {
  id: number;
  name: string;
  description: string;
  periodicity: string;
  budgetType: string;
  amount: string;
  rulesCount: number;
  usersCount: number;
  isActive: boolean;
  rules: { condition: string; points: number }[];
}

@Component({
  selector: 'app-bonus-systems',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bonus-systems.component.html',
  providers: [BonusSystemServiceProxy, BonusSystemUserServiceProxy, LookupServiceProxy]
})
export class BonusSystemsComponent implements OnInit {
  systems: BonusSystem[] = [];
  filteredSystems: BonusSystem[] = [];
  searchKeyword = '';
  viewMode: 'card' | 'table' = 'card';

  currentPage = 0;
  recordsPerPage = 10;
  predefinedRecordsCountPerPage = [5, 10, 15, 20, 25, 50];
  isRecordsPerPageDropdownOpen = false;

  get totalPages() {
    return Math.ceil(this.filteredSystems.length / this.recordsPerPage);
  }

  get paginatedSystems() {
    const start = this.currentPage * this.recordsPerPage;
    return this.filteredSystems.slice(start, start + this.recordsPerPage);
  }

  dropdownOpenId: number | null = null;
  dropdownPosition = { top: 0, left: 0 };
  expandedRules: Set<number> = new Set();

  private periodTypeMap: Record<number, string> = {};
  private budgetTypeMap: Record<number, string> = {};
  private lookupsLoaded = false;

  constructor(
    private modalService: BsModalService,
    private bonusSystemService: BonusSystemServiceProxy,
    private bonusSystemUserService: BonusSystemUserServiceProxy,
    private lookupService: LookupServiceProxy,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  // ==================== NGONINIT: AVTO YUKLASH ====================
  ngOnInit() {
    this.ngZone.run(() => {
      this.loadLookupsAndSystems();
    });
  }

  private async loadLookupsAndSystems() {
    try {
      const [periods, budgets] = await Promise.all([
        lastValueFrom(this.lookupService.getAllPeriodTypes()),
        lastValueFrom(this.lookupService.getAllBudgetTypes())
      ]);

      periods.forEach(t => this.periodTypeMap[t.id] = t.name);
      budgets.forEach(t => this.budgetTypeMap[t.id] = t.name);
      this.lookupsLoaded = true;

      this.ngZone.run(() => {
        this.loadSystems();
        this.cdr.markForCheck();
      });
    } catch (err) {
      console.error('Lookup yuklanmadi:', err);
      alert('Tizim ma\'lumotlari yuklanmadi');
    }
  }

  // ==================== TO'LIQ YUKLASH: SYSTEMS + USERS + RULES COUNT ====================
  private loadSystems() {
    if (!this.lookupsLoaded) return;

    const input: any = {};
    input.maxResultCount = this.recordsPerPage;
    input.skipCount = this.currentPage * this.recordsPerPage;
    input.sorting = 'name ASC';

    this.bonusSystemService.getAll(input).subscribe({
      next: (result) => {
        this.systems = result.items.map(dto => this.mapToViewModel(dto));
        this.filteredSystems = [...this.systems];

        this.loadUserCounts();
        this.loadRulesCounts();

        this.ngZone.run(() => {
          this.cdr.markForCheck();
        });
      },
      error: (err) => {
        console.error('Bonus tizimlar yuklanmadi:', err);
        alert('Ma\'lumotlarni yuklashda xatolik');
      }
    });
  }

  // Foydalanuvchilar soni
  private loadUserCounts() {
    this.systems.forEach(system => {
      this.bonusSystemUserService.getByBonusSystem(system.id).subscribe({
        next: (result) => {
          system.usersCount = result.items.length;
          this.cdr.markForCheck(); // Har bir o'zgarishda
        },
        error: () => {
          system.usersCount = 0;
          this.cdr.markForCheck();
        }
      });
    });
  }

  // Qoidalar soni
  private loadRulesCounts() {
    this.systems.forEach(system => {
      this.bonusSystemService.getWithRules(system.id).subscribe({
        next: (dto) => {
          system.rulesCount = dto.actionRules?.length || 0;
          this.cdr.markForCheck();
        },
        error: () => {
          system.rulesCount = 0;
          this.cdr.markForCheck();
        }
      });
    });
  }

  private mapToViewModel(dto: BonusSystemDto): BonusSystem {
    const isMoney = dto.budgetTypeId === 1;
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description || '',
      periodicity: this.periodTypeMap[dto.periodTypeId] || 'Noma\'lum',
      budgetType: this.budgetTypeMap[dto.budgetTypeId] || 'Noma\'lum',
      amount: `${dto.amount.toLocaleString()} ${isMoney ? 'so‘m' : 'ball'}`,
      rulesCount: 0,
      usersCount: 0,
      isActive: dto.isActive,
      rules: []
    };
  }

  // ==================== SEARCH & PAGINATION ====================
  applySearch() {
    this.filteredSystems = this.systems.filter(s =>
      s.name.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
      s.description.toLowerCase().includes(this.searchKeyword.toLowerCase())
    );
    this.currentPage = 0;
    this.cdr.markForCheck();
  }

  toggleView(mode: 'card' | 'table') {
    this.viewMode = mode;
    this.cdr.markForCheck();
  }

  goToFirstPage() { this.currentPage = 0; }
  goToPreviousPage() { if (this.currentPage > 0) this.currentPage--; }
  goToNextPage() { if (this.currentPage < this.totalPages - 1) this.currentPage++; }
  goToLastPage() { this.currentPage = this.totalPages - 1; }

  onRecordsPerPageChange() {
    this.currentPage = 0;
    this.isRecordsPerPageDropdownOpen = false;
    this.loadSystems();
  }

  // ==================== RULES (CLICK → YUKLANADI) ====================
  toggleRules(id: number) {
    const system = this.systems.find(s => s.id === id);
    if (!system) return;

    if (this.expandedRules.has(id)) {
      this.expandedRules.delete(id);
    } else {
      this.expandedRules.add(id);
      if (system.rules.length === 0) {
        this.bonusSystemService.getWithRules(id).subscribe({
          next: (dto) => {
            system.rules = (dto.actionRules || []).map(r => ({
              condition: r.conditionJson || r.actionName,
              points: r.points
            }));
            this.cdr.markForCheck();
          }
        });
      }
    }
    this.cdr.markForCheck();
  }

  // ==================== DROPDOWN ====================
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const dropdownButtons = document.querySelectorAll('.dropdown-button');
    const paginatorDropdown = document.querySelector('.paginator-dropdown');
    const paginatorButton = document.querySelector('.paginator-button');

    let insideDropdown = false;
    dropdownButtons.forEach(btn => { if (btn.contains(target)) insideDropdown = true; });

    const insidePaginator = paginatorButton?.contains(target) || paginatorDropdown?.contains(target);

    if (dropdownMenu && !dropdownMenu.contains(target) && !insideDropdown) {
      this.closeDropdown();
    }

    if (!insidePaginator && this.isRecordsPerPageDropdownOpen) {
      this.isRecordsPerPageDropdownOpen = false;
    }
  }

  toggleDropdown(id: number, event: MouseEvent) {
    event.stopPropagation();
    const button = event.currentTarget as HTMLElement;
    if (this.dropdownOpenId === id) {
      this.dropdownOpenId = null;
    } else {
      this.dropdownOpenId = id;
      const rect = button.getBoundingClientRect();
      this.dropdownPosition = { top: rect.bottom + 4, left: rect.left };
    }
  }

  closeDropdown() {
    this.dropdownOpenId = null;
  }

  // ==================== ACTIONS ====================
  viewSystem(id: number) {
    this.bonusSystemService.getWithRules(id).subscribe({
      next: (dto) => {
        const system = this.systems.find(s => s.id === id);
        if (system) {
          system.rules = (dto.actionRules || []).map(r => ({
            condition: r.conditionJson || r.actionName,
            points: r.points
          }));
          system.rulesCount = system.rules.length;
        }
        alert(`Tafsilotlar: ${dto.name}\nQoidalar: ${dto.actionRules?.length || 0} ta`);
        this.cdr.markForCheck();
      }
    });
    this.closeDropdown();
  }

  editSystem(id: number) {
    alert(`Tahrirlash hali mavjud emas (ID: ${id})`);
    this.closeDropdown();
  }

  deleteSystem(id: number) {
    if (confirm('O‘chirishni tasdiqlaysizmi?')) {
      this.bonusSystemService.delete(id).subscribe({
        next: () => {
          this.loadSystems();
          alert('Muvaffaqiyatli o‘chirildi!');
        },
        error: () => alert('O‘chirib bo‘lmadi')
      });
    }
    this.closeDropdown();
  }

  openUsers(id: number) {
    alert(`Foydalanuvchilar ro‘yxati (ID: ${id}) — keyinchalik`);
  }

  // ==================== CREATE ====================
  createSystem(): void {
    const modalRef: BsModalRef = this.modalService.show(CreateEditBonusSystemDialogComponent, {
      class: 'modal-lg',
      backdrop: 'static',
      keyboard: false
    });

    modalRef.content?.onSave.subscribe(() => {
      const formData = modalRef.content.form;

      const createDto = new CreateBonusSystemDto();
      createDto.name = formData.name;
      createDto.description = formData.description;
      createDto.periodTypeId = formData.periodTypeId;
      createDto.periodStartDay = formData.periodStartDay;
      createDto.periodStartWeekdayId = formData.periodStartWeekdayId;
      createDto.budgetTypeId = formData.budgetTypeId;
      createDto.amount = formData.amount;
      createDto.isActive = formData.isActive;
      createDto.actionRules = (formData.actionRules || []).map((r: any) => ({
        actionName: r.actionName,
        description: r.description,
        conditionJson: r.conditionJson,
        points: r.points,
        isActive: r.isActive ?? true
      }));

      this.bonusSystemService.create(createDto).subscribe({
        next: () => {
          this.loadSystems();
          alert('Yangi bonus tizim yaratildi!');
        },
        error: (err) => {
          console.error('Yaratishda xatolik:', err);
          alert('Yaratib bo‘lmadi');
        }
      });
    });
  }
}