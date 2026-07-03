import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './custom.css';
import { initScanListener } from './core/scanner.js';
import { hwInit } from './core/hardware.js';
import { setScreen } from './core/store.js';

// Windows 11: main process truyền ?mica=1 → nền trong mờ lấy màu wallpaper
if (new URLSearchParams(location.search).has('mica')) {
  document.documentElement.classList.add('mica');
}

initScanListener();
hwInit();

// Cửa hậu điều hướng cho script chụp màn hình / test tự động
window.__nav = { setScreen };

createRoot(document.getElementById('root')).render(<App />);
