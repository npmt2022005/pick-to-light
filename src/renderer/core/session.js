/* SESSION — toàn bộ logic nghiệp vụ giữ nguyên từ app.js legacy,
   mọi lệnh render DOM được thay bằng notify() */
import {
  SLOT_COLORS, WORKERS_POOL, ZONES, STORES, SKUS, PLAN, ZONE_COLORS,
  getZoneStoreIndices,
} from './data.js';
import { state, notify, setScreen } from './store.js';
import { scanFeedback } from './toast.js';
import { hwLightCurrentBin, hwClearAll } from './hardware.js';

export function getEditTotal(si) {
  return state.editPlan[si].reduce((a, b) => a + b, 0);
}

export function getWorkerCurrentSkuIdx(slot) {
  return state.workerCurrentSku[slot];
}

export function getWorkerCurrentSku(slot) {
  const idx = getWorkerCurrentSkuIdx(slot);
  return idx !== null ? SKUS[idx] : null;
}

// Gán SKU cho nhân viên (quét thùng ở chế độ thật, hoặc tự động ở mô phỏng)
export function claimSku(slot, skuIdx) {
  state.workerCurrentSku[slot] = skuIdx;
  state.skuStatus[skuIdx] = 'active';
  [...ZONES, ...state.extraZones].forEach((z) => {
    state.workerZoneIdx[slot][z.id] = 0;
    state.workerZoneDone[slot][z.id] = false;
  });
  state.confirmed[slot] = new Array(STORES.length).fill(false);
  settleIdleWorkers();
  hwLightCurrentBin(slot);
}

// "Giơ tay" có hẹn giờ: quét thẻ xong phải quét thùng trong ARM_TIMEOUT_MS
export const ARM_TIMEOUT_MS = 20000;
let armedTimer = null;

export function armSlot(slot) {
  state.armedSlot = slot;
  clearTimeout(armedTimer);
  armedTimer = setTimeout(() => {
    if (state.armedSlot !== slot) return;
    state.armedSlot = null;
    const ws = getWorkersForSlot(SLOT_COLORS[slot].key);
    const name = ws.length ? ws[0].name : `đèn ${SLOT_COLORS[slot].label}`;
    scanFeedback('warn', `⌁ Quá ${ARM_TIMEOUT_MS / 1000}s không quét thùng — ${name} cần quét lại thẻ`);
    notify();
  }, ARM_TIMEOUT_MS);
}

export function disarmSlot() {
  clearTimeout(armedTimer);
  state.armedSlot = null;
}

// Pool hết SKU → nhân viên nào đang rảnh coi như xong ca
export function settleIdleWorkers() {
  if (state.skuStatus.some((st) => st === 'pool')) return;
  [0, 1, 2].forEach((s) => {
    if (state.workerActive[s] && state.workerCurrentSku[s] === null) state.workerDone[s] = true;
  });
}

/* ─── PHÂN CÔNG KHU VỰC ─── */
export function getAssignedCodes() {
  const codes = [];
  Object.values(state.zoneAssignments).forEach((zone) => {
    Object.values(zone).forEach((code) => { if (code) codes.push(code); });
  });
  return codes;
}

export function getPoolWorkers() {
  const assigned = new Set(getAssignedCodes());
  return WORKERS_POOL.filter((w) => !assigned.has(w.code));
}

// Danh sách worker được gán cho 1 màu qua tất cả zone
export function getWorkersForSlot(colorKey) {
  const result = [];
  ZONES.forEach((z) => {
    const code = state.zoneAssignments[z.id] && state.zoneAssignments[z.id][colorKey];
    if (code) {
      const w = WORKERS_POOL.find((x) => x.code === code);
      if (w) result.push({ ...w, zoneId: z.id, zoneName: z.name });
    }
  });
  return result;
}

export function startPickSlot(zoneId, colorKey) {
  const cur = state.selectingSlot;
  if (cur && cur.zoneId === zoneId && cur.colorKey === colorKey) {
    state.selectingSlot = null;
  } else {
    state.selectingSlot = { zoneId, colorKey };
  }
  notify();
}

export function assignWorkerToSlot(code) {
  if (!state.selectingSlot) return;
  const { zoneId, colorKey } = state.selectingSlot;
  if (!state.zoneAssignments[zoneId]) return;
  state.zoneAssignments[zoneId][colorKey] = code;
  state.selectingSlot = null;
  notify();
}

export function removeWorkerFromSlot(zoneId, colorKey) {
  if (state.zoneAssignments[zoneId]) {
    state.zoneAssignments[zoneId][colorKey] = null;
  }
  state.selectingSlot = null;
  notify();
}

export function cancelPickSlot() {
  state.selectingSlot = null;
  notify();
}

// Tìm slot màu LED mà nhân viên (theo mã thẻ) được phân công
export function findSlotForWorkerCode(code) {
  for (const z of [...ZONES, ...state.extraZones]) {
    const za = state.zoneAssignments[z.id];
    if (!za) continue;
    for (let slot = 0; slot < SLOT_COLORS.length; slot++) {
      if ((za[SLOT_COLORS[slot].key] || '') === code) return slot;
    }
  }
  return -1;
}

/* ─── ĐIỀU CHỈNH ─── */
export function updatePlanCell(si, ci, val) {
  state.editPlan[si][ci] = Math.max(0, parseInt(val) || 0);
  notify();
}

export function chotKeHoach() {
  const hasDeficit = SKUS.some((sku, si) => getEditTotal(si) > sku.qty);
  if (hasDeficit) return;
  state.planLocked = true;
  setScreen('phancong');
}

/* ─── VẬN HÀNH ─── */
export function startNewSession() {
  if (state.simTimer) clearInterval(state.simTimer);
  state.opsStep          = 0;
  state.simRunning       = false;
  state.simTimer         = null;
  state.simDone          = false;
  state.workerActive     = [false, false, false];
  state.workerCurrentSku = [null, null, null];
  state.workerRoundsDone = [0, 0, 0];
  state.workerDone       = [false, false, false];
  state.skuStatus        = SKUS.map(() => 'pool');
  disarmSlot();
  state.confirmed        = [new Array(STORES.length).fill(false), new Array(STORES.length).fill(false), new Array(STORES.length).fill(false)];
  state.workerZoneIdx    = [{ A: 0 }, { A: 0 }, { A: 0 }];
  state.workerZoneDone   = [{ A: false }, { A: false }, { A: false }];
  state.distributed      = Array.from({ length: SKUS.length }, () => new Array(STORES.length).fill(0));
  state.editPlan         = Array.from({ length: SKUS.length }, (_, si) => [...PLAN[si]]);
  state.zoneAssignments  = {
    A: { yellow: null, red: null, green: null },
  };
  state.selectingSlot = null;
  // Phiên mới nhảy thẳng tới Phân công (kế hoạch reset về gốc, coi như đã chốt)
  state.planLocked = true;
  hwClearAll();
  setScreen('phancong');
}

export function opsAdvance() {
  const step = state.opsStep;
  if (step <= 2) {
    const idx = state.workerActive.indexOf(false);
    if (idx !== -1) state.workerActive[idx] = true;
    state.opsStep = Math.min(3, state.workerActive.filter(Boolean).length);
  } else if (step === 3) {
    state.opsStep = 4;
  } else if (step === 4) {
    state.opsStep = 5;
    state.simRunning = true;
    startSimulation();
  }
  notify();
}

export function startSimulation() {
  state.simTimer = setInterval(simTick, 700);
}

function simTick() {
  // Mô phỏng: nhân viên rảnh tự bốc SKU tiếp theo còn trong pool
  if (!state.scanMode) {
    [0, 1, 2].forEach((slot) => {
      if (!state.workerActive[slot] || state.workerDone[slot]) return;
      if (state.workerCurrentSku[slot] !== null) return;
      const next = state.skuStatus.indexOf('pool');
      if (next !== -1) claimSku(slot, next);
    });
    settleIdleWorkers();
  }

  if (checkSessionEnd()) return;

  // Máy quét thật: từng ngăn do nhân viên bấm đèn xác nhận, không tự chạy
  if (state.scanMode) { notify(); return; }

  const eligiblePairs = [];
  [0, 1, 2].forEach((slot) => {
    if (!state.workerActive[slot] || state.workerDone[slot] || state.workerCurrentSku[slot] === null) return;
    ZONES.forEach((z) => {
      const code = state.zoneAssignments[z.id] && state.zoneAssignments[z.id][SLOT_COLORS[slot].key];
      if (!code) return;
      if (state.workerZoneDone[slot][z.id]) return;
      eligiblePairs.push({ slot, zoneId: z.id });
    });
  });

  if (eligiblePairs.length === 0) { notify(); return; }

  const { slot, zoneId } = eligiblePairs[Math.floor(Math.random() * eligiblePairs.length)];
  confirmCurrentBin(slot, zoneId);
}

// Mọi SKU đã 'done' → chốt phiên
export function checkSessionEnd() {
  if (!state.skuStatus.every((st) => st === 'done')) return false;
  if (state.simTimer) clearInterval(state.simTimer);
  state.simRunning = false;
  state.simDone = true;
  [0, 1, 2].forEach((s) => { if (state.workerActive[s]) state.workerDone[s] = true; });
  hwClearAll();
  notify();
  return true;
}

// Xác nhận ngăn hiện tại của (slot, zone)
export function confirmCurrentBin(slot, zoneId) {
  const zoneIndices = getZoneStoreIndices(zoneId);
  const localIdx = state.workerZoneIdx[slot][zoneId];
  const globalStoreIdx = zoneIndices[localIdx];

  state.confirmed[slot][globalStoreIdx] = true;
  const skuIdx = getWorkerCurrentSkuIdx(slot);
  if (skuIdx !== null) {
    state.distributed[skuIdx][globalStoreIdx] = state.editPlan[skuIdx][globalStoreIdx];
  }

  if (localIdx < zoneIndices.length - 1) {
    state.workerZoneIdx[slot][zoneId]++;
    hwLightCurrentBin(slot);
  } else {
    state.workerZoneDone[slot][zoneId] = true;

    const allZonesDone = ZONES.every((z) => {
      const code = state.zoneAssignments[z.id] && state.zoneAssignments[z.id][SLOT_COLORS[slot].key];
      return !code || state.workerZoneDone[slot][z.id];
    });

    if (allZonesDone) {
      const doneSku = state.workerCurrentSku[slot];
      if (doneSku !== null) state.skuStatus[doneSku] = 'done';
      state.workerCurrentSku[slot] = null;
      state.workerRoundsDone[slot]++;
      settleIdleWorkers();
      if (checkSessionEnd()) return;
    }
  }
  notify();
}

// Máy quét thật: bấm đèn của ngăn = nút xác nhận trên module đèn thật
export function confirmBinClick(slot, storeIdx) {
  if (!state.scanMode || !state.simRunning) return;
  if (!state.workerActive[slot] || state.workerCurrentSku[slot] === null) return;
  const zoneId = STORES[storeIdx].zone;
  const zoneIndices = getZoneStoreIndices(zoneId);
  const localIdx = state.workerZoneIdx[slot][zoneId];
  if (state.workerZoneDone[slot][zoneId] || zoneIndices[localIdx] !== storeIdx || state.confirmed[slot][storeIdx]) {
    return scanFeedback('warn', 'Chưa đến lượt ngăn này');
  }
  const sku = SKUS[state.workerCurrentSku[slot]];
  confirmCurrentBin(slot, zoneId);
  scanFeedback('ok', `✓ ${STORES[storeIdx].id} — đã bỏ ${sku.code}`);
}

