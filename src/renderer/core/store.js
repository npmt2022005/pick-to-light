/* STORE — app state giữ nguyên từ app.js legacy + cơ chế subscribe cho React */
import { SKUS, STORES, PLAN } from './data.js';

export const state = {
  screen: 'tiepnhan',
  planLocked: false, // đã chốt kế hoạch (bước Điều chỉnh)

  // Vận hành
  opsStep: 0,           // 0-5
  simRunning: false,
  simTimer: null,
  simDone: false,
  // false = mô phỏng tự chạy, true = chờ sự kiện từ máy quét thật
  scanMode: (() => { try { return localStorage.getItem('ptl-scanMode') === '1'; } catch (e) { return false; } })(),

  workerActive:     [false, false, false],
  workerCurrentSku: [null, null, null],
  workerRoundsDone: [0, 0, 0],
  workerDone:       [false, false, false],
  skuStatus:        SKUS.map(() => 'pool'), // 'pool' | 'active' | 'done'
  armedSlot:        null,
  confirmed: [
    new Array(STORES.length).fill(false),
    new Array(STORES.length).fill(false),
    new Array(STORES.length).fill(false),
  ],
  workerZoneIdx:  [{ A: 0 }, { A: 0 }, { A: 0 }],
  workerZoneDone: [{ A: false }, { A: false }, { A: false }],

  // Điều chỉnh
  editPlan: Array.from({ length: SKUS.length }, (_, si) => [...PLAN[si]]),

  // IT
  extraZones: [],
  showAddZone: false,
  testBins: {},
  testZoneId: null,

  // Phân công khu vực
  zoneAssignments: {
    A: { yellow: null, red: null, green: null },
  },
  selectingSlot: null,

  // Báo cáo
  distributed: Array.from({ length: SKUS.length }, () => new Array(STORES.length).fill(0)),
};

/* Cơ chế thông báo cho React (useSyncExternalStore) */
let version = 0;
const listeners = new Set();

export function notify() {
  version++;
  listeners.forEach((l) => l());
}

export function subscribe(l) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function getVersion() {
  return version;
}

/* NAV CONFIG */
export const NAV_WORKFLOW = [
  { id: 'tiepnhan',   label: 'Hàng tiếp nhận',     step: 1 },
  { id: 'kehoach',    label: 'Kế hoạch phân phối', step: 2 },
  { id: 'dieuchinhh', label: 'Điều chỉnh',          step: 3 },
  { id: 'phancong',   label: 'Phân công khu vực',   step: 4 },
  { id: 'vanhanh',    label: 'Vận hành',            step: 5 },
  { id: 'baocao',     label: 'Báo cáo',             step: 6 },
];

export const NAV_SYSTEM = [
  { id: 'sodomkho', label: 'Sơ đồ kho' },
];

export function setScreen(id) {
  state.screen = id;
  notify();
}
