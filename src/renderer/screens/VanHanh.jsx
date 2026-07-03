import { useState } from 'react';
import {
  Button, CompoundButton, Input, Switch, Field, ProgressBar,
  Dialog, DialogSurface, DialogBody, DialogTitle, DialogContent, DialogActions,
} from '@fluentui/react-components';
import {
  PlayRegular, PlugConnectedRegular, DocumentBulletListRegular, ArrowCounterclockwiseRegular,
} from '@fluentui/react-icons';
import {
  SLOT_COLORS, WORKERS_POOL, ZONES, STORES, SKUS,
  hex2rgba, getZoneStoreIndices,
} from '../core/data.js';
import { state, setScreen } from '../core/store.js';
import {
  getWorkerCurrentSkuIdx, getWorkersForSlot,
  opsAdvance, setScanMode, startNewSession, confirmBinClick,
} from '../core/session.js';
import { HW, hwToggleCfg, hwConnect } from '../core/hardware.js';

export default function VanHanh() {
  return (
    <div id="ops-outer">
      <OpsSidebar />
      <LedBoard />
    </div>
  );
}

/* ─── OPS SIDEBAR ─── */
function OpsSidebar() {
  const step = state.opsStep;

  const slotCheckinLabel = (colorKey) => {
    const sc = SLOT_COLORS.find((c) => c.key === colorKey);
    const ws = getWorkersForSlot(colorKey);
    const names = ws.length > 0 ? ws.map((w) => w.name.split(' ').pop()).join(', ') : '(chưa phân)';
    return `${names} — đèn ${sc.label} quét thẻ vào`;
  };

  const stepDefs = [
    'Chuẩn bị ca',
    slotCheckinLabel('yellow'),
    slotCheckinLabel('red'),
    slotCheckinLabel('green'),
    'Khởi động phiên',
    'Đang vận hành',
  ];

  // Danh sách nhân viên được phân công (theo zone × màu)
  const allWorkerCards = [];
  ZONES.forEach((z) => {
    SLOT_COLORS.forEach((sc, slot) => {
      const code = state.zoneAssignments[z.id] && state.zoneAssignments[z.id][sc.key];
      if (!code) return;
      const w = WORKERS_POOL.find((x) => x.code === code);
      if (w) allWorkerCards.push({ w, sc, slot, zoneId: z.id, zoneName: z.name, zoneColor: z.color });
    });
  });

  const doneSkus = state.skuStatus.filter((s) => s === 'done').length;

  return (
    <div id="ops-sidebar">
      <div className="ops-section-label">Trạng thái phiên</div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
          <span>Tiến độ phiên</span>
          <span>{doneSkus}/{SKUS.length} thùng</span>
        </div>
        <ProgressBar value={doneSkus / SKUS.length} thickness="large" color={doneSkus === SKUS.length ? 'success' : 'brand'} />
      </div>

      <div className="scan-mode-row">
        <span className="scan-mode-label">Nguồn sự kiện</span>
        <Switch
          checked={state.scanMode}
          onChange={(_, d) => setScanMode(d.checked)}
          label={state.scanMode ? '⌁ Máy quét thật' : '▷ Mô phỏng'}
        />
      </div>

      <div className="hw-status-row" onClick={hwToggleCfg} title="Bấm để nhập IP controller đèn">
        <span className="hw-dot" style={{ background: HW.ctrlOk ? 'var(--green)' : HW.bridgeOk ? 'var(--yellow)' : 'var(--text-subtle)' }} />
        Đèn thật: {HW.ctrlOk ? 'đã kết nối controller' : HW.bridgeOk ? 'bridge OK — bấm nhập IP đèn' : 'chưa chạy demo-bridge.exe'}
      </div>

      {HW.showCfg && <HwConfigForm />}

      <div className="step-track">
        {stepDefs.map((s, i) => (
          <div key={i} className={`step-row${i < step ? ' s-done' : ''}${i === step ? ' s-active' : ''}`}>
            <div className="step-dot" />
            <div className="step-text">{s}</div>
          </div>
        ))}
      </div>

      <div className="workers-label">Nhân viên</div>
      {allWorkerCards.length === 0 && (
        <div style={{ fontSize: 12, color: 'var(--text-subtle)', fontStyle: 'italic', padding: '6px 0' }}>
          Chưa phân công nhân viên
        </div>
      )}
      {allWorkerCards.map((card) => <WorkerCard key={`${card.zoneId}-${card.sc.key}`} {...card} />)}

      <OpsActions step={step} />
    </div>
  );
}

