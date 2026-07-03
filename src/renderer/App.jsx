import { useEffect, useSyncExternalStore } from 'react';
import {
  FluentProvider, webLightTheme,
  Toolbar, ToolbarButton, ToolbarDivider, Tooltip,
  Toaster, Toast, ToastTitle, useToastController, useId,
} from '@fluentui/react-components';
import { MapRegular } from '@fluentui/react-icons';
import { state, subscribe, getVersion, setScreen, NAV_WORKFLOW, NAV_SYSTEM } from './core/store.js';
import { getAssignedCodes } from './core/session.js';
import { setToastHandler } from './core/toast.js';
import { HW } from './core/hardware.js';
import { SKUS, SLOT_COLORS } from './core/data.js';
import TiepNhan from './screens/TiepNhan.jsx';
import KeHoach from './screens/KeHoach.jsx';
import DieuChinh from './screens/DieuChinh.jsx';
import PhanCong from './screens/PhanCong.jsx';
import VanHanh from './screens/VanHanh.jsx';
import BaoCao from './screens/BaoCao.jsx';
import SoDoKho from './screens/SoDoKho.jsx';

const SCREENS = {
  sodomkho: SoDoKho,
  tiepnhan: TiepNhan,
  kehoach: KeHoach,
  dieuchinhh: DieuChinh,
  phancong: PhanCong,
  vanhanh: VanHanh,
  baocao: BaoCao,
};

const TOAST_INTENT = { ok: 'success', warn: 'warning', err: 'error' };

/* Cầu nối: core/toast.js (JS thuần) → Fluent Toaster */
function ToastBridge({ toasterId }) {
  const { dispatchToast } = useToastController(toasterId);
  useEffect(() => {
    setToastHandler((type, msg) => {
      dispatchToast(
        <Toast><ToastTitle>{msg}</ToastTitle></Toast>,
        { intent: TOAST_INTENT[type] || 'info', timeout: 2500 },
      );
    });
    return () => setToastHandler(null);
  }, [dispatchToast]);
  return null;
}

/* Wizard stepper ngang trên toolbar — pattern trình cài đặt/phần mềm nghiệp vụ */
function Stepper({ doneMap }) {
  return (
    <div id="stepper">
      {NAV_WORKFLOW.map((item, idx) => {
        const isDone = doneMap[item.id];
        const isActive = state.screen === item.id;
        return (
          <span key={item.id} style={{ display: 'inline-flex', alignItems: 'center' }}>
            {idx > 0 && <span className="step-connector" />}
            <button
              className={`step${isActive ? ' active' : ''}${isDone ? ' done' : ''}`}
              onClick={() => setScreen(item.id)}
            >
              <span className="step-num">{isDone ? '✓' : item.step}</span>
              <span>{item.label}</span>
            </button>
          </span>
        );
      })}
    </div>
  );
}

function StatusBar({ doneSkus }) {
  const totalQty = SKUS.reduce((s, k) => s + k.qty, 0);
  const assigned = getAssignedCodes().length;
  return (
    <footer id="statusbar">
      <span className="sb-item">
        <span className="hw-dot" style={{ background: HW.ctrlOk ? 'var(--green)' : HW.bridgeOk ? '#c19c00' : 'var(--text-subtle)' }} />
        Đèn thật: {HW.ctrlOk ? 'đã kết nối' : HW.bridgeOk ? 'bridge OK' : 'chưa kết nối'}
      </span>
      <span className="sb-item">{state.scanMode ? '⌁ Máy quét thật' : '▷ Mô phỏng'}</span>
      <span className="sb-item">Phiên: {doneSkus}/{SKUS.length} thùng{state.simDone ? ' — hoàn thành' : state.simRunning ? ' — đang chạy' : ''}</span>
      <span className="sb-item">Nhân viên: {assigned}/{SLOT_COLORS.length}</span>
      <span className="sb-right">
        <span className="sb-item">{SKUS.length} SKU · {totalQty.toLocaleString()} sp</span>
        <span className="sb-item">Put to Light v1.0</span>
      </span>
    </footer>
  );
}

export default function App() {
  useSyncExternalStore(subscribe, getVersion);
  const toasterId = useId('scan-toaster');

  const Screen = SCREENS[state.screen] || (() => null);
  const isOps = state.screen === 'vanhanh';

  // Trạng thái hoàn thành THẬT của từng bước
  const doneMap = {
    tiepnhan: state.planLocked,
    kehoach: state.planLocked,
    dieuchinhh: state.planLocked,
    phancong: getAssignedCodes().length > 0,
    vanhanh: state.simDone,
    baocao: false,
  };
  const doneSkus = state.skuStatus.filter((s) => s === 'done').length;

  return (
    <FluentProvider theme={webLightTheme} style={{ height: '100vh', background: 'var(--bg)' }}>
      <Toaster toasterId={toasterId} position="top" />
      <ToastBridge toasterId={toasterId} />
      <div id="app">
        <div id="titlebar">
          <span className="app-icon">
            {SLOT_COLORS.map((sc) => <i key={sc.key} style={{ background: sc.hex }} />)}
          </span>
          <span className="app-title"><b>Put to Light</b> — Điều phối phân hàng có hướng dẫn đèn LED</span>
        </div>

        <Toolbar id="toolbar" size="small">
          <Stepper doneMap={doneMap} />
          <span className="spacer" />
          <ToolbarDivider />
          <Tooltip content="Sơ đồ kho — quản lý khu vực, test đèn" relationship="label">
            <ToolbarButton
              icon={<MapRegular />}
              appearance={state.screen === 'sodomkho' ? 'primary' : 'subtle'}
              onClick={() => setScreen(NAV_SYSTEM[0].id)}
            >
              Sơ đồ kho
            </ToolbarButton>
          </Tooltip>
        </Toolbar>

        <main id="main" className={isOps ? 'ops' : ''}>
          <Screen />
        </main>

        <StatusBar doneSkus={doneSkus} />
      </div>
    </FluentProvider>
  );
}
