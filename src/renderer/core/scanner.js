/* SCANNER — máy quét mã vạch/QR (chế độ USB HID keyboard wedge)
   Máy quét "gõ" chuỗi ký tự rất nhanh rồi kết thúc bằng Enter.
   Test tay không cần máy quét: gõ window.__scan('NV-2207') trong Console. */
import { handleScan } from './session.js';

export function initScanListener() {
  const GAP_MS = 100;  // khoảng lặng giữa 2 phím lớn hơn mức này → coi như chuỗi mới
  const MIN_LEN = 4;
  let buf = '', lastKey = 0, flushTimer = null;
  window.addEventListener('keydown', (e) => {
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return;
    if (e.repeat) return;
    const now = Date.now();
    if (now - lastKey > GAP_MS) buf = '';
    lastKey = now;
    clearTimeout(flushTimer);
    if (e.key === 'Enter') {
      if (buf.length >= MIN_LEN) handleScan(buf);
      buf = '';
      return;
    }
    if (e.key === 'Backspace') {
      // Bộ gõ tiếng Việt hợp ký tự bằng cách xóa-gõ lại — phải trừ buffer theo
      buf = buf.slice(0, -1);
    } else if (e.key.length === 1) {
      buf += e.key;
    }
    if (buf.length >= MIN_LEN) {
      flushTimer = setTimeout(() => { handleScan(buf); buf = ''; }, GAP_MS + 60);
    }
  });
  // Cửa hậu test trong DevTools
  window.__scan = handleScan;
}
