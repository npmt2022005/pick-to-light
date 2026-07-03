import { useState } from 'react';
import {
  SearchBox,
  DataGrid, DataGridHeader, DataGridRow, DataGridHeaderCell, DataGridBody, DataGridCell,
  createTableColumn,
} from '@fluentui/react-components';
import { SKUS } from '../core/data.js';
import { PageHeader, StatCard } from '../shared.jsx';

const columns = [
  createTableColumn({
    columnId: 'stt',
    renderHeaderCell: () => 'STT',
    renderCell: (r) => <span className="stt">{r.i + 1}</span>,
  }),
  createTableColumn({
    columnId: 'code',
    compare: (a, b) => a.sku.code.localeCompare(b.sku.code),
    renderHeaderCell: () => 'Mã SKU',
    renderCell: (r) => <span className="mono" style={{ color: 'var(--accent)' }}>{r.sku.code}</span>,
  }),
  createTableColumn({
    columnId: 'name',
    compare: (a, b) => a.sku.name.localeCompare(b.sku.name),
    renderHeaderCell: () => 'Tên hàng',
    renderCell: (r) => r.sku.name,
  }),
  createTableColumn({
    columnId: 'qty',
    compare: (a, b) => a.sku.qty - b.sku.qty,
    renderHeaderCell: () => 'SL tiếp nhận',
    renderCell: (r) => <span style={{ fontWeight: 700 }}>{r.sku.qty.toLocaleString()}</span>,
  }),
];

export default function TiepNhan() {
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();
  const totalQty = SKUS.reduce((s, k) => s + k.qty, 0);
  const rows = SKUS
    .map((sku, i) => ({ sku, i }))
    .filter(({ sku }) => !query || `${sku.code} ${sku.name}`.toLowerCase().includes(query));

  return (
    <>
      <PageHeader
        title="Hàng tiếp nhận"
        subtitle={`Danh sách SKU đã nhận về kho — ${new Date().toLocaleDateString('vi-VN')}`}
      />
      <div className="stats-row">
        <StatCard label="Tổng SKU" value={SKUS.length} sub="mã hàng" />
        <StatCard label="Tổng số lượng" value={totalQty.toLocaleString()} sub="sản phẩm" />
      </div>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div className="card-title" style={{ margin: 0 }}>Chi tiết hàng tiếp nhận</div>
          <SearchBox
            placeholder="Tìm mã SKU hoặc tên hàng..."
            value={q}
            onChange={(_, d) => setQ(d.value)}
            style={{ width: 260 }}
          />
        </div>
        <DataGrid
          items={rows}
          columns={columns}
          sortable
          getRowId={(r) => r.sku.id}
          size="small"
        >
          <DataGridHeader>
            <DataGridRow>
              {({ renderHeaderCell }) => <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>}
            </DataGridRow>
          </DataGridHeader>
          <DataGridBody>
            {({ item, rowId }) => (
              <DataGridRow key={rowId}>
                {({ renderCell }) => <DataGridCell>{renderCell(item)}</DataGridCell>}
              </DataGridRow>
            )}
          </DataGridBody>
        </DataGrid>
      </div>
    </>
  );
}
