import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';
import { STORAGE_KEYS } from '../constants/storage-keys.const';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('returns the fallback when no value is stored', () => {
    expect(service.get<string>('missing', 'fallback')).toBe('fallback');
  });

  it('returns the fallback for invalid JSON', () => {
    localStorage.setItem('invalid', '{not json');
    expect(service.get<string>('invalid', 'fb')).toBe('fb');
  });

  it('round-trips values via JSON', () => {
    const value = { a: 1, b: 'x' };
    service.set('obj', value);
    expect(service.get('obj', {})).toEqual(value);
  });

  it('removes a key', () => {
    service.set('k', 1);
    service.remove('k');
    expect(service.get('k', 0)).toBe(0);
  });

  it('clears all app keys', () => {
    service.set(STORAGE_KEYS.orders, []);
    service.set(STORAGE_KEYS.settings, {});
    service.clear();
    expect(localStorage.length).toBe(0);
  });
});