import {
  Badge, Accordion, AccordionItem, AccordionHeader, AccordionPanel,
  Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell,
} from '@fluentui/react-components';
import { SKUS, STORES, ZONES } from '../core/data.js';
import { state } from '../core/store.js';
import { getEditTotal } from '../core/session.js';
import { PageHeader, StatCard } from '../shared.jsx';

export default function BaoCao() {
  const skuStats = SKUS.map((sku, si) => {
    const willDistrib = getEditTotal(si);
    const distributed = state.distributed[si].reduce((a, b) => a + b, 0);
    const surplusStock = sku.qty - willDistrib;
    const remaining = willDistrib - distributed;
    return { sku, si, willDistrib, distributed, surplusStock, remaining };
  });

  const totalDist = skuStats.reduce((a, s) => a + s.distributed, 0);
  const totalSurplus = skuStats.reduce((a, s) => a + Math.max(0, s.surplusStock), 0);
  const completedSkus = skuStats.filter((s) => s.remaining === 0).length;
  const surplusSkus = skuStats.filter((s) => s.surplusStock > 0);

  return (
    <>
      <PageHeader
        title="Báo cáo phiên làm việc"
        subtitle={`Tổng kết kết quả phân hàng — ${new Date().toLocaleString('vi-VN')}`}
      />
      <div className="stats-row">
        <StatCard label="SKU hoàn thành" value={`${completedSkus}/${SKUS.length}`} sub="mã hàng" valueColor="var(--green)" />
        <StatCard label="Tổng đã phân" value={totalDist.toLocaleString()} sub="sản phẩm" />
        <StatCard
          label="Hàng dư kho"
          value={totalSurplus.toLocaleString()}
          sub={totalSurplus > 0 ? `${surplusSkus.length} mặt hàng dư` : 'không có'}
          valueColor={totalSurplus > 0 ? 'var(--yellow)' : 'var(--text-muted)'}
        />
        <StatCard label="Nhân viên" value={3} sub="đã hoàn thành ca" />
      </div>

      {surplusSkus.length > 0 && (
        <div style={{
          border: '1px solid rgba(255,210,62,.35)', background: 'rgba(255,210,62,.06)',
          borderRadius: 10, padding: '14px 16px',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--yellow)', marginBottom: 10 }}>
            Hàng dư kho sau phiên làm việc
          </div>
          <Table size="extra-small">
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Mã SKU</TableHeaderCell>
                <TableHeaderCell>Tên hàng</TableHeaderCell>
                <TableHeaderCell style={{ textAlign: 'right' }}>SL tiếp nhận</TableHeaderCell>
                <TableHeaderCell style={{ textAlign: 'right' }}>Đã phân</TableHeaderCell>
                <TableHeaderCell style={{ textAlign: 'right', color: 'var(--yellow)' }}>Dư kho</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {surplusSkus.map(({ sku, distributed, surplusStock }) => (
                <TableRow key={sku.id}>
                  <TableCell><span className="mono" style={{ fontSize: 12, color: 'var(--accent)' }}>{sku.code}</span></TableCell>
                  <TableCell style={{ fontSize: 12 }}>{sku.name}</TableCell>
                  <TableCell style={{ textAlign: 'right', fontSize: 12 }}>{sku.qty.toLocaleString()}</TableCell>
                  <TableCell style={{ textAlign: 'right', fontSize: 12, color: 'var(--green)' }}>{distributed.toLocaleString()}</TableCell>
                  <TableCell style={{ textAlign: 'right', fontSize: 12, fontWeight: 700, color: 'var(--yellow)' }}>+{surplusStock.toLocaleString()}</TableCell>
                </TableRow>
              ))}
              <TableRow style={{ borderTop: '1px solid var(--border)' }}>
                <TableCell colSpan={4} style={{ fontSize: 12, fontWeight: 700 }}>Tổng dư kho</TableCell>
                <TableCell style={{ textAlign: 'right', fontSize: 12, fontWeight: 800, color: 'var(--yellow)' }}>
                  +{totalSurplus.toLocaleString()} sp
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}

      <div className="card">
        <div className="card-title">Tổng hợp theo SKU</div>
        <div className="tbl-wrap">
          <Table size="small">
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Mã SKU</TableHeaderCell>
                <TableHeaderCell>Tên hàng</TableHeaderCell>
                <TableHeaderCell style={{ textAlign: 'right' }}>SL tiếp nhận</TableHeaderCell>
                <TableHeaderCell style={{ textAlign: 'right' }}>Đã phân</TableHeaderCell>
                <TableHeaderCell style={{ textAlign: 'right' }}>Dư kho</TableHeaderCell>
                <TableHeaderCell>Trạng thái</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {skuStats.map(({ sku, distributed, surplusStock, remaining }) => {
                const isDone = remaining === 0;
                const hasSurplus = surplusStock > 0;
                const label = !isDone ? 'Chưa xong' : hasSurplus ? `Dư ${surplusStock.toLocaleString()} sp` : 'Hoàn thành';
                const color = !isDone ? 'danger' : hasSurplus ? 'warning' : 'success';
                return (
                  <TableRow key={sku.id}>
                    <TableCell><span className="mono" style={{ color: 'var(--accent)' }}>{sku.code}</span></TableCell>
                    <TableCell style={{ fontSize: 12 }}>{sku.name}</TableCell>
                    <TableCell style={{ textAlign: 'right' }}>{sku.qty.toLocaleString()}</TableCell>
                    <TableCell style={{ textAlign: 'right', fontWeight: 700, color: 'var(--green)' }}>{distributed.toLocaleString()}</TableCell>
                    <TableCell style={{ textAlign: 'right', fontWeight: 600, color: hasSurplus ? 'var(--yellow)' : 'var(--text-muted)' }}>
                      {hasSurplus ? `+${surplusStock.toLocaleString()}` : '—'}
                    </TableCell>
                    <TableCell><Badge appearance="tint" color={color}>{label}</Badge></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Chi tiết theo cửa hàng</div>
        <Accordion multiple collapsible>
          {skuStats.map(({ sku, si }) => (
            <AccordionItem key={sku.id} value={sku.id}>
              <AccordionHeader>
                <span className="mono" style={{ color: 'var(--accent)' }}>{sku.code}</span>
                <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: 6 }}>— {sku.name}</span>
              </AccordionHeader>
              <AccordionPanel>
                <Table size="extra-small">
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell>Cửa hàng</TableHeaderCell>
                      <TableHeaderCell>Khu vực</TableHeaderCell>
                      <TableHeaderCell style={{ textAlign: 'right' }}>KH</TableHeaderCell>
                      <TableHeaderCell style={{ textAlign: 'right' }}>Đã phân</TableHeaderCell>
                      <TableHeaderCell>Trạng thái</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {STORES.map((store, ci) => {
                      const zone = ZONES.find((z) => z.id === store.zone);
                      const plan = state.editPlan[si][ci];
                      const dist = state.distributed[si][ci];
                      const ok = dist >= plan;
                      return (
                        <TableRow key={store.id}>
                          <TableCell>{store.id}</TableCell>
                          <TableCell style={{ color: zone.color }}>{zone.name}</TableCell>
                          <TableCell style={{ textAlign: 'right' }}>{plan}</TableCell>
                          <TableCell style={{ textAlign: 'right', fontWeight: 700, color: ok ? 'var(--green)' : 'var(--red)' }}>{dist}</TableCell>
                          <TableCell><Badge appearance="tint" color={ok ? 'success' : 'danger'}>{ok ? 'OK' : 'Thiếu'}</Badge></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </>
  );
}
