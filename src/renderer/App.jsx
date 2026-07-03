import { useEffect, useSyncExternalStore } from 'react';
import {
  FluentProvider, webDarkTheme, TabList, Tab, Badge,
  Toaster, Toast, ToastTitle, useToastController, useId,
  Breadcrumb, BreadcrumbItem, BreadcrumbButton, BreadcrumbDivider,
} from '@fluentui/react-components';
import { MapRegular } from '@fluentui/react-icons';
import { state, subscribe, getVersion, setScreen, NAV_WORKFLOW, NAV_SYSTEM } from './core/store.js';
import { getAssignedCodes } from './core/session.js';
import { setToastHandler } from './core/toast.js';
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
        <Toast>
          <ToastTitle>{msg}</ToastTitle>
        </Toast>,
        { intent: TOAST_INTENT[type] || 'info', timeout: 2500 },
      );
    });
    return () => setToastHandler(null);
  }, [dispatchToast]);
  return null;
}

function StepBadge({ step, isDone, isActive }) {
  return (
    <Badge
      shape="circular"
      size="medium"
      appearance={isDone || isActive ? 'filled' : 'tint'}
      color={isDone ? 'success' : isActive ? 'brand' : 'informative'}
    >
      {isDone ? '✓' : step}
    </Badge>
  );
}

export default function App() {
  useSyncExternalStore(subscribe, getVersion);
  const toasterId = useId('scan-toaster');

  const Screen = SCREENS[state.screen] || (() => null);
  const isOps = state.screen === 'vanhanh';

  // Trạng thái hoàn thành THẬT của từng bước (không theo vị trí đang đứng)
  const doneMap = {
    tiepnhan: state.planLocked,
    kehoach: state.planLocked,
    dieuchinhh: state.planLocked,
    phancong: getAssignedCodes().length > 0,
    vanhanh: state.simDone,
    baocao: false,
  };
  const doneCount = NAV_WORKFLOW.filter((i) => doneMap[i.id]).length;

  return (
    <FluentProvider theme={webDarkTheme} style={{ height: '100vh', background: 'transparent' }}>
      <Toaster toasterId={toasterId} position="top" />
      <ToastBridge toasterId={toasterId} />
      <div id="app">
        <nav id="sidenav">
          <div id="app-identity">
            <div className="logo">Put·<span>to</span>·Light</div>
          </div>

          <div className="nav-label">
            Quy trình làm việc
            <span className="nav-progress">{doneCount}/{NAV_WORKFLOW.length - 1} bước xong</span>
          </div>
          <TabList vertical selectedValue={state.screen} onTabSelect={(_, d) => setScreen(d.value)}>
            {NAV_WORKFLOW.map((item) => (
              <Tab
                key={item.id}
                value={item.id}
                icon={
                  <StepBadge
                    step={item.step}
                    isDone={doneMap[item.id]}
                    isActive={state.screen === item.id && !doneMap[item.id]}
                  />
                }
              >
                {item.label}
              </Tab>
            ))}
          </TabList>

          <div className="nav-label" style={{ marginTop: 10 }}>Hệ thống</div>
          <TabList vertical selectedValue={state.screen} onTabSelect={(_, d) => setScreen(d.value)}>
            {NAV_SYSTEM.map((item) => (
              <Tab key={item.id} value={item.id} icon={<MapRegular />}>{item.label}</Tab>
            ))}
          </TabList>

          <div className="side-footer">Phân hàng có hướng dẫn đèn LED · v1.0</div>
        </nav>

        <div id="titlebar">
          <Breadcrumb size="small">
            <BreadcrumbItem>
              <BreadcrumbButton>
                {NAV_WORKFLOW.some((i) => i.id === state.screen) ? 'Quy trình làm việc' : 'Hệ thống'}
              </BreadcrumbButton>
            </BreadcrumbItem>
            <BreadcrumbDivider />
            <BreadcrumbItem>
              <BreadcrumbButton current>
                {[...NAV_WORKFLOW, ...NAV_SYSTEM].find((i) => i.id === state.screen)?.label || ''}
              </BreadcrumbButton>
            </BreadcrumbItem>
          </Breadcrumb>
        </div>

        <main id="main" className={isOps ? 'ops' : ''}>
          <Screen />
        </main>
      </div>
    </FluentProvider>
  );
}
