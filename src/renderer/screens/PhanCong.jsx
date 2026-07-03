import {
  Button, Avatar, Persona, Dropdown, Option, CounterBadge,
  AvatarGroup, AvatarGroupItem, AvatarGroupPopover, partitionAvatarGroupItems,
} from '@fluentui/react-components';
import { PlayRegular } from '@fluentui/react-icons';
import { SLOT_COLORS, WORKERS_POOL, ZONES } from '../core/data.js';
import { state, setScreen } from '../core/store.js';
import {
  getPoolWorkers, getAssignedCodes, setSlotWorker, removeWorkerFromSlot,
} from '../core/session.js';
import { PageHeader } from '../shared.jsx';

/* Ô ma trận: đã gán → chip Persona + nút gỡ; chưa gán → dropdown chọn từ pool */
function MatrixCell({ zone, color, pool }) {
  const za = state.zoneAssignments[zone.id] || {};
  const code = za[color.key];
  const w = code ? WORKERS_POOL.find((x) => x.code === code) : null;

  if (w) {
    return (
      <div className="mx-chip">
        <div style={{ flex: 1, minWidth: 0 }}>
          <Persona name={w.name} secondaryText={w.code} avatar={{ color: 'colorful' }} size="small" />
        </div>
        <button className="wremove" onClick={() => removeWorkerFromSlot(zone.id, color.key)} title="Gỡ khỏi slot">×</button>
      </div>
    );
  }

  return (
    <Dropdown
      className="mx-dropdown"
      size="small"
      placeholder={pool.length ? 'Chọn nhân viên…' : 'Hết nhân viên'}
      disabled={pool.length === 0}
      selectedOptions={[]}
      value=""
      onOptionSelect={(_, d) => { if (d.optionValue) setSlotWorker(zone.id, color.key, d.optionValue); }}
    >
      {pool.map((p) => (
        <Option key={p.code} value={p.code} text={`${p.name} — ${p.code}`}>
          <Persona name={p.name} secondaryText={p.code} avatar={{ color: 'colorful' }} size="extra-small" />
        </Option>
      ))}
    </Dropdown>
  );
}

export default function PhanCong() {
  const allZones = [...ZONES, ...state.extraZones];
  const pool = getPoolWorkers();
  const totalAssigned = getAssignedCodes().length;
  const totalSlots = allZones.length * SLOT_COLORS.length;
  const canStart = totalAssigned > 0;

  const { inlineItems, overflowItems } = partitionAvatarGroupItems({
    items: pool.map((w) => w.name),
    maxInlineItems: 6,
  });

  return (
    <>
      <PageHeader
        title="Phân công khu vực"
        subtitle={`Bảng phân ca: mỗi khu vực × 3 màu đèn — chọn nhân viên ngay trong ô · ${totalAssigned}/${totalSlots} slot đã gán`}
      />

      <div className="matrix-wrap">
        <table className="matrix">
          <thead>
            <tr>
              <th className="mx-zone-col">Khu vực</th>
              {SLOT_COLORS.map((sc) => (
                <th key={sc.key}>
                  <span className="mx-col-head">
                    <span className="mx-col-dot" style={{ background: sc.hex, boxShadow: `0 0 6px ${sc.hex}66` }} />
                    Đèn {sc.label}
                    <span className="mx-col-sub">module {sc.lightAddr}</span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allZones.map((z) => {
              const za = state.zoneAssignments[z.id] || {};
              const filled = SLOT_COLORS.filter((c) => za[c.key]).length;
              const binCount = (z.floors || 1) * (z.racksPerFloor || 1) * (z.binsPerRack || 0);
              return (
                <tr key={z.id}>
                  <td className="mx-zone-cell">
                    <div className="zone-color-bar" style={{ background: z.color }} />
                    <div>
                      <div className="mx-zone-name">{z.name}</div>
                      <div className="mx-zone-sub">{binCount} ngăn · {filled}/{SLOT_COLORS.length} đã gán</div>
                    </div>
                  </td>
                  {SLOT_COLORS.map((sc) => (
                    <td key={sc.key}>
                      <MatrixCell zone={z} color={sc} pool={pool} />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="matrix-footer">
        <span className="mx-pool-label">
          Chưa phân công
          <CounterBadge count={pool.length} color={pool.length ? 'informative' : 'success'} size="small" />
        </span>
        {pool.length > 0 && (
          <AvatarGroup layout="stack" size={28}>
            {inlineItems.map((name) => (
              <AvatarGroupItem key={name} name={name} color="colorful" />
            ))}
            {overflowItems && (
              <AvatarGroupPopover>
                {overflowItems.map((name) => (
                  <AvatarGroupItem key={name} name={name} color="colorful" />
                ))}
              </AvatarGroupPopover>
            )}
          </AvatarGroup>
        )}
        <span className="spacer" />
        <span className="mx-hint">
          {canStart ? `${totalAssigned} nhân viên sẵn sàng` : 'Phân công ít nhất 1 nhân viên để tiếp tục'}
        </span>
        <Button appearance="primary" icon={<PlayRegular />} disabled={!canStart} onClick={() => setScreen('vanhanh')}>
          Bắt đầu Vận hành
        </Button>
      </div>
    </>
  );
}
