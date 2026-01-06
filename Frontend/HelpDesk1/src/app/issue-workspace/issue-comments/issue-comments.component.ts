import { Component, Input, Injector, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppComponentBase } from '../../../shared/app-component-base';
import { IssuesCommentsDto, IssuesCommentsPagedResultDto } from '../../../shared/api-services/issues-comments/model/issues-comments-dto.model';
import { IssuesCommentsServiceProxy } from '../../../shared/api-services/issues-comments/issues-comments.service';


@Component({
  selector: 'app-issue-comments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './issue-comments.component.html'
})
export class IssueCommentsComponent extends AppComponentBase {
  @Input() issueId: number = 2;
  comments: IssuesCommentsDto[] = [];
  isLoading = true;
  totalCount: number = 0;
  newComment = '';
  selectedFile: File | null = null;
  editingCommentId: number | null = null;
  dropdownOpenId: number | null = null;
  dropdownPosition: { top: number; left: number } | null = null;
  isCommentsOpen = true;

  constructor(
    private injector: Injector,
    private _issueComments: IssuesCommentsServiceProxy,
    private cdr: ChangeDetectorRef
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.loadComments();
  }

  loadComments(): void {
    this.isLoading = true;
    this._issueComments.getAll(undefined, this.issueId, 'CreationTime DESC', 0, 100).subscribe({
      next: (result: IssuesCommentsPagedResultDto) => {
        this.comments = result.items || [];
        this.totalCount = result.totalCount;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading comments:', error);
      }
    });
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-button') && !target.closest('.dropdown-menu')) {
      this.dropdownOpenId = null;
      this.dropdownPosition = null;
    }
  }

  toggleAccordion(): void {
    this.isCommentsOpen = !this.isCommentsOpen;
  }

  addComment(): void {
    if (this.newComment) {
      if (this.editingCommentId !== null) {
        const comment = this.comments.find(c => c.id === this.editingCommentId);
        if (comment) {
          comment.content = this.newComment;
          comment.fileName = this.selectedFile?.name || comment.fileName;
          comment.creationTime = new Date();
        }
        this.editingCommentId = null;
      } else {
        // const newComment = new IssuesCommentsDto({
        //   id: this.comments.length + 1,
        //   creatorFullName: 'Current User',
        //   creationTime: new Date(),
        //   content: this.newComment,
        //   fileName: this.selectedFile?.name || null
        // });
        // this.comments.push(newComment);
      }
      this.newComment = '';
      this.selectedFile = null;
      this.cdr.detectChanges();
    }
  }

  editComment(id: number): void {
    const comment = this.comments.find(c => c.id === id);
    if (comment) {
      this.newComment = comment.content;
      this.editingCommentId = id;
      this.dropdownOpenId = null;
    }
  }

  deleteComment(id: number): void {
 RMSE: this.comments = this.comments.filter(c => c.id !== id);
    this.dropdownOpenId = null;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  toggleDropdown(id: number, event: Event): void {
    if (this.dropdownOpenId === id) {
      this.dropdownOpenId = null;
      this.dropdownPosition = null;
    } else {
      const target = event.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      this.dropdownOpenId = id;
      this.dropdownPosition = {
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX - 120
      };
    }
  }

  getFileIcon(fileName: string | null): string {
    if (!fileName) return 'file';
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension)) {
      return 'image';
    } else if (['pdf'].includes(extension)) {
      return 'pdf';
    } else if (['txt', 'doc', 'docx'].includes(extension)) {
      return 'text';
    }
    return 'file'; // Umumiy fayl turi uchun
  }
}