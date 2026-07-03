import { useState } from 'react';
import {
  SearchBox, Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell,
} from '@fluentui/react-components';
import { SKUS, STORES, PLAN, getPlanTotal } from '../core/data.js';
import { PageHeader, StatCard } from '../shared.jsx';

export default function KeHoach() {
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();
  const totalPlan = PLAN.reduce((a, row) => a + row.reduce((x, y) => x + y, 0), 0);
  const rows = SKUS
    .map((sku, si) => ({ sku, si }))
    .filter(({ sku }) => !query || `${sku.code} ${sku.name}`.toLowerCase().includes(query));

  return (
    <>
      <PageHeader title="Kế hoạch phân phối" subtitle="Số lượng phân bổ theo SKU và cửa hàng" />
      <div className="stats-row">
        <StatCard label="Tổng SKU" value={SKUS.length} sub="mã hàng" />
        <StatCard label="Tổng cửa hàng" value={STORES.length} sub="ngăn phân hàng" />
        <StatCard label="Tổng sản phẩm" value={totalPlan.toLocaleString()} sub="theo kế hoạch" />
      </div>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div className="card-title" style={{ margin: 0 }}>Bảng phân phối (kế hoạch)</div>
          <SearchBox
            placeholder="Tìm mã SKU hoặc tên hàng..."
            value={q}
            onChange={(_, d) => setQ(d.value)}
            style={{ width: 260 }}
          />
        </div>
        <div className="tbl-wrap">
          <Table size="small">
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Mã SKU</TableHeaderCell>
                <TableHeaderCell>Tên hàng</TableHeaderCell>
                {STORES.map((s) => (
                  <TableHeaderCell key={s.id} style={{ textAlign: 'center' }}>
                    {s.id}<br /><span style={{ fontSize: 10, opacity: 0.6 }}>{s.addr}</span>
                  </TableHeaderCell>
                ))}
                <TableHeaderCell style={{ textAlign: 'right' }}>Tổng KH</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ sku, si }) => (
                <TableRow key={sku.id}>
                  <TableCell><span className="mono" style={{ color: 'var(--accent)' }}>{sku.code}</span></TableCell>
                  <TableCell style={{ fontSize: 12 }}>{sku.name}</TableCell>
                  {PLAN[si].map((qty, ci) => (
                    <TableCell key={ci} style={{ textAlign: 'center', fontWeight: 600 }}>{qty}</TableCell>
                  ))}
                  <TableCell style={{ textAlign: 'right', fontWeight: 700 }}>{getPlanTotal(si)}</TableCell>
                </TableRow>
              ))}
              <TableRow style={{ borderTop: '2px solid var(--border)', background: 'var(--surface2)' }}>
                <TableCell colSpan={2} style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Tổng cộng</TableCell>
                {STORES.map((_, ci) => {
                  const colTotal = SKUS.reduce((a, _s, si) => a + PLAN[si][ci], 0);
                  return <TableCell key={ci} style={{ textAlign: 'center', fontWeight: 700 }}>{colTotal}</TableCell>;
                })}
                <TableCell style={{ textAlign: 'right', fontWeight: 700 }}>{totalPlan.toLocaleString()}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
