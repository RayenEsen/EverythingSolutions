import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class SidebarComponent {
  @Input() isCollapsed = false;
  @Output() isCollapsedChange = new EventEmitter<boolean>(); // 🔥 added

  hoverable = false;
  sidebarWidthExpanded = 260;
  sidebarWidthCollapsed = 80;

  get sidebarWidth(): string {
    return this.isCollapsed ? `${this.sidebarWidthCollapsed}px` : `${this.sidebarWidthExpanded}px`;
  }

  toggleSubMenu(event: MouseEvent, index: number): void {
    const items = document.querySelectorAll('.submenu_item');
    items.forEach((item, i) => {
      if (i !== index) item.classList.remove('show_submenu');
    });
    (event.currentTarget as HTMLElement).classList.toggle('show_submenu');
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    this.hoverable = this.isCollapsed;
    this.isCollapsedChange.emit(this.isCollapsed); // 🔥 notify parent
  }

  expandSidebar(): void {
    this.isCollapsed = false;
    this.hoverable = false;
    this.isCollapsedChange.emit(this.isCollapsed); // 🔥 notify parent
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.isCollapsed = window.innerWidth < 768;
    this.isCollapsedChange.emit(this.isCollapsed); // 🔥 notify parent
  }
}