function HwConfigForm() {
  const [ip, setIp] = useState(HW.cfg.ip || '192.168.1.254');
  const [port, setPort] = useState(String(HW.cfg.port || 5003));
  const [key, setKey] = useState(HW.cfg.licenseKey || '');
  return (
    <Dialog open onOpenChange={(_, d) => { if (!d.open) hwToggleCfg(); }}>
      <DialogSurface style={{ maxWidth: 420 }}>
        <DialogBody>
          <DialogTitle>Kết nối controller đèn Lightstep</DialogTitle>
          <DialogContent>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8 }}>
              <Field label="IP controller">
                <Input placeholder="192.168.1.254" value={ip} onChange={(_, d) => setIp(d.value)} />
              </Field>
              <Field label="Port">
                <Input placeholder="5003" value={port} onChange={(_, d) => setPort(d.value)} />
              </Field>
              <Field label="License key" hint="Bỏ trống nếu không có">
                <Input value={key} onChange={(_, d) => setKey(d.value)} />
              </Field>
            </div>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={hwToggleCfg}>Đóng</Button>
            <Button appearance="primary" icon={<PlugConnectedRegular />} onClick={() => hwConnect({ ip: ip.trim(), port: parseInt(port, 10) || 5003, licenseKey: key.trim() })}>
              Kết nối đèn
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}

function WorkerCard({ w, sc, slot, zoneId, zoneName, zoneColor }) {
  const isActive = state.workerActive[slot];
  const isDone = state.workerDone[slot];
  const skuIdx = getWorkerCurrentSkuIdx(slot);
  const isIdle = isActive && !isDone && skuIdx === null;
  const isArmed = state.armedSlot === slot;
  const sku = (isActive && !isDone && skuIdx !== null) ? SKUS[skuIdx] : null;
  const roundsDone = state.workerRoundsDone[slot];
  const zoneIndices = getZoneStoreIndices(zoneId);
  const zoneSize = zoneIndices.length;
  const zoneDoneFlag = state.workerZoneDone[slot][zoneId];
  const localIdx = state.workerZoneIdx[slot][zoneId];
  const confirmedInZone = zoneIndices.filter((gi) => state.confirmed[slot][gi]).length;
  const progressPct = sku ? Math.round((confirmedInZone / zoneSize) * 100) : 0;

  let statusLine = 'Chưa vào ca';
  if (!isActive) statusLine = 'Chưa vào ca';
  else if (isDone) statusLine = '✓ Hoàn thành ca';
  else if (isIdle) {
    if (isArmed) statusLine = '⌁ Quét tem thùng SKU để nhận việc…';
    else if (state.scanMode) statusLine = '⌁ Rảnh — quét thẻ rồi quét thùng';
    else if (state.opsStep < 5) statusLine = 'Đã vào ca — chờ khởi động phiên';
    else statusLine = 'Chờ nhận SKU…';
  } else if (zoneDoneFlag) statusLine = `✓ ${zoneName} xong — chờ`;
  else if (sku) statusLine = `Bin ${localIdx + 1}/${zoneSize}`;

  const isWorking = !!sku;
  const isLit = isArmed || isWorking;
  const borderColor = (isActive && !isDone) ? (isLit ? sc.hex : hex2rgba(sc.hex, 0.4)) : 'var(--border)';
  const boxShadow = isLit ? `0 0 ${isArmed ? 14 : 8}px ${hex2rgba(sc.hex, isArmed ? 0.45 : 0.25)}` : undefined;

  return (
    <div className="worker-card" style={{ borderColor, boxShadow }}>
      <div className="worker-top">
        <div className="worker-color-dot" style={{ background: sc.hex, boxShadow: `0 0 5px ${sc.hex}99` }} />
        <div className="worker-name">{w.name.split(' ').slice(-1)[0]}</div>
        <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 3, background: `${sc.hex}22`, color: sc.hex, fontWeight: 700 }}>{sc.label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
        <span className="worker-code">{w.code}</span>
        <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 3, background: `${zoneColor}22`, color: zoneColor, fontWeight: 600 }}>📍 {zoneName}</span>
      </div>
      {sku && <div className="worker-sku" style={{ color: sc.hex }}>{sku.code}</div>}
      <div className="worker-status">{statusLine}</div>
      {isActive && !isDone && (
        <>
          <ProgressBar value={progressPct / 100} thickness="large" style={{ marginTop: 4 }} />
          <div className="worker-progress-sub">{sku ? `${confirmedInZone}/${zoneSize} bins · ` : ''}{roundsDone} thùng xong</div>
        </>
      )}
    </div>
  );
}

