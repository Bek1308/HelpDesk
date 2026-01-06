// src/app/bonus-systems/create-edit-bonus-system-dialog.component.ts

import { Component, Injector, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/app-component-base';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { v4 as uuidv4 } from 'uuid';
import { AbpModalFooterComponent } from "@shared/components/modal/abp-modal-footer.component";
import { AbpModalHeaderComponent } from "@shared/components/modal/abp-modal-header.component";
import { LocalizePipe } from "../../../shared/pipes/localize.pipe";
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

// Service imports — TO‘G‘RI YO‘LLAR
import { BonusSystemServiceProxy } from '@shared/api-services/bonus-systems/bonus-system.service';
import { LookupServiceProxy } from '@shared/api-services/bonus-systems/lookups/lookup.service';
import { PriorityLevelServiceProxy } from '@shared/api-services/priority-level/priority-level.service';
import { IssuesStatusesServiceProxy } from '@shared/api-services/issues-statuses/issues-statuses.service';
import { UserServiceProxy } from '@shared/service-proxies/service-proxies'; // TO‘G‘RI
import { SubCategoryServiceProxy } from '@shared/api-services/sub-category/sub-category.service';
import { ServicesServiceProxy } from '@shared/api-services/services/services.service';
import { FaultGroupServiceProxy } from '@shared/api-services/fault-group/fault-group.service';
import { CityServiceProxy } from '@shared/api-services/cities/city.service';

import { CreateActionRuleDto, CreateBonusSystemDto, EditActionRuleDto, EditBonusSystemDto } from '@shared/api-services/bonus-systems/model/bonus-system-dto.model';

interface Condition {
  id: string;
  action?: 'create' | 'edit' | 'delete';
  field?: string;
  operator?: string;
  value?: any;
}

interface ConditionItem {
  id: string;
  type: 'condition' | 'group';
  condition?: Condition;
  group?: ConditionGroup;
}

interface ConditionGroup {
  id: string;
  logic: 'AND' | 'OR';
  items: ConditionItem[];
  itemLogics: ('AND' | 'OR')[];
}

interface ActionRule {
  id: string;
  actionName: string;
  points: number;
  rootGroup: ConditionGroup;
}

interface FieldOption {
  id: string | number;
  display: string;
  type: 'text' | 'number' | 'dropdown' | 'date' | 'user' | 'boolean' | 'phone' | 'money';
  service?: any;
  method?: string;
  category?: string[];
}

@Component({
  selector: 'app-create-edit-bonus-system-dialog',
  templateUrl: './create-bonus-system.component.html',
  standalone: true,
  imports: [
    AbpModalFooterComponent,
    AbpModalHeaderComponent,
    LocalizePipe,
    NgClass,
    FormsModule,
    DragDropModule
  ],
  providers: [
    BonusSystemServiceProxy,
    LookupServiceProxy,
    PriorityLevelServiceProxy,
    IssuesStatusesServiceProxy,
    UserServiceProxy,
    SubCategoryServiceProxy,
    ServicesServiceProxy,
    FaultGroupServiceProxy,
    CityServiceProxy
  ]
})
export class CreateEditBonusSystemDialogComponent extends AppComponentBase implements OnInit {
  @Input() id?: number;
  @Output() onSave = new EventEmitter<void>();

  saving = false;
  activeTab: 'details' | 'rules' = 'details';

  form = {
    name: '',
    description: '',
    periodTypeId: 0,
    periodStartDay: null,
    periodStartWeekdayId: null,
    budgetTypeId: 0,
    amount: 0,
    isActive: true,
    actionRules: [] as ActionRule[]
  };

  periodTypes: any[] = [];
  weekdays: any[] = [];
  budgetTypes: any[] = [];

  priorityOptions: FieldOption[] = [];
  statusOptions: FieldOption[] = [];
  userOptions: FieldOption[] = [];
  subCategoryOptions: FieldOption[] = [];
  serviceOptions: FieldOption[] = [];
  faultGroupOptions: FieldOption[] = [];
  cityOptions: FieldOption[] = [];

  operators = [
    { id: '==', name: 'Teng' },
    { id: '>', name: 'Katta' },
    { id: '<', name: 'Kichik' },
    { id: '>=', name: 'Katta yoki teng' },
    { id: '<=', name: 'Kichik yoki teng' },
    { id: 'contains', name: 'Ichida' },
    { id: 'in', name: 'Ro\'yxatda' }
  ];

  actions = [
    { id: 'create', name: 'Yaratildi' },
    { id: 'edit', name: 'Tahrirlandi' },
    { id: 'delete', name: 'O‘chirildi' }
  ];

  allFields: FieldOption[] = [
    { id: 'title', display: 'Sarlavha', type: 'text', category: ['Classic', 'CallCenter', 'Repair', 'TechDepartment', 'AtmIssues', 'PayvandWallet', 'PayvandCard'] },
    { id: 'description', display: 'Tavsif', type: 'text', category: ['Classic'] },
    { id: 'priorityId', display: 'Prioritet', type: 'dropdown', service: PriorityLevelServiceProxy, method: 'getAll', category: ['Classic'] },
    { id: 'issueStatusId', display: 'Status', type: 'dropdown', service: IssuesStatusesServiceProxy, method: 'getAll', category: ['Classic'] },
    { id: 'reportedBy', display: 'Xabar bergan', type: 'user', service: UserServiceProxy, method: 'getAll', category: ['Classic'] },
    { id: 'isResolved', display: 'Hal qilingan', type: 'boolean', category: ['Classic'] },
    { id: 'deadline', display: 'Muddat', type: 'date', category: ['Classic'] },
    { id: 'clientFullName', display: 'Mijoz F.I.Sh', type: 'text', category: ['Classic'] },
    { id: 'gender', display: 'Jins', type: 'dropdown', category: ['Classic'] },
    { id: 'assigneeUserIds', display: 'Bajaruvchilar', type: 'user', service: UserServiceProxy, method: 'getAll', category: ['Classic'] },

    // Call Center
    { id: 'callCenterData.subCategoryId', display: 'Subkategoriya (Call Center)', type: 'dropdown', service: SubCategoryServiceProxy, method: 'getAll', category: ['CallCenter'] },
    { id: 'callCenterData.serviceId', display: 'Xizmat (Call Center)', type: 'dropdown', service: ServicesServiceProxy, method: 'getAll', category: ['CallCenter'] },
    { id: 'callCenterData.wrongNumber', display: 'Noto‘g‘ri raqam', type: 'phone', category: ['CallCenter'] },
    { id: 'callCenterData.rightNumber', display: 'To‘g‘ri raqam', type: 'phone', category: ['CallCenter'] },
    { id: 'callCenterData.terminalNumber', display: 'Terminal raqami', type: 'text', category: ['CallCenter'] },
    { id: 'callCenterData.sum', display: 'Summa', type: 'money', category: ['CallCenter'] },
    { id: 'callCenterData.cancelledSum', display: 'Bekor qilingan summa', type: 'money', category: ['CallCenter'] },
    { id: 'callCenterData.subscriber', display: 'Abonent', type: 'text', category: ['CallCenter'] },

    // Repair
    { id: 'repairData.agentFullName', display: 'Agent F.I.Sh', type: 'text', category: ['Repair'] },
    { id: 'repairData.agentNumber', display: 'Agent raqami', type: 'phone', category: ['Repair'] },
    { id: 'repairData.equipment', display: 'Uskuna', type: 'text', category: ['Repair'] },
    { id: 'repairData.serialNumber', display: 'Serya raqami', type: 'text', category: ['Repair'] },
    { id: 'repairData.issueDescription', display: 'Muammo tavsifi', type: 'text', category: ['Repair'] },
    { id: 'repairData.workAmount', display: 'Ish hajmi', type: 'number', category: ['Repair'] },
    { id: 'repairData.replacementParts', display: 'Almashtirilgan qismlar', type: 'text', category: ['Repair'] },

    // Tech Department
    { id: 'techDepartmentData.terminalNumber', display: 'Terminal raqami (Tech)', type: 'text', category: ['TechDepartment'] },
    { id: 'techDepartmentData.terminalName', display: 'Terminal nomi', type: 'text', category: ['TechDepartment'] },
    { id: 'techDepartmentData.agentId', display: 'Agent ID (Tech)', type: 'user', service: UserServiceProxy, method: 'getAll', category: ['TechDepartment'] },
    { id: 'techDepartmentData.agentNumber', display: 'Agent raqami (Tech)', type: 'phone', category: ['TechDepartment'] },
    { id: 'techDepartmentData.issueDescription', display: 'Muammo tavsifi (Tech)', type: 'text', category: ['TechDepartment'] },
    { id: 'techDepartmentData.issueGroupId', display: 'Muammo guruhi', type: 'dropdown', service: FaultGroupServiceProxy, method: 'getAll', category: ['TechDepartment'] },
    { id: 'techDepartmentData.terminalLocation', display: 'Terminal joylashuvi', type: 'text', category: ['TechDepartment'] },
    { id: 'techDepartmentData.cityId', display: 'Shahar', type: 'dropdown', service: CityServiceProxy, method: 'getAll', category: ['TechDepartment'] },

    // ATM
    { id: 'atmData.atmNumber', display: 'Bankomat raqami', type: 'text', category: ['AtmIssues'] },
    { id: 'atmData.reason', display: 'Sabab', type: 'text', category: ['AtmIssues'] },
    { id: 'atmData.issuingBank', display: 'Chiqaruvchi bank', type: 'text', category: ['AtmIssues'] },
    { id: 'atmData.amount', display: 'Summa (ATM)', type: 'money', category: ['AtmIssues'] },
    { id: 'atmData.phoneNumber', display: 'Telefon raqami', type: 'phone', category: ['AtmIssues'] },
    { id: 'atmData.subCategoryId', display: 'Subkategoriya (ATM)', type: 'dropdown', service: SubCategoryServiceProxy, method: 'getAll', category: ['AtmIssues'] },

    // Payvand Wallet
    { id: 'payvandWalletData.wrongNumber', display: 'Noto‘g‘ri raqam (Wallet)', type: 'phone', category: ['PayvandWallet'] },
    { id: 'payvandWalletData.rightNumber', display: 'To‘g‘ri raqam (Wallet)', type: 'phone', category: ['PayvandWallet'] },
    { id: 'payvandWalletData.serviceId', display: 'Xizmat (Wallet)', type: 'dropdown', service: ServicesServiceProxy, method: 'getAll', category: ['PayvandWallet'] },
    { id: 'payvandWalletData.amount', display: 'Summa (Wallet)', type: 'money', category: ['PayvandWallet'] },
    { id: 'payvandWalletData.subCategoryId', display: 'Subkategoriya (Wallet)', type: 'dropdown', service: SubCategoryServiceProxy, method: 'getAll', category: ['PayvandWallet'] },

    // Payvand Card
    { id: 'payvandCardData.wrongNumber', display: 'Noto‘g‘ri raqam (Card)', type: 'phone', category: ['PayvandCard'] },
    { id: 'payvandCardData.rightNumber', display: 'To‘g‘ri raqam (Card)', type: 'phone', category: ['PayvandCard'] },
    { id: 'payvandCardData.subCategoryId', display: 'Subkategoriya (Card)', type: 'dropdown', service: SubCategoryServiceProxy, method: 'getAll', category: ['PayvandCard'] }
  ];

  availableFields: FieldOption[] = [];
  dropdowns: { [key: string]: boolean } = {};
  search: { [key: string]: string } = {};

  private isEditMode = false;

  constructor(
    injector: Injector,
    public bsModalRef: BsModalRef,
    private bonusSystemService: BonusSystemServiceProxy,
    private lookupService: LookupServiceProxy,
    private priorityService: PriorityLevelServiceProxy,
    private statusService: IssuesStatusesServiceProxy,
    private userService: UserServiceProxy,
    private subCategoryService: SubCategoryServiceProxy,
    private serviceService: ServicesServiceProxy,
    private faultGroupService: FaultGroupServiceProxy,
    private cityService: CityServiceProxy
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.loadLookups();
    this.loadAllDropdownOptions();
    if (this.id) {
      this.isEditMode = true;
      this.loadForEdit();
    } else {
      this.addActionRule();
      this.updateAvailableFields('Classic');
    }
  }

  // ==================== LOOKUP & DROPDOWN OPTIONS ====================
  private loadLookups() {
    Promise.all([
      this.lookupService.getAllPeriodTypes().toPromise(),
      this.lookupService.getAllBudgetTypes().toPromise(),
      this.lookupService.getAllWeekdays().toPromise()
    ]).then(([periods, budgets, weekdays]) => {
      this.periodTypes = periods;
      this.budgetTypes = budgets;
      this.weekdays = weekdays;
    });
  }

  private loadAllDropdownOptions() {
    this.loadPriorities();
    this.loadStatuses();
    this.loadUsers();
    this.loadSubCategories();
    this.loadServices();
    this.loadFaultGroups();
    this.loadCities();
  }

  // TO‘G‘RILANGAN: Barcha getAll ABP standartiga mos
  private loadPriorities() {
    this.priorityService.getAll(undefined, undefined, 0, 1000).subscribe(data => {
      this.priorityOptions = (data.items || []).map((x: any) => ({ id: x.id, display: x.name || x.title, type: 'dropdown' }));
    });
  }

  private loadStatuses() {
    this.statusService.getAll(undefined, undefined, 0, 1000).subscribe(data => {
      this.statusOptions = (data.items || []).map((x: any) => ({ id: x.id, display: x.name || x.title, type: 'dropdown' }));
    });
  }

  private loadUsers() {
    this.userService.getAll(undefined, true, undefined, 0, 1000).subscribe(data => {
      this.userOptions = (data.items || []).map((x: any) => ({ id: x.id, display: x.fullName || x.userName, type: 'user' }));
    });
  }

  private loadSubCategories() {
    this.subCategoryService.getAll(undefined, undefined, 0, 1000).subscribe(data => {
      this.subCategoryOptions = (data.items || []).map((x: any) => ({ id: x.id, display: x.name || x.title, type: 'dropdown' }));
    });
  }

  private loadServices() {
    this.serviceService.getAll(undefined, undefined, 0, 1000).subscribe(data => {
      this.serviceOptions = (data.items || []).map((x: any) => ({ id: x.id, display: x.name, type: 'dropdown' }));
    });
  }

  private loadFaultGroups() {
    this.faultGroupService.getAll(undefined, 0, 1000).subscribe(data => {
      this.faultGroupOptions = (data.items || []).map((x: any) => ({ id: x.id, display: x.name || x.title, type: 'dropdown' }));
    });
  }

  private loadCities() {
    this.cityService.getAll({} as any).subscribe(data => {
      this.cityOptions = (data.items || []).map((x: any) => ({ id: x.id, display: x.name, type: 'dropdown' }));
    });
  }

  updateAvailableFields(category: string) {
    this.availableFields = this.allFields.filter(f =>
      !f.category || f.category.includes(category)
    );
  }

  // ==================== EDIT MODE ====================
  private loadForEdit() {
    this.bonusSystemService.getWithRules(this.id!).subscribe(dto => {
      this.form.name = dto.name;
      this.form.description = dto.description || '';
      this.form.periodTypeId = dto.periodTypeId;
      this.form.periodStartDay = dto.periodStartDay || null;
      this.form.periodStartWeekdayId = dto.periodStartWeekdayId || null;
      this.form.budgetTypeId = dto.budgetTypeId;
      this.form.amount = dto.amount;
      this.form.isActive = dto.isActive;

      this.form.actionRules = (dto.actionRules || []).map(rule => ({
        id: rule.id?.toString() || uuidv4(),
        actionName: rule.actionName,
        points: rule.points,
        rootGroup: this.convertToConditionGroup(rule.conditionJson || '{}')
      }));

      const firstAction = this.form.actionRules[0]?.rootGroup?.items[0]?.condition?.action;
      if (firstAction) {
        const category = this.inferCategoryFromAction(firstAction);
        this.updateAvailableFields(category);
      }
    });
  }

  private inferCategoryFromAction(action: string): string {
    const map: { [key: string]: string } = {
      'callCenterData': 'CallCenter',
      'repairData': 'Repair',
      'techDepartmentData': 'TechDepartment',
      'atmData': 'AtmIssues',
      'payvandWalletData': 'PayvandWallet',
      'payvandCardData': 'PayvandCard'
    };
    for (const key in map) {
      if (action.includes(key)) return map[key];
    }
    return 'Classic';
  }

  private convertToConditionGroup(json: string): ConditionGroup {
    try {
      const data = JSON.parse(json);
      return this.parseGroup(data);
    } catch {
      return { id: uuidv4(), logic: 'AND', items: [], itemLogics: [] };
    }
  }

  private parseGroup(node: any): ConditionGroup {
    const group: ConditionGroup = {
      id: uuidv4(),
      logic: node.logic || 'AND',
      items: [],
      itemLogics: []
    };

    if (node.conditions) {
      node.conditions.forEach((c: any, i: number) => {
        if (c.field) {
          group.items.push({
            id: uuidv4(),
            type: 'condition',
            condition: {
              id: uuidv4(),
              field: c.field,
              operator: c.operator,
              value: c.value
            }
          });
        } else if (c.conditions) {
          group.items.push({
            id: uuidv4(),
            type: 'group',
            group: this.parseGroup(c)
          });
        }
        if (i < node.conditions.length - 1) {
          group.itemLogics.push(node.logic);
        }
      });
    }
    return group;
  }

  // ==================== DROPDOWN ====================
  toggleDropdown(key: string): void {
    Object.keys(this.dropdowns).forEach(k => this.dropdowns[k] = false);
    this.dropdowns[key] = true;
    this.search[key] = '';
  }

  closeDropdown(key: string): void {
    this.dropdowns[key] = false;
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  @HostListener('document:click')
  closeAllDropdowns() {
    Object.keys(this.dropdowns).forEach(k => this.dropdowns[k] = false);
  }

  // ==================== DISPLAY ====================
  getPeriodTypeName(id: number): string { return this.periodTypes.find(t => t.id === id)?.name || this.l('Select'); }
  getBudgetTypeName(id: number): string { return this.budgetTypes.find(t => t.id === id)?.name || this.l('Select'); }
  getWeekdayName(id: number): string { return this.weekdays.find(d => d.id === id)?.name || this.l('Select'); }
  getOperatorName(id: string): string { return this.operators.find(o => o.id === id)?.name || this.l('Select'); }
  getActionName(id: string): string { return this.actions.find(a => a.id === id)?.name || this.l('Select'); }
  getFieldDisplayName(fieldId: string): string { return this.allFields.find(f => f.id === fieldId)?.display || this.l('Select'); }

  isFieldDropdown(fieldId: string): boolean {
    const field = this.allFields.find(f => f.id === fieldId);
    return field?.type === 'dropdown' || field?.type === 'user';
  }

  isUserField(fieldId: string): boolean {
    return ['assigneeUserIds', 'repairData.agentId', 'techDepartmentData.agentId', 'reportedBy'].includes(fieldId);
  }

  getFieldOptions(fieldId: string): FieldOption[] {
    switch (fieldId) {
      case 'priorityId': return this.priorityOptions;
      case 'issueStatusId': return this.statusOptions;
      case 'reportedBy':
      case 'assigneeUserIds':
      case 'techDepartmentData.agentId': return this.userOptions;
      case 'callCenterData.subCategoryId':
      case 'atmData.subCategoryId':
      case 'payvandWalletData.subCategoryId':
      case 'payvandCardData.subCategoryId': return this.subCategoryOptions;
      case 'callCenterData.serviceId':
      case 'payvandWalletData.serviceId': return this.serviceOptions;
      case 'techDepartmentData.issueGroupId': return this.faultGroupOptions;
      case 'techDepartmentData.cityId': return this.cityOptions;
      default: return [];
    }
  }

  getValueDisplay(fieldId: string, value: any): string {
    if (value === 'self') return 'O\'zi';
    const opts = this.getFieldOptions(fieldId);
    return opts.find(o => o.id === value)?.display || value?.toString() || this.l('Select');
  }

  // ==================== FILTER ====================
  getFilteredActions(ruleIndex: number): any[] {
    const query = (this.search['action_' + ruleIndex] || '').toLowerCase();
    return this.actions.filter(a => a.name.toLowerCase().includes(query));
  }

  getFilteredAllFields(ruleIndex: number, groupIndex: string | null, itemIndex: number): FieldOption[] {
    const key = groupIndex === null ? `field_${ruleIndex}_root_${itemIndex}` : `field_${ruleIndex}_${groupIndex}_${itemIndex}`;
    const query = (this.search[key] || '').toLowerCase();
    return this.availableFields.filter(f => f.display.toLowerCase().includes(query));
  }

  getFilteredOperators(ruleIndex: number, groupIndex: string | null, itemIndex: number): any[] {
    const key = groupIndex === null ? `op_${ruleIndex}_root_${itemIndex}` : `op_${ruleIndex}_${groupIndex}_${itemIndex}`;
    const query = (this.search[key] || '').toLowerCase();
    return this.operators.filter(op => op.name.toLowerCase().includes(query));
  }

  getFilteredValueOptions(fieldId: string, ruleIndex: number, groupIndex: string | null, itemIndex: number): FieldOption[] {
    const key = `val_${ruleIndex}_${groupIndex === null ? 'root' : groupIndex}_${itemIndex}`;
    const query = (this.search[key] || '').toLowerCase();
    const options = this.getFieldOptions(fieldId);
    return options.filter(o => o.display.toLowerCase().includes(query));
  }

  // ==================== RULES ====================
  addActionRule(): void {
    const rule: ActionRule = {
      id: uuidv4(),
      actionName: '',
      points: 0,
      rootGroup: { id: uuidv4(), logic: 'AND', items: [], itemLogics: [] }
    };
    rule.rootGroup.items.push({ id: uuidv4(), type: 'condition', condition: { id: uuidv4(), action: 'create' } });
    rule.rootGroup.items.push({ id: uuidv4(), type: 'condition', condition: { id: uuidv4(), field: 'issueStatusId', operator: '==', value: 3 } });
    this.form.actionRules.push(rule);
    this.updateAvailableFields('Classic');
  }

  removeActionRule(i: number): void {
    this.form.actionRules.splice(i, 1);
  }

  dropRule(event: CdkDragDrop<ActionRule[]>): void {
    moveItemInArray(this.form.actionRules, event.previousIndex, event.currentIndex);
  }

  addConditionToGroup(ruleIndex: number, groupIndex: string | null): void {
    const group = this.getGroup(ruleIndex, groupIndex);
    group.items.push({ id: uuidv4(), type: 'condition', condition: { id: uuidv4(), field: 'priorityId', operator: '==', value: '' } });
    this.ensureItemLogics(group);
  }

  addSubGroupToGroup(ruleIndex: number, groupIndex: string | null): void {
    const group = this.getGroup(ruleIndex, groupIndex);
    group.items.push({ id: uuidv4(), type: 'group', group: { id: uuidv4(), logic: 'AND', items: [], itemLogics: [] } });
    this.ensureItemLogics(group);
  }

  removeItemFromGroup(ruleIndex: number, groupIndex: string | null, itemIndex: number): void {
    const group = this.getGroup(ruleIndex, groupIndex);
    if (itemIndex === 0 && groupIndex === null) return;
    group.items.splice(itemIndex, 1);
    if (group.itemLogics.length > group.items.length - 1) {
      group.itemLogics.splice(itemIndex, 1);
    }
  }

  dropItemInGroup(ruleIndex: number, groupIndex: string | null, event: CdkDragDrop<ConditionItem[]>): void {
    const group = this.getGroup(ruleIndex, groupIndex);
    if (event.previousIndex === 0 && groupIndex === null) return;
    moveItemInArray(group.items, event.previousIndex, event.currentIndex);
    if (group.itemLogics.length > 0) {
      const logic = group.itemLogics[event.previousIndex];
      group.itemLogics.splice(event.previousIndex, 1);
      group.itemLogics.splice(event.currentIndex > event.previousIndex ? event.currentIndex - 1 : event.currentIndex, 0, logic);
    }
    this.ensureItemLogics(group);
  }

  toggleGroupLogic(ruleIndex: number, groupIndex: string | null): void {
    const group = this.getGroup(ruleIndex, groupIndex);
    group.logic = group.logic === 'AND' ? 'OR' : 'AND';
  }

  toggleItemLogic(ruleIndex: number, groupIndex: string | null, itemIndex: number): void {
    const group = this.getGroup(ruleIndex, groupIndex);
    group.itemLogics[itemIndex] = group.itemLogics[itemIndex] === 'AND' ? 'OR' : 'AND';
  }

  getItemLogic(ruleIndex: number, groupIndex: string | null, itemIndex: number): 'AND' | 'OR' {
    const group = this.getGroup(ruleIndex, groupIndex);
    return group.itemLogics[itemIndex] || 'AND';
  }

  private getGroup(ruleIndex: number, groupIndex: string | null): ConditionGroup {
    if (groupIndex === null) return this.form.actionRules[ruleIndex].rootGroup;
    const indices = groupIndex.split('_').map(Number);
    let group: ConditionGroup = this.form.actionRules[ruleIndex].rootGroup;
    for (const idx of indices) {
      group = (group.items[idx] as any).group;
    }
    return group;
  }

  private ensureItemLogics(group: ConditionGroup): void {
    const needed = group.items.length - 1;
    while (group.itemLogics.length < needed) group.itemLogics.push(group.logic);
    while (group.itemLogics.length > needed) group.itemLogics.pop();
  }

  // ==================== PREVIEW ====================
  getRuleSummary(rule: ActionRule): string {
    const action = this.getActionName(rule.rootGroup.items[0]?.condition?.action || '');
    const conditions = this.buildSummary(rule.rootGroup);
    return `<strong>${action}</strong>: ${conditions} → <strong>${rule.points} ball</strong>`;
  }

  private buildSummary(group: ConditionGroup): string {
    const parts: string[] = [];
    group.items.forEach((item, i) => {
      if (i === 0 && item.type === 'condition' && item.condition?.action) return;

      if (item.type === 'condition') {
        const field = this.getFieldDisplayName(item.condition.field);
        const op = this.getOperatorName(item.condition.operator);
        const val = this.getValueDisplay(item.condition.field, item.condition.value);
        parts.push(`${field} ${op} <code>${val}</code>`);
      } else if (item.type === 'group') {
        parts.push(`(${this.buildSummary(item.group)})`);
      }

      if (i < group.items.length - 1 && group.itemLogics[i]) {
        parts.push(` <strong class="${group.itemLogics[i] === 'AND' ? 'text-green-600' : 'text-blue-600'}">${group.itemLogics[i]}</strong> `);
      }
    });
    return parts.join(' ');
  }

  // ==================== SAVE ====================
  save(): void {
    if (!this.isValid()) return;

    this.saving = true;
    const dto = this.isEditMode ? this.buildEditDto() : this.buildCreateDto();

    const request = this.isEditMode
      ? this.bonusSystemService.update(dto as EditBonusSystemDto)
      : this.bonusSystemService.create(dto as CreateBonusSystemDto);

    request.subscribe({
      next: () => {
        this.notify.info(this.l('SavedSuccessfully'));
        this.onSave.emit();
        this.bsModalRef.hide();
      },
      error: () => {
        this.saving = false;
        this.notify.error(this.l('SaveFailed'));
      }
    });
  }

  private buildCreateDto(): CreateBonusSystemDto {
    const dto = new CreateBonusSystemDto();
    dto.name = this.form.name;
    dto.description = this.form.description;
    dto.periodTypeId = this.form.periodTypeId;
    dto.periodStartDay = this.form.periodStartDay;
    dto.periodStartWeekdayId = this.form.periodStartWeekdayId;
    dto.budgetTypeId = this.form.budgetTypeId;
    dto.amount = this.form.amount;
    dto.isActive = this.form.isActive;
    dto.actionRules = this.form.actionRules.map(r => {
      const rule = new CreateActionRuleDto();
      rule.actionName = r.actionName;
      rule.points = r.points;
      rule.conditionJson = JSON.stringify(this.buildConditionJson(r.rootGroup));
      rule.isActive = true;
      return rule;
    });
    return dto;
  }

  private buildEditDto(): EditBonusSystemDto {
    const dto = new EditBonusSystemDto();
    dto.id = this.id!;
    dto.name = this.form.name;
    dto.description = this.form.description;
    dto.periodTypeId = this.form.periodTypeId;
    dto.periodStartDay = this.form.periodStartDay;
    dto.periodStartWeekdayId = this.form.periodStartWeekdayId;
    dto.budgetTypeId = this.form.budgetTypeId;
    dto.amount = this.form.amount;
    dto.isActive = this.form.isActive;
    dto.actionRules = this.form.actionRules.map(r => {
      const rule = new EditActionRuleDto();
      rule.id = parseInt(r.id);
      rule.actionName = r.actionName;
      rule.points = r.points;
      rule.conditionJson = JSON.stringify(this.buildConditionJson(r.rootGroup));
      rule.isActive = true;
      return rule;
    });
    return dto;
  }

  private buildConditionJson(group: ConditionGroup): any {
    const conditions: any[] = [];
    group.items.forEach((item) => {
      if (item.type === 'condition' && !item.condition.action) {
        conditions.push({
          field: item.condition.field,
          operator: item.condition.operator,
          value: item.condition.value
        });
      } else if (item.type === 'group') {
        conditions.push(this.buildConditionJson(item.group));
      }
    });
    return { logic: group.logic, conditions };
  }

  isValid(): boolean {
    return this.form.name && this.form.amount > 0 && this.form.periodTypeId > 0 &&
           this.form.budgetTypeId > 0 && this.form.actionRules.length > 0 &&
           this.form.actionRules.every(r => this.isRuleValid(r));
  }

  private isRuleValid(rule: ActionRule): boolean {
    return rule.actionName && rule.points > 0 && this.isGroupValid(rule.rootGroup);
  }

  private isGroupValid(group: ConditionGroup): boolean {
    return group.items.length > 1 && group.items.slice(1).every(item => {
      if (item.type === 'condition') {
        return item.condition.field && item.condition.operator && (item.condition.value !== '' && item.condition.value !== null && item.condition.value !== undefined);
      }
      return item.type === 'group' && this.isGroupValid(item.group);
    });
  }
}