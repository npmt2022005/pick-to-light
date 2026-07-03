/* HARDWARE — đèn Lightstep thật qua demo-bridge.exe
   App ↔ ws://localhost:4000 ↔ demo-bridge.exe ↔ TCP ↔ controller đèn. */
import { SLOT_COLORS, ZONES, getZoneStoreIndices } from './data.js';
import { state, notify } from './store.js';
import { scanFeedback } from './toast.js';
import { confirmBinClick } from './session.js';

export const HW = {
  ws: null,
  bridgeOk: false, // nối được demo-bridge.exe
  ctrlOk: false,   // bridge nối được controller đèn
  showCfg: false,
  userAttempt: false, // người dùng vừa bấm "Kết nối đèn" — chỉ toast lỗi trong trường hợp này
  cfg: (() => { try { return JSON.parse(localStorage.getItem('ptl-hw') || '{}'); } catch (e) { return {}; } })(),
};

export function hwInit() {
  try { HW.ws = new WebSocket(`ws://localhost:${HW.cfg.bridgePort || 4000}/`); }
  catch (e) { return hwRetry(); }
  HW.ws.onopen = () => {
    HW.bridgeOk = true;
    notify();
    if (HW.cfg.ip) hwSend({ type: 'connect', ip: HW.cfg.ip, port: HW.cfg.port || 5003, licenseKey: HW.cfg.licenseKey || '' });
  };
  HW.ws.onmessage = (e) => { try { hwEvent(JSON.parse(e.data)); } catch (err) {} };
  HW.ws.onclose = () => {
    const wasOk = HW.bridgeOk;
    HW.bridgeOk = false; HW.ctrlOk = false;
    if (wasOk) notify();
    hwRetry();
  };
  HW.ws.onerror = () => {};
}
function hwRetry() { setTimeout(hwInit, 5000); }

export function hwSend(obj) {
  if (HW.ws && HW.ws.readyState === 1) HW.ws.send(JSON.stringify(obj));
}

function hwEvent(evt) {
  if (evt.type === 'connected') {
    HW.ctrlOk = true;
    HW.userAttempt = false;
    scanFeedback('ok', `✓ Đèn thật đã kết nối (${evt.ip})`);
    notify();
  } else if (evt.type === 'closed') {
    HW.ctrlOk = false;
    notify();
  } else if (evt.type === 'error') {
    // Lỗi nền (bridge tự thử lại, controller rớt mạng…) → im lặng, chấm trạng thái đủ thông tin.
    // Chỉ báo khi người dùng vừa chủ động bấm "Kết nối đèn".
    if (HW.userAttempt) {
      HW.userAttempt = false;
      scanFeedback('err', `Đèn thật: ${evt.message}`);
    }
  } else if (evt.type === 'received') {
    (evt.addresses || []).forEach((a) => hwButtonPressed(String(a.address)));
  }
}

// Nút bấm vật lý trên module đèn → xác nhận ngăn hiện tại của nhân viên màu đó
function hwButtonPressed(address) {
  const slot = SLOT_COLORS.findIndex((sc) => sc.lightAddr === address);
  if (slot === -1) return;
  if (!state.workerActive[slot] || state.workerCurrentSku[slot] === null) return;
  for (const z of [...ZONES, ...state.extraZones]) {
    if (state.workerZoneDone[slot][z.id]) continue;
    const zi = getZoneStoreIndices(z.id);
    const si = zi[state.workerZoneIdx[slot][z.id]];
    if (si === undefined || state.confirmed[slot][si]) continue;
    confirmBinClick(slot, si);
    return;
  }
}

// Thắp module đèn màu của nhân viên (kèm số lượng cần bỏ vào ngăn hiện tại)
export function hwLightCurrentBin(slot) {
  const skuIdx = state.workerCurrentSku[slot];
  if (skuIdx === null) return;
  const addr = SLOT_COLORS[slot].lightAddr;
  if (!addr) return;
  [...ZONES, ...state.extraZones].forEach((z) => {
    if (state.workerZoneDone[slot][z.id]) return;
    const zi = getZoneStoreIndices(z.id);
    const si = zi[state.workerZoneIdx[slot][z.id]];
    if (si === undefined) return;
    hwSend({ type: 'light', items: [{ address: addr, qty: state.editPlan[skuIdx][si] }] });
  });
}

export function hwClearAll() { hwSend({ type: 'clear' }); }

export function hwToggleCfg() {
  HW.showCfg = !HW.showCfg;
  notify();
}

export function hwConnect({ ip, port, licenseKey }) {
  if (!ip) return scanFeedback('warn', 'Nhập IP controller đèn');
  HW.cfg = { ...HW.cfg, ip, port: port || 5003, licenseKey: licenseKey || '' };
  try { localStorage.setItem('ptl-hw', JSON.stringify(HW.cfg)); } catch (e) {}
  HW.showCfg = false;
  HW.userAttempt = true;
  notify();
  scanFeedback('warn', `Đang kết nối controller ${ip}…`);
  hwSend({ type: 'connect', ip: HW.cfg.ip, port: HW.cfg.port, licenseKey: HW.cfg.licenseKey });
}