function OpsActions({ step }) {
  if (state.simDone) {
    return (
      <div className="ops-actions">
        <div className="sim-done-banner">✓ Phiên hoàn thành!</div>
        <Button appearance="primary" icon={<DocumentBulletListRegular />} onClick={() => setScreen('baocao')}>Xem Báo cáo</Button>
        <Button icon={<ArrowCounterclockwiseRegular />} onClick={startNewSession}>Phiên phân hàng tiếp theo</Button>
      </div>
    );
  }

  if (state.simRunning) {
    const anyIdle = [0, 1, 2].some((s) => state.workerActive[s] && !state.workerDone[s] && state.workerCurrentSku[s] === null);
    const armed = state.armedSlot !== null;
    return (
      <div className="ops-actions">
        <div className="sim-status"><div className="sim-dot" /><span>Đang vận hành…</span></div>
        {state.scanMode && armed && <div className="scan-wait-hint">⌁ Bước 2/2: quét tem thùng SKU để nhận việc</div>}
        {state.scanMode && !armed && anyIdle && <div className="scan-wait-hint">⌁ Bước 1/2: quét thẻ nhân viên đang rảnh</div>}
      </div>
    );
  }

  if (step <= 2) {
    if (state.scanMode) {
      return <div className="ops-actions"><div className="scan-wait-hint">⌁ Chờ quét thẻ nhân viên…</div></div>;
    }
    const nextSlot = state.workerActive.indexOf(false);
    const sc = SLOT_COLORS[nextSlot === -1 ? 0 : nextSlot];
    const ws = getWorkersForSlot(sc.key);
    const names = ws.length > 0 ? ws.map((w) => w.name.split(' ').pop()).join(' & ') : `(đèn ${sc.label} chưa phân)`;
    return (
      <div className="ops-actions">
        <CompoundButton appearance="primary" size="small" onClick={opsAdvance} secondaryContent={`Check-in đèn ${sc.label}`}>
          {names} quét thẻ
        </CompoundButton>
      </div>
    );
  }
  if (step === 3) {
    return (
      <div className="ops-actions">
        <CompoundButton appearance="primary" size="small" icon={<PlayRegular />} onClick={opsAdvance} secondaryContent="Tất cả nhân viên đã vào ca">
          Bắt đầu phiên làm việc
        </CompoundButton>
        {state.scanMode && <div className="scan-wait-hint">⌁ Hoặc quét tem thùng SKU — phiên tự khởi động</div>}
      </div>
    );
  }
  if (step === 4) {
    return (
      <div className="ops-actions">
        <CompoundButton
          appearance="primary"
          size="small"
          icon={<PlayRegular />}
          onClick={opsAdvance}
          secondaryContent={state.scanMode ? 'Quét thẻ rồi quét thùng để nhận việc' : 'Mô phỏng tự bốc thùng cho người rảnh'}
        >
          Bắt đầu phân hàng
        </CompoundButton>
        {state.scanMode && <div className="scan-wait-hint">⌁ Hoặc quét tem thùng SKU — phiên tự khởi động</div>}
      </div>
    );
  }
  return <div className="ops-actions" />;
}

