import {
  Button, Avatar, Persona, CounterBadge, InteractionTag, InteractionTagPrimary,
} from '@fluentui/react-components';
import { PlayRegular, DismissRegular } from '@fluentui/react-icons';
import { SLOT_COLORS, WORKERS_POOL, ZONES } from '../core/data.js';
import { state, setScreen } from '../core/store.js';
import {
  getPoolWorkers, getAssignedCodes,
  startPickSlot, assignWorkerToSlot, removeWorkerFromSlot, cancelPickSlot,
} from '../core/session.js';
import { PageHeader } from '../shared.jsx';

export default function PhanCong() {
  const pool = getPoolWorkers();
  const totalAssigned = getAssignedCodes().length;
  const canStart = totalAssigned > 0;
  const sel = state.selectingSlot;
  const selColor = sel ? SLOT_COLORS.find((c) => c.key === sel.colorKey) : null;

  return (
    <>
      <PageHeader
        title="Phân công khu vực"
        subtitle={`Gán nhân viên vào từng slot màu đèn — 3 màu cố định mỗi khu vực · ${totalAssigned}/9 đã phân công`}
      />

      {sel && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
          borderRadius: 8, background: 'rgba(71,158,245,.08)',
          border: '1px solid rgba(71,158,245,.3)', fontSize: 12,
        }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: selColor.hex, boxShadow: `0 0 8px ${selColor.hex}`, flexShrink: 0 }} />
          <span>
            Chọn nhân viên bên dưới để gán vào đèn <strong style={{ color: selColor.hex }}>{selColor.label}</strong>
            {' '}— Khu vực <strong style={{ color: 'var(--accent)' }}>{sel.zoneId}</strong>
          </span>
          <Button size="small" appearance="subtle" icon={<DismissRegular />} onClick={cancelPickSlot} style={{ marginLeft: 'auto' }}>Huỷ</Button>
        </div>
      )}

      <div className="zone-assign-grid">
        {ZONES.map((z) => {
          const za = state.zoneAssignments[z.id] || {};
          const filledCount = SLOT_COLORS.filter((c) => za[c.key]).length;
          const binCount = (z.floors || 1) * (z.racksPerFloor || 1) * (z.binsPerRack || 0);
          const isSelZone = sel && sel.zoneId === z.id;

          return (
            <div key={z.id} className={`zone-assign-card${isSelZone ? ' selecting' : ''}`}>
              <div className="zone-assign-header">
                <div className="zone-color-bar" style={{ background: z.color }} />
                <div>
                  <div className="zone-assign-title">{z.name}</div>
                  <div className="zone-assign-sub">{binCount} ngăn · {filledCount}/3 slot đã gán</div>
                </div>
              </div>
              <div className="worker-slots">
                {SLOT_COLORS.map((sc) => {
                  const code = za[sc.key];
                  const w = code ? WORKERS_POOL.find((x) => x.code === code) : null;
                  const isSelSlot = sel && sel.zoneId === z.id && sel.colorKey === sc.key;

                  if (w) {
                    return (
                      <div key={sc.key} className="worker-slot-filled" style={isSelSlot ? { borderColor: sc.hex } : undefined}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Persona
                            name={w.name}
                            secondaryText={w.code}
                            avatar={{ color: 'colorful' }}
                            size="small"
                          />
                        </div>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 3,
                          background: `${sc.hex}22`, color: sc.hex, whiteSpace: 'nowrap',
                        }}>{sc.label}</span>
                        <button className="wremove" onClick={() => removeWorkerFromSlot(z.id, sc.key)} title="Gỡ">×</button>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={sc.key}
                      className={`worker-slot-empty${isSelSlot ? ' selecting-target' : ''}`}
                      onClick={() => startPickSlot(z.id, sc.key)}
                      style={isSelSlot ? { borderColor: sc.hex, color: sc.hex, background: `${sc.hex}11` } : undefined}
                    >
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: sc.hex, opacity: isSelSlot ? 1 : 0.4, flexShrink: 0, display: 'inline-block' }} />
                      <span>{sc.label} — Chưa gán</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pool-section">
        <div className="pool-title">
          Nhân viên chưa phân công
          <CounterBadge count={pool.length} color="informative" size="small" style={{ marginLeft: 6 }} />
        </div>
        <div className="pool-chips">
          {pool.length === 0 ? (
            <span className="pool-chip-empty">Tất cả nhân viên đã được phân công</span>
          ) : (
            pool.map((w) => (
              <InteractionTag
                key={w.code}
                shape="circular"
                appearance={sel ? 'brand' : 'outline'}
                className={sel ? 'selecting-target' : undefined}
              >
                <InteractionTagPrimary
                  media={<Avatar name={w.name} color="colorful" />}
                  secondaryText={w.code}
                  onClick={() => assignWorkerToSlot(w.code)}
                >
                  {w.name}
                </InteractionTagPrimary>
              </InteractionTag>
            ))
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {canStart ? `${totalAssigned} nhân viên sẵn sàng` : 'Phân công ít nhất 1 nhân viên để tiếp tục'}
        </span>
        <Button appearance="primary" icon={<PlayRegular />} disabled={!canStart} onClick={() => setScreen('vanhanh')}>
          Bắt đầu Vận hành
        </Button>
      </div>
    </>
  );
}
