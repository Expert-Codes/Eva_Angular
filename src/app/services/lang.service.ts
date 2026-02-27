import { Injectable, signal, effect } from '@angular/core';

export type Lang = 'ar' | 'en';

@Injectable({ providedIn: 'root' })
export class LangService {
  lang = signal<Lang>((localStorage.getItem('eva_lang') as Lang) ?? 'en');

  constructor() {
    effect(() => {
      const l = this.lang();
      localStorage.setItem('eva_lang', l);
      document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
    });
  }

  toggle() { this.lang.set(this.lang() === 'ar' ? 'en' : 'ar'); }

  /** Returns ar or en text based on current language */
  t(ar: string, en: string): string {
    return this.lang() === 'ar' ? ar : en;
  }

  get isAr() { return this.lang() === 'ar'; }
}