/* ─── LED BOARD ─── */
function LedBoard() {
  const sessionStarted = state.opsStep >= 4;

  return (
    <div id="led-board">
      <div className="led-board-head">
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Bảng LED điều phối</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
            Thời gian thực — {STORES.length} bin · 3 màu LED{state.scanMode ? ' · bấm đèn để xác nhận đã bỏ hàng' : ''}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {SLOT_COLORS.map((sc) => (
            <span key={sc.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, color: sc.hex }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: sc.hex, boxShadow: `0 0 5px ${sc.hex}`, display: 'inline-block' }} />
              {sc.label}
            </span>
          ))}
        </div>
      </div>

      {ZONES.map((zone) => {
        const zoneStores = STORES.map((s, i) => ({ ...s, storeIdx: i })).filter((s) => s.zone === zone.id);
        return (
          <div key={zone.id} className="zone-section">
            <div className="zone-label">
              <div className="zone-dot" style={{ background: zone.color, boxShadow: `0 0 5px ${zone.color}88` }} />
              <span style={{ color: zone.color }}>{zone.name}</span>
            </div>
            <div className="zone-bins">
              {zoneStores.map((store) => (
                <BinCard key={store.id} store={store} zone={zone} sessionStarted={sessionStarted} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BinCard({ store, zone, sessionStarted }) {
  const si = store.storeIdx;
  const storeZoneId = store.zone;
  const zoneStoreIndices = getZoneStoreIndices(storeZoneId);

  const slots = SLOT_COLORS.map((sc, slot) => {
    if (!state.workerActive[slot]) return { sc, slot, state: 'inactive' };
    if (state.workerDone[slot]) return { sc, slot, state: 'inactive' };
    if (!sessionStarted) return { sc, slot, state: 'inactive' };

    const code = state.zoneAssignments[storeZoneId] && state.zoneAssignments[storeZoneId][sc.key];
    if (!code) return { sc, slot, state: 'inactive' };

    const skuIdx = getWorkerCurrentSkuIdx(slot);
    if (skuIdx === null) return { sc, slot, state: 'inactive' };

    const qty = state.editPlan[skuIdx][si];
    const isConfirmed = state.confirmed[slot][si];
    const zoneDone = state.workerZoneDone[slot][storeZoneId];
    const localIdx = state.workerZoneIdx[slot][storeZoneId];
    const isCurrentBin = !zoneDone && zoneStoreIndices[localIdx] === si && !isConfirmed && state.simRunning;

    return { sc, slot, skuIdx, qty, isConfirmed, isCurrentBin, state: 'lit' };
  });

  const confirmingSlot = slots.find((s) => s.state === 'lit' && s.isCurrentBin);
  const cardStyle = confirmingSlot ? {
    borderColor: confirmingSlot.sc.hex,
    boxShadow: `0 0 14px ${hex2rgba(confirmingSlot.sc.hex, 0.35)}, 0 0 30px ${hex2rgba(confirmingSlot.sc.hex, 0.12)}`,
  } : undefined;

  return (
    <div className="bin-card" style={cardStyle}>
      <div className="bin-header">
        <div>
          <div className="bin-name">{store.id}</div>
          <div className="bin-subname">{store.id}</div>
        </div>
        <div className="bin-addr" style={{ color: zone.color }}>{store.addr}</div>
      </div>
      {confirmingSlot && (
        <div className="bin-badge" style={{
          background: hex2rgba(confirmingSlot.sc.hex, 0.2),
          color: confirmingSlot.sc.hex,
          border: `1px solid ${hex2rgba(confirmingSlot.sc.hex, 0.5)}`,
        }}>ĐANG PHÂN</div>
      )}
      <div className="led-slots">
        {slots.map((slotData) => {
          const { sc, slot, state: slotState, skuIdx, qty, isConfirmed, isCurrentBin } = slotData;
          if (slotState === 'inactive') {
            return (
              <div key={sc.key} className="led-row unlit">
                <div className="led-dot" style={{ background: sc.hex, opacity: 0.3 }} />
                <div className="led-sku" style={{ fontSize: 10 }}>—</div>
              </div>
            );
          }
          const sku = SKUS[skuIdx];
          const rowCls = isConfirmed ? 'led-row lit confirmed' : isCurrentBin ? 'led-row lit led-active' : 'led-row lit';
          const clickable = state.scanMode && isCurrentBin && !isConfirmed;
          return (
            <div
              key={sc.key}
              className={rowCls}
              onClick={clickable ? () => confirmBinClick(slot, si) : undefined}
              title={clickable ? 'Bấm xác nhận đã bỏ hàng vào ngăn' : undefined}
              style={{
                cursor: clickable ? 'pointer' : undefined,
                '--led-color': sc.hex,
                '--led-glow': hex2rgba(sc.hex, 0.35),
                '--led-bg': hex2rgba(sc.hex, 0.07),
                '--led-border': hex2rgba(sc.hex, 0.25),
                '--led-active-bg': hex2rgba(sc.hex, 0.15),
                ...(isCurrentBin ? { borderColor: hex2rgba(sc.hex, 0.5) } : {}),
              }}
            >
              <div className="led-dot" style={{ background: sc.hex }} />
              <div className="led-sku">{sku.code}</div>
              <div className="led-qty">{qty}</div>
              <div className="led-unit">sp</div>
              <div className="led-check">✓</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