/* ─── CHẾ ĐỘ MÁY QUÉT ─── */
export function setScanMode(on) {
  if (state.scanMode === on) return;
  toggleScanMode();
}

export function toggleScanMode() {
  state.scanMode = !state.scanMode;
  disarmSlot();
  try { localStorage.setItem('ptl-scanMode', state.scanMode ? '1' : '0'); } catch (e) {}
  if (state.scanMode) {
    // SKU mô phỏng đã tự gán nhưng chưa chia được ngăn nào → trả về pool
    let released = false;
    [0, 1, 2].forEach((s) => {
      const idx = state.workerCurrentSku[s];
      if (idx === null) return;
      if (!state.confirmed[s].some(Boolean)) {
        state.skuStatus[idx] = 'pool';
        state.workerCurrentSku[s] = null;
        released = true;
      }
    });
    if (released) {
      [0, 1, 2].forEach((s) => {
        if (state.workerActive[s] && state.workerCurrentSku[s] === null) state.workerDone[s] = false;
      });
    }
  }
  notify();
}

/* ─── SCANNER ROUTER ─── */
export function handleScan(raw) {
  // Bộ gõ tiếng Việt (Telex) có thể biến đổi phím máy quét gõ vào — đảo ngược trước khi so mã
  const code = raw.trim().toUpperCase()
    .replace(/Ư/g, 'W')
    .replace(/Đ/g, 'DD')
    .replace(/Â/g, 'AA')
    .replace(/Ê/g, 'EE')
    .replace(/Ô/g, 'OO');

  const worker = WORKERS_POOL.find((w) => w.code.toUpperCase() === code);
  if (worker) return handleBadgeScan(worker);

  const skuIdx = SKUS.findIndex((s) => s.code.toUpperCase() === code);
  if (skuIdx !== -1) return handleSkuScan(skuIdx);

  scanFeedback('err', `Mã không hợp lệ: ${code}`);
}

function handleBadgeScan(worker) {
  if (state.screen !== 'vanhanh') {
    return scanFeedback('warn', `${worker.name}: mở màn hình Vận hành để check-in`);
  }
  if (state.simDone) return scanFeedback('warn', 'Phiên đã kết thúc');

  const slot = findSlotForWorkerCode(worker.code);
  if (slot === -1) return scanFeedback('err', `${worker.name} chưa được phân công khu vực`);

  if (state.armedSlot !== null) {
    if (state.armedSlot === slot) {
      disarmSlot();
      scanFeedback('warn', `Đã hủy — ${worker.name} không nhận thùng`);
      notify();
      return;
    }
    const armedWs = getWorkersForSlot(SLOT_COLORS[state.armedSlot].key);
    const armedName = armedWs.length ? armedWs[0].name : 'người trước';
    return scanFeedback('err', `Đang chờ ${armedName} quét thùng — quét lại thẻ ${armedName} để hủy`);
  }

  if (state.workerActive[slot]) {
    if (state.workerDone[slot]) return scanFeedback('warn', `${worker.name} đã xong ca`);
    if (state.workerCurrentSku[slot] !== null) {
      return scanFeedback('warn', `${worker.name} đang chia ${SKUS[state.workerCurrentSku[slot]].code}, chưa nhận thùng mới được`);
    }
    if (!state.skuStatus.some((st) => st === 'pool')) return scanFeedback('warn', 'Hết thùng SKU để nhận');
    armSlot(slot);
    scanFeedback('ok', `⌁ ${worker.name}: quét tem thùng SKU để nhận việc`);
    notify();
    return;
  }

  // Check-in vào ca
  state.workerActive[slot] = true;
  if (state.opsStep <= 3) {
    state.opsStep = Math.min(3, state.workerActive.filter(Boolean).length);
  }
  if (state.scanMode) {
    armSlot(slot);
    scanFeedback('ok', `✓ ${worker.name} vào ca — quét tem thùng SKU để nhận việc`);
  } else {
    scanFeedback('ok', `✓ ${worker.name} vào ca — đèn ${SLOT_COLORS[slot].label}`);
  }
  notify();
}

