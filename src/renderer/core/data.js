/* DATA — giữ nguyên từ app.js legacy */

// 3 màu LED cố định mỗi khu vực
// lightAddr = địa chỉ module đèn Lightstep thật — mỗi module là đèn MỘT MÀU cố định,
// nên map theo màu nhân viên: Vàng→0004, Đỏ→0002, Xanh→0003
export const SLOT_COLORS = [
  { key: 'yellow', hex: '#FFB01F', label: 'Vàng', lightAddr: '0004' },
  { key: 'red',    hex: '#f0564a', label: 'Đỏ',   lightAddr: '0002' },
  { key: 'green',  hex: '#41bf58', label: 'Xanh', lightAddr: '0003' },
];

// Pool đầy đủ 9 nhân viên (dùng cho bước Phân công khu vực)
export const WORKERS_POOL = [
  { name: 'Nguyễn Văn An',    code: 'NV-2207', color: '#FFB01F' },
  { name: 'Trần Thị Bình',    code: 'NV-3104', color: '#f0564a' },
  { name: 'Lê Văn Cường',     code: 'NV-4102', color: '#41bf58' },
  { name: 'Phạm Văn Dũng',    code: 'NV-5063', color: '#3b82f6' },
  { name: 'Hoàng Thị Em',     code: 'NV-6120', color: '#a855f7' },
  { name: 'Đặng Văn Phúc',    code: 'NV-7031', color: '#ec4899' },
  { name: 'Vũ Thị Giang',     code: 'NV-8044', color: '#06b6d4' },
  { name: 'Ngô Văn Hùng',     code: 'NV-9012', color: '#f97316' },
  { name: 'Đinh Thị Kim',     code: 'NV-0298', color: '#84cc16' },
];

export const ZONES = [
  { id: 'A', name: 'Khu vực A', color: '#3b82f6', floors: 1, racksPerFloor: 1, binsPerRack: 49 },
];

// STORES = cửa hàng trong phiên demo
export const STORES = [
  { id: 'CH-A01', addr: 'A-01', zone: 'A' },
];

// STORES_ALL = toàn bộ ngăn vật lý trong kho (49 ngăn khu A)
export const STORES_ALL = [
  ...Array.from({ length: 49 }, (_, i) => {
    const n = String(i + 1).padStart(2, '0');
    return { id: `CH-A${n}`, addr: `A-${n}`, zone: 'A' };
  }),
];

export const SKUS = [
  { id: 'SKU01', code: 'ATN01-WHT-L',  name: 'Áo thun basic trắng L',  qty: 160 }, // đủ  =160
  { id: 'SKU02', code: 'ATN01-BLK-XL', name: 'Áo thun basic đen XL',   qty: 110 }, // thiếu -22
  { id: 'SKU03', code: 'ATN01-NVY-M',  name: 'Áo thun basic navy M',   qty: 95  }, // dư  +6
  { id: 'SKU04', code: 'ATN02-RED-S',  name: 'Áo thun graphic đỏ S',   qty: 69  }, // đủ  =69
  { id: 'SKU05', code: 'APL01-WHT-L',  name: 'Áo polo piqué trắng L',  qty: 120 }, // thiếu -18
  { id: 'SKU06', code: 'APL01-NVY-M',  name: 'Áo polo piqué navy M',   qty: 130 }, // dư  +7
];

// PLAN[skuIndex][storeIndex]
export const PLAN = [
  [160],
  [132],
  [ 89],
  [ 69],
  [138],
  [123],
];

export const LED_TEST_COLORS = [
  { key: 'yellow', hex: '#FFB01F', label: 'Vàng' },
  { key: 'red',    hex: '#f0564a', label: 'Đỏ'   },
  { key: 'green',  hex: '#41bf58', label: 'Xanh' },
];

export const ZONE_COLORS = ['#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

/* HELPERS */
export function hex2rgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// Trả về mảng global store indices thuộc zone này
export function getZoneStoreIndices(zoneId) {
  return STORES.map((s, i) => (s.zone === zoneId ? i : -1)).filter((i) => i >= 0);
}

export function getPlanTotal(skuIdx) {
  return PLAN[skuIdx].reduce((a, b) => a + b, 0);
}
