// feather-icon.service.ts
import { Injectable } from '@angular/core';
import feather from 'feather-icons';

@Injectable({ providedIn: 'root' })
export class FeatherIconService {
  replaceIcons() {
    feather.replace();
  }
}