function handleSkuScan(skuIdx) {
  const sku = SKUS[skuIdx];
  if (state.screen !== 'vanhanh') {
    return scanFeedback('warn', `${sku.code}: mở màn hình Vận hành trước`);
  }
  if (!state.scanMode && state.opsStep < 5) {
    return scanFeedback('warn', `${sku.code}: phiên chưa vận hành, chưa cần quét thùng`);
  }
  if (state.skuStatus[skuIdx] === 'done') {
    return scanFeedback('warn', `${sku.code} đã phân xong`);
  }
  if (state.skuStatus[skuIdx] === 'active') {
    const holder = state.workerCurrentSku.indexOf(skuIdx);
    const ws = holder !== -1 ? getWorkersForSlot(SLOT_COLORS[holder].key) : [];
    const who = ws.length ? ws.map((w) => w.name.split(' ').pop()).join(' & ') : 'người khác';
    return scanFeedback('warn', `${sku.code} đang được ${who} phân hàng`);
  }
  if (state.armedSlot === null) {
    return scanFeedback('err', `Quét thẻ nhân viên trước, rồi quét thùng ${sku.code}`);
  }

  const slot = state.armedSlot;
  disarmSlot();
  if (!state.simRunning && !state.simDone) {
    state.opsStep = 5;
    state.simRunning = true;
    startSimulation();
  }
  claimSku(slot, skuIdx);
  const ws = getWorkersForSlot(SLOT_COLORS[slot].key);
  const names = ws.length ? ws.map((w) => w.name.split(' ').pop()).join(' & ') : `đèn ${SLOT_COLORS[slot].label}`;
  scanFeedback('ok', `✓ ${sku.code} — ${names} bắt đầu phân hàng`);
  notify();
}

/* ─── IT: SƠ ĐỒ KHO ─── */
export function toggleAddZone() {
  state.showAddZone = !state.showAddZone;
  notify();
}

export function addZone({ id, name, floors, racks, bins }) {
  const color = ZONE_COLORS[([...ZONES, ...state.extraZones].length) % ZONE_COLORS.length];
  if (!id || !name) return;
  state.extraZones.push({ id, name, color, floors, racksPerFloor: racks, binsPerRack: bins });
  state.showAddZone = false;
  notify();
}

export function removeExtraZone(zi) {
  state.extraZones.splice(zi, 1);
  notify();
}

export function testBin(addr, colorKey) {
  if (!state.testBins[addr]) state.testBins[addr] = {};
  if (state.testBins[addr][colorKey]) delete state.testBins[addr][colorKey];
  else state.testBins[addr][colorKey] = true;
  notify();
}

export function toggleTestZonePanel(zoneId) {
  state.testZoneId = state.testZoneId === zoneId ? null : zoneId;
  notify();
}

export function testZone(zoneId, colorKey) {
  const zone = [...ZONES, ...state.extraZones].find((z) => z.id === zoneId);
  if (!zone) return;
  const addrs = [];
  if (zone.floors && zone.racksPerFloor && zone.binsPerRack) {
    for (let n = 1; n <= zone.binsPerRack; n++) addrs.push(`${zone.id}-${String(n).padStart(2, '0')}`);
  } else {
    STORES.filter((s) => s.zone === zoneId).forEach((s) => addrs.push(s.addr));
  }
  addrs.forEach((addr) => { state.testBins[addr] = { [colorKey]: true }; });
  notify();
}

export function clearZone(zoneId) {
  const zone = [...ZONES, ...state.extraZones].find((z) => z.id === zoneId);
  if (!zone) return;
  Object.keys(state.testBins).forEach((addr) => {
    if (addr.startsWith(zoneId + '-')) delete state.testBins[addr];
  });
  state.testZoneId = null;
  notify();
}
