import { useState } from 'react';
import {
  Button, Badge, Input, Field,
  Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell,
  OverlayDrawer, DrawerHeader, DrawerHeaderTitle, DrawerBody,
} from '@fluentui/react-components';
import { AddRegular, DismissRegular, LightbulbRegular } from '@fluentui/react-icons';
import {
  SLOT_COLORS, ZONES, STORES, STORES_ALL, LED_TEST_COLORS,
} from '../core/data.js';
import { state } from '../core/store.js';
import {
  getWorkersForSlot, toggleAddZone, addZone, removeExtraZone,
  testBin, toggleTestZonePanel, testZone, clearZone,
} from '../core/session.js';
import { PageHeader, StatCard } from '../shared.jsx';

export default function SoDoKho() {
  const allZones = [...ZONES, ...state.extraZones];
  const totalBins = STORES.length + state.extraZones.reduce((a, z) => a + z.floors * z.racksPerFloor * z.binsPerRack, 0);

  return (
    <>
      <PageHeader title="Sơ đồ kho" subtitle={`Bố cục vật lý — ${allZones.length} khu vực · ${totalBins} bin`} />

      <div className="card">
        <div className="card-title">Tổng quan hệ thống</div>
        <div className="stats-row">
          <StatCard label="Khu vực" value={allZones.length} sub={allZones.map((z) => z.id).join(' · ')} />
          <StatCard label="Tổng Bin" value={totalBins} sub="LED module" />
          <StatCard label="Màu LED / Bin" value={3} sub="Vàng · Đỏ · Xanh" />
          <StatCard label="Nhân viên" value={3} sub="mỗi ca" />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>Bố cục khu vực</div>
        <Button icon={<AddRegular />} onClick={toggleAddZone}>Thêm khu vực</Button>
      </div>

      <AddZoneDrawer zoneCount={allZones.length} />


      <div className="warehouse-map">
        {ZONES.map((zone) => <ZoneRow key={zone.id} zone={zone} />)}
        {state.extraZones.map((zone, zi) => <ExtraZoneRow key={zone.id + zi} zone={zone} zi={zi} />)}
      </div>

      <div className="card">
        <div className="card-title">Slot màu LED — mỗi khu vực</div>
        <Table size="small">
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Slot</TableHeaderCell>
              <TableHeaderCell>Màu LED</TableHeaderCell>
              <TableHeaderCell>Nhân viên được gán (tất cả khu vực)</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {SLOT_COLORS.map((sc, slot) => {
              const ws = getWorkersForSlot(sc.key);
              return (
                <TableRow key={sc.key}>
                  <TableCell><Badge appearance="tint" color="informative">Slot {slot}</Badge></TableCell>
                  <TableCell>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 12, height: 12, borderRadius: '50%', background: sc.hex, boxShadow: `0 0 8px ${sc.hex}`, display: 'inline-block', flexShrink: 0 }} />
                      <span style={{ color: sc.hex, fontWeight: 600 }}>{sc.label}</span>
                    </span>
                  </TableCell>
                  <TableCell style={{ fontSize: 12 }}>
                    {ws.length > 0
                      ? ws.map((w) => `${w.name} (${w.zoneId})`).join(' · ')
                      : <span style={{ color: 'var(--text-subtle)', fontStyle: 'italic' }}>Chưa phân công</span>}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

function AddZoneDrawer({ zoneCount }) {
  const [id, setId] = useState(String.fromCharCode(65 + zoneCount));
  const [name, setName] = useState('');
  const [floors, setFloors] = useState('1');
  const [racks, setRacks] = useState('1');
  const [bins, setBins] = useState('3');
  const f = Math.max(1, parseInt(floors) || 1);
  const k = Math.max(1, parseInt(racks) || 1);
  const n = Math.max(1, parseInt(bins) || 1);

  return (
    <OverlayDrawer
      open={state.showAddZone}
      position="end"
      onOpenChange={(_, d) => { if (!d.open) toggleAddZone(); }}
    >
      <DrawerHeader>
        <DrawerHeaderTitle
          action={<Button appearance="subtle" icon={<DismissRegular />} onClick={toggleAddZone} />}
        >
          Thêm khu vực mới
        </DrawerHeaderTitle>
      </DrawerHeader>
      <DrawerBody>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 8 }}>
          <Field label="Mã khu vực">
            <Input value={id} maxLength={3} onChange={(_, d) => setId(d.value)} />
          </Field>
          <Field label="Tên khu vực">
            <Input placeholder="VD: Khu vực D" value={name} onChange={(_, d) => setName(d.value)} />
          </Field>
          <div style={{ display: 'flex', gap: 10 }}>
            <Field label="Số tầng" style={{ flex: 1, minWidth: 0 }}>
              <Input type="number" value={floors} onChange={(_, d) => setFloors(d.value)} style={{ minWidth: 0 }} />
            </Field>
            <Field label="Kệ / tầng" style={{ flex: 1, minWidth: 0 }}>
              <Input type="number" value={racks} onChange={(_, d) => setRacks(d.value)} style={{ minWidth: 0 }} />
            </Field>
            <Field label="Ngăn / kệ" style={{ flex: 1, minWidth: 0 }}>
              <Input type="number" value={bins} onChange={(_, d) => setBins(d.value)} style={{ minWidth: 0 }} />
            </Field>
          </div>
          <div style={{
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
            padding: '10px 14px', background: 'rgba(71,158,245,.08)',
            border: '1px solid rgba(71,158,245,.25)', borderRadius: 6,
          }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Tổng ngăn</span>
            <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent)' }}>{f * k * n}</span>
          </div>
          <Button
            appearance="primary"
            icon={<AddRegular />}
            disabled={!id.trim() || !name.trim()}
            onClick={() => addZone({ id: id.trim().toUpperCase(), name: name.trim(), floors: f, racks: k, bins: n })}
          >
            Thêm khu vực
          </Button>
        </div>
      </DrawerBody>
    </OverlayDrawer>
  );
}

function TestDots({ addr }) {
  const binTest = state.testBins[addr] || {};
  return (
    <div style={{ marginTop: 6, display: 'flex', gap: 4 }}>
      {LED_TEST_COLORS.map((c) => (
        <div
          key={c.key}
          className="test-dot"
          title={c.label}
          onClick={() => testBin(addr, c.key)}
          style={{
            background: binTest[c.key] ? c.hex : `${c.hex}33`,
            boxShadow: binTest[c.key] ? `0 0 7px ${c.hex}` : 'none',
          }}
        />
      ))}
    </div>
  );
}

function ZoneRow({ zone }) {
  const assignedStores = STORES_ALL.filter((s) => s.zone === zone.id);
  const sessionStores = STORES.filter((s) => s.zone === zone.id);
  const totalBinsZone = zone.floors * zone.racksPerFloor * zone.binsPerRack;
  const testing = state.testZoneId === zone.id;

  return (
    <div className="zone-row">
      <div className="zone-header">
        <div style={{ width: 14, height: 14, borderRadius: '50%', background: zone.color, boxShadow: `0 0 8px ${zone.color}88` }} />
        <span style={{ fontWeight: 700, fontSize: 14, color: zone.color }}>{zone.name}</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 10 }}>
          {zone.floors} tầng · {zone.racksPerFloor} kệ/tầng · {zone.binsPerRack} ngăn/kệ
        </span>
        <span style={{ marginLeft: 'auto' }}>
          <Badge appearance="tint" color="informative">
            {totalBinsZone} ngăn{sessionStores.length ? ` · ${sessionStores.length} trong phiên` : ''}
          </Badge>
        </span>
        <Button size="small" icon={<LightbulbRegular />} appearance={testing ? 'primary' : 'secondary'} onClick={() => toggleTestZonePanel(zone.id)}>
          Test đèn
        </Button>
      </div>

      {testing && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
          background: 'rgba(255,255,255,.03)', borderRadius: 8, marginBottom: 8,
        }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Test cả khu vực:</span>
          {LED_TEST_COLORS.map((c) => (
            <button
              key={c.key}
              onClick={() => testZone(zone.id, c.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(0,0,0,.3)', border: `1px solid ${c.hex}66`, borderRadius: 6,
                padding: '4px 12px', cursor: 'pointer', color: c.hex, fontSize: 12, fontWeight: 600,
              }}
            >
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: c.hex, boxShadow: `0 0 6px ${c.hex}`, display: 'inline-block' }} />
              {c.label}
            </button>
          ))}
          <button
            onClick={() => clearZone(zone.id)}
            style={{
              background: 'rgba(0,0,0,.3)', border: '1px solid var(--border)', borderRadius: 6,
              padding: '4px 12px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12,
            }}
          >Tắt tất cả</button>
        </div>
      )}

      <div className="zone-bins-it">
        {Array.from({ length: zone.binsPerRack }, (_, i) => {
          const nn = i + 1;
          const addr = `${zone.id}-${String(nn).padStart(2, '0')}`;
          const physStore = assignedStores.find((s) => s.addr === addr);
          const inSession = sessionStores.some((s) => s.addr === addr);
          const binTest = state.testBins[addr] || {};
          const anyLit = Object.keys(binTest).length > 0;
          const glow = anyLit
            ? { boxShadow: LED_TEST_COLORS.filter((c) => binTest[c.key]).map((c) => `0 0 10px ${c.hex}88`).join(','), background: 'rgba(255,255,255,.03)' }
            : {};

          if (physStore) {
            return (
              <div key={addr} className="bin-it" style={{ ...glow, ...(inSession ? { borderColor: `${zone.color}55` } : {}) }}>
                <div className="bin-it-code" style={{ color: inSession ? zone.color : 'var(--text-muted)' }}>{physStore.id}</div>
                <div className="bin-it-addr" style={{ color: zone.color }}>{addr}</div>
                <div className="bin-it-store">
                  {physStore.id}
                  {inSession && <span style={{ color: zone.color, fontSize: 10, marginLeft: 2 }}>●</span>}
                </div>
                <TestDots addr={addr} />
              </div>
            );
          }
          return (
            <div key={addr} className="bin-it" style={{ opacity: 0.22, ...glow }}>
              <div className="bin-it-addr" style={{ color: zone.color, fontSize: 10 }}>{addr}</div>
              <div className="bin-it-store" style={{ color: 'var(--text-subtle)' }}>—</div>
              <TestDots addr={addr} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ExtraZoneRow({ zone, zi }) {
  const totalBins = zone.floors * zone.racksPerFloor * zone.binsPerRack;
  return (
    <div className="zone-row">
      <div className="zone-header">
        <div style={{ width: 14, height: 14, borderRadius: '50%', background: zone.color, boxShadow: `0 0 8px ${zone.color}88` }} />
        <span style={{ fontWeight: 700, fontSize: 14, color: zone.color }}>{zone.name}</span>
        <Badge appearance="tint" color="brand">Mới</Badge>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 10 }}>
          {zone.floors} tầng · {zone.racksPerFloor} kệ/tầng · {zone.binsPerRack} ngăn/kệ
        </span>
        <span style={{ marginLeft: 'auto' }}><Badge appearance="tint" color="informative">{totalBins} ngăn</Badge></span>
        <button
          onClick={() => removeExtraZone(zi)}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14, padding: '0 4px' }}
        >✕</button>
      </div>

      {Array.from({ length: zone.floors }, (_, fi) => (
        <div key={fi}>
          <div style={{
            margin: '8px 0 4px 0', padding: '4px 10px',
            background: 'rgba(255,255,255,.03)',
            borderLeft: `3px solid ${zone.color}44`, borderRadius: '0 4px 4px 0',
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: `${zone.color}99` }}>Tầng {fi + 1}</span>
          </div>
          {Array.from({ length: zone.racksPerFloor }, (_, ki) => (
            <div key={ki} style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0 4px 16px' }}>
              <span style={{ fontSize: 10, color: 'var(--text-subtle)', whiteSpace: 'nowrap', minWidth: 36 }}>Kệ {ki + 1}</span>
              <div className="zone-bins-it" style={{ margin: 0, gap: 6 }}>
                {Array.from({ length: zone.binsPerRack }, (_, ni) => {
                  const addr = `${zone.id}-T${fi + 1}K${ki + 1}N${ni + 1}`;
                  return (
                    <div key={addr} className="bin-it" style={{ opacity: 0.75, minWidth: 80 }}>
                      <div className="bin-it-addr" style={{ color: zone.color, fontSize: 10 }}>{addr}</div>
                      <div className="bin-it-store" style={{ color: 'var(--text-subtle)', fontSize: 10 }}>Ngăn {ni + 1}</div>
                      <div style={{ marginTop: 5, display: 'flex', gap: 3 }}>
                        {LED_TEST_COLORS.map((c) => (
                          <div key={c.key} style={{ width: 8, height: 8, borderRadius: '50%', background: `${c.hex}44` }} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
