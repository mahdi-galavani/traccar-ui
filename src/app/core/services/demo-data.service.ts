import { Injectable, signal } from '@angular/core';
import { AppPersonDto } from '../models/app-person.model';
import { AppRoleDto, AppUserRoleDto } from '../models/app-role.model';
import { AppUserDto } from '../models/app-user.model';
import { BaseInfoDto } from '../models/base-info.model';
import { BaseInfoHeaderDto } from '../models/base-info-header.model';
import { LocationDto } from '../models/location.model';

type DemoResource = Record<string, unknown[]>;

const DEMO_STORAGE_KEY = 'fleet_demo_data';

@Injectable({ providedIn: 'root' })
export class DemoDataService {
  private idCounter = 0;
  private readonly browserStorage = typeof localStorage === 'undefined' ? null : localStorage;
  private readonly state = signal<DemoResource>(this.loadState());

  list<T>(resource: string): T[] {
    return this.clone((this.state()[resource] ?? []) as T[]);
  }

  find<T extends { id?: unknown }>(resource: string, id: unknown): T | undefined {
    return this.list<T>(resource).find((item) => String(item.id) === String(id));
  }

  save<T extends { id?: unknown; version?: number }>(resource: string, value: T): { id: unknown } {
    const current = this.list<T>(resource);
    const incoming = this.clone(value);
    const existingIndex = incoming.id == null
      ? -1
      : current.findIndex((item) => String(item.id) === String(incoming.id));

    if (existingIndex >= 0) {
      incoming.version = (current[existingIndex].version ?? 0) + 1;
      current[existingIndex] = incoming;
    } else {
      incoming.id = incoming.id ?? this.nextId(resource, current);
      incoming.version = incoming.version ?? 1;
      current.push(incoming);
    }

    this.write(resource, current);
    return { id: incoming.id };
  }

  delete(resource: string, id: unknown): void {
    this.write(resource, this.list(resource).filter((item: any) => String(item.id) !== String(id)));
  }

  count(resource: string): number {
    return this.list(resource).length;
  }

  private write(resource: string, value: unknown[]): void {
    const next = { ...this.state(), [resource]: this.clone(value) };
    this.state.set(next);
    this.persist(next);
  }

  private nextId(resource: string, current: Array<{ id?: unknown }>): unknown {
    if (new Set(['base-info', 'base-info-header', 'location']).has(resource)) {
      return current.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
    }
    this.idCounter += 1;
    return `demo-${resource}-${Date.now()}-${this.idCounter}`;
  }

  private loadState(): DemoResource {
    if (this.browserStorage) {
      try {
        const raw = this.browserStorage.getItem(DEMO_STORAGE_KEY);
        const saved = raw ? JSON.parse(raw) as DemoResource : null;
        // Ignore incompatible older demo data and seed the fleet workspace.
        if (saved?.['vehicle'] && saved?.['tracker'] && saved?.['route']) return saved;
      } catch {
        // Fall back to seed data when local storage is invalid.
      }
    }
    return this.seed();
  }

