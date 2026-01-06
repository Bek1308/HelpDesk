import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private readonly THEME_KEY = 'app-theme';
  private currentTheme: 'light' | 'dark' = 'light';

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.loadTheme();
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY) as 'light' | 'dark' | null;
    this.currentTheme = savedTheme ?? 'light';
    this.applyTheme();
  }

  setTheme(theme: 'light' | 'dark' | 'default'): void {
    this.currentTheme = theme === 'default' ? 'light' : theme;
    localStorage.setItem(this.THEME_KEY, this.currentTheme);
    this.applyTheme();
  }

  toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem(this.THEME_KEY, this.currentTheme);
    this.applyTheme();
  }

  private applyTheme(): void {
    const html = document.documentElement;
    if (this.currentTheme === 'dark') {
      this.renderer.addClass(html, 'dark');
      this.renderer.setAttribute(html, 'data-pc-theme', 'dark');
    } else {
      this.renderer.removeClass(html, 'dark');
      this.renderer.removeAttribute(html, 'data-pc-theme');
    }
  }

  getCurrentTheme(): 'light' | 'dark' {
    return this.currentTheme;
  }
}