/* Scan feedback: toast + beep + ghi nhật ký sự kiện.
   Toast hiển thị qua Fluent Toaster (đăng ký từ React qua setToastHandler);
   fallback DOM tự chế chỉ dùng khi React chưa mount. */
import { logEvent } from './store.js';

let toastHandler = null;

export function setToastHandler(fn) {
  toastHandler = fn;
}

let scanToastTimer = null;

export function scanFeedback(type, msg) {
  scanBeep(type);
  logEvent(type, msg);
  if (toastHandler) return toastHandler(type, msg);

  // Fallback khi chưa có Toaster
  let el = document.getElementById('scan-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'scan-toast';
    document.body.appendChild(el);
  }
  el.className = `scan-toast ${type}`;
  el.textContent = msg;
  clearTimeout(scanToastTimer);
  scanToastTimer = setTimeout(() => { el.className = 'scan-toast hide'; }, 2500);
}

let scanAudioCtx = null;
function scanBeep(type) {
  try {
    scanAudioCtx = scanAudioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const osc = scanAudioCtx.createOscillator();
    const gain = scanAudioCtx.createGain();
    osc.connect(gain);
    gain.connect(scanAudioCtx.destination);
    osc.frequency.value = type === 'ok' ? 1200 : type === 'warn' ? 600 : 220;
    gain.gain.value = 0.08;
    osc.start();
    osc.stop(scanAudioCtx.currentTime + (type === 'ok' ? 0.09 : 0.25));
  } catch (e) { /* không có audio cũng không sao */ }
}