  private persist(value: DemoResource): void {
    if (!this.browserStorage) return;
    try {
      this.browserStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(value));
    } catch {
      // Demo mode remains usable when browser storage is unavailable.
    }
  }

  private clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
  }

  private seed(): DemoResource {
    const headers: BaseInfoHeaderDto[] = [
      { id: 1, version: 1, code: 'vehicle-type', title: 'Vehicle types', description: 'Fleet vehicle classifications' },
      { id: 2, version: 1, code: 'personnel-role', title: 'Personnel roles', description: 'Driver and operations roles' },
      { id: 3, version: 1, code: 'route-type', title: 'Route types', description: 'Operational route categories' },
      { id: 4, version: 1, code: 'alert-type', title: 'Alert types', description: 'Fleet events and alerts' },
    ];

    const baseInfo: BaseInfoDto[] = [
      { id: 1, version: 1, code: 'VAN', title: 'Van', header: { id: 1 } },
      { id: 2, version: 1, code: 'TRUCK', title: 'Truck', header: { id: 1 } },
      { id: 3, version: 1, code: 'MOTORCYCLE', title: 'Motorcycle', header: { id: 1 } },
      { id: 4, version: 1, code: 'DRIVER', title: 'Driver', header: { id: 2 } },
      { id: 5, version: 1, code: 'SUPERVISOR', title: 'Fleet supervisor', header: { id: 2 } },
      { id: 6, version: 1, code: 'DELIVERY', title: 'Delivery route', header: { id: 3 } },
      { id: 7, version: 1, code: 'SERVICE', title: 'Service route', header: { id: 3 } },
      { id: 8, version: 1, code: 'SPEED', title: 'Speed violation', header: { id: 4 } },
      { id: 9, version: 1, code: 'GEOFENCE', title: 'Geofence event', header: { id: 4 } },
    ];

    const roles: AppRoleDto[] = [
      { id: 'role-admin', version: 1, code: 'ADMIN', title: 'System administrator' },
      { id: 'role-ops', version: 1, code: 'OPS', title: 'Fleet operations' },
    ];

    const users: AppUserDto[] = [
      { id: 'user-admin', version: 1, username: 'admin', password: 'admin', enabled: true },
      { id: 'user-ops', version: 1, username: 'ops', password: 'demo', enabled: true },
    ];

    const people: AppPersonDto[] = [
      { id: 'person-1', version: 1, name: 'Reza', family: 'Kazemi', nationalCode: '0012345678', phoneNumber: '09121234567', job: { id: 4, title: 'Driver' } },
      { id: 'person-2', version: 1, name: 'Sara', family: 'Ahmadi', nationalCode: '0023456789', phoneNumber: '09129876543', job: { id: 5, title: 'Fleet supervisor' } },
      { id: 'person-3', version: 1, name: 'Mina', family: 'Moradi', nationalCode: '0034567890', phoneNumber: '09351234567', job: { id: 4, title: 'Driver' } },
    ];

    const locations: LocationDto[] = [
      { id: 1, version: 1, title: 'Asia', code: 'AS', type: 'CONTINENT', enabled: true, parent: null },
      { id: 2, version: 1, title: 'Iran', code: 'IR', type: 'COUNTRY', enabled: true, parent: { id: 1 } },
      { id: 3, version: 1, title: 'Tehran', code: 'THR', type: 'PROVINCE', enabled: true, parent: { id: 2 } },
      { id: 4, version: 1, title: 'Mashhad', code: 'MHD', type: 'CITY', enabled: true, parent: { id: 2 } },
    ];

    const vehicles = [
      { id: 'vehicle-1', version: 1, name: 'پشتیبانی مرکزی ۱', plate: '۱۲ الف ۳۴۵', deviceId: 'TRK-1001', type: 'Van', status: 'online', speed: 62, driver: 'Reza Kazemi', location: 'Tehran · Hemmat Highway', latitude: 35.744, longitude: 51.375, lastSeen: '2026-09-22T09:22:00+03:30', fuel: 78, mileage: 12540 },
      { id: 'vehicle-2', version: 1, name: 'خودروی خدمات ۲', plate: '۲۱ ب ۸۸۱', deviceId: 'TRK-1002', type: 'Truck', status: 'idle', speed: 0, driver: 'Mina Moradi', location: 'Tehran · Vanak', latitude: 35.757, longitude: 51.409, lastSeen: '2026-09-22T09:24:00+03:30', fuel: 54, mileage: 8950 },
      { id: 'vehicle-3', version: 1, name: 'پیک منطقه شمال', plate: '۴۵ ج ۷۰۲', deviceId: 'TRK-1003', type: 'Motorcycle', status: 'online', speed: 38, driver: 'Ali Rahimi', location: 'Tehran · Tajrish', latitude: 35.804, longitude: 51.427, lastSeen: '2026-09-22T09:25:00+03:30', fuel: 63, mileage: 4320 },
      { id: 'vehicle-4', version: 1, name: 'خودروی رزرو', plate: '۶۸ د ۱۱۲', deviceId: 'TRK-1004', type: 'Van', status: 'offline', speed: 0, driver: 'Unassigned', location: 'Depot · East yard', latitude: 35.72, longitude: 51.48, lastSeen: '2026-09-22T07:42:00+03:30', fuel: 91, mileage: 22110 },
    ];

    const trackers = [
      { id: 'tracker-1', version: 1, name: 'TRK-1001', imei: '863456789012341', protocol: 'GT06', vehicle: 'پشتیبانی مرکزی ۱', status: 'online', lastSeen: '2026-09-22T09:22:00+03:30', signal: 92 },
      { id: 'tracker-2', version: 1, name: 'TRK-1002', imei: '863456789012342', protocol: 'GT06', vehicle: 'خودروی خدمات ۲', status: 'online', lastSeen: '2026-09-22T09:24:00+03:30', signal: 84 },
      { id: 'tracker-3', version: 1, name: 'TRK-1003', imei: '863456789012343', protocol: 'Teltonika', vehicle: 'پیک منطقه شمال', status: 'online', lastSeen: '2026-09-22T09:25:00+03:30', signal: 76 },
      { id: 'tracker-4', version: 1, name: 'TRK-1004', imei: '863456789012344', protocol: 'GT06', vehicle: 'خودروی رزرو', status: 'offline', lastSeen: '2026-09-22T07:42:00+03:30', signal: 0 },
    ];

    const routes = [
      { id: 'route-1', version: 1, name: 'توزیع منطقه مرکزی', type: 'Delivery', origin: 'انبار مرکزی', destination: 'میدان ونک', distance: 24.6, duration: '01:10', vehicles: 3, status: 'active', updatedAt: '2026-09-22T08:40:00+03:30' },
      { id: 'route-2', version: 1, name: 'سرویس شمال تهران', type: 'Service', origin: 'پارکینگ شمال', destination: 'تجریش', distance: 18.2, duration: '00:48', vehicles: 1, status: 'active', updatedAt: '2026-09-21T17:12:00+03:30' },
      { id: 'route-3', version: 1, name: 'مسیر پشتیبانی شرق', type: 'Service', origin: 'انبار مرکزی', destination: 'تهرانپارس', distance: 31.8, duration: '01:25', vehicles: 2, status: 'draft', updatedAt: '2026-09-20T11:30:00+03:30' },
    ];

    const geofences = [
      { id: 'geofence-1', version: 1, name: 'انبار مرکزی', type: 'Polygon', color: '#0284c7', vehicles: 2, status: 'active' },
      { id: 'geofence-2', version: 1, name: 'محدوده ممنوعه شمال', type: 'Circle', color: '#e11d48', vehicles: 0, status: 'active' },
      { id: 'geofence-3', version: 1, name: 'پارکینگ شرق', type: 'Polygon', color: '#16a34a', vehicles: 1, status: 'active' },
    ];

    const events = [
      { id: 'event-1', version: 1, severity: 'critical', title: 'عبور از سرعت مجاز', vehicle: 'پشتیبانی مرکزی ۱', detail: 'سرعت ۹۲ کیلومتر بر ساعت در محدوده ۶۰', time: '09:18', resolved: false },
      { id: 'event-2', version: 1, severity: 'warning', title: 'ورود به محدوده کاری', vehicle: 'پیک منطقه شمال', detail: 'ورود ثبت شد', time: '09:04', resolved: true },
      { id: 'event-3', version: 1, severity: 'info', title: 'اتصال مجدد ردیاب', vehicle: 'خودروی خدمات ۲', detail: 'سیگنال GPS پایدار شد', time: '08:56', resolved: true },
    ];

    const userRoles: AppUserRoleDto[] = [
      { id: 'user-admin', version: 1, roles: [roles[0]] },
      { id: 'user-ops', version: 1, roles: [roles[1]] },
    ];

    return {
      'base-info-header': headers,
      'base-info': baseInfo,
      'app-role': roles,
      'app-user': users,
      'app-person': people,
      location: locations,
      vehicle: vehicles,
      tracker: trackers,
      route: routes,
      geofence: geofences,
      event: events,
      'app-user-role': userRoles,
    };
  }
}
