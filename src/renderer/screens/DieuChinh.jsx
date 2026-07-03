import {
  Button, Badge, SpinButton, MessageBar, MessageBarBody, MessageBarTitle,
  Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell,
} from '@fluentui/react-components';
import { CheckmarkRegular } from '@fluentui/react-icons';
import { SKUS, STORES, PLAN, getPlanTotal } from '../core/data.js';
import { state } from '../core/store.js';
import { getEditTotal, updatePlanCell, chotKeHoach } from '../core/session.js';
import { PageHeader } from '../shared.jsx';

export default function DieuChinh() {
  const hasDeficit = SKUS.some((sku, si) => getEditTotal(si) > sku.qty);
  const deficitCount = SKUS.filter((sku, si) => getEditTotal(si) > sku.qty).length;
  const surplusCount = SKUS.filter((sku, si) => getEditTotal(si) < sku.qty).length;

  const totalReceived = SKUS.reduce((a, s) => a + s.qty, 0);
  const totalOrig = PLAN.reduce((a, row) => a + row.reduce((x, y) => x + y, 0), 0);
  const totalWill = SKUS.reduce((a, _, si) => a + getEditTotal(si), 0);
  const totalSurplus = totalReceived - totalWill;

  return (
    <>
      <PageHeader
        title="Điều chỉnh kế hoạch"
        subtitle="Đối chiếu hàng tiếp nhận với kế hoạch phân phối — chỉnh số lượng từng ngăn trước khi bắt đầu"
      />

      {hasDeficit && (
        <MessageBar intent="error">
          <MessageBarBody>
            <MessageBarTitle>{deficitCount} SKU thiếu hàng</MessageBarTitle>
            Giảm số lượng ngăn xuống (tổng ≤ SL tiếp nhận) để có thể chốt kế hoạch
          </MessageBarBody>
        </MessageBar>
      )}

      <div className="card">
        <div className="tbl-wrap">
          <Table size="small">
            <TableHeader>
              <TableRow>
                <TableHeaderCell style={{ whiteSpace: 'nowrap' }}>Mã SKU</TableHeaderCell>
                <TableHeaderCell>Tên hàng</TableHeaderCell>
                <TableHeaderCell style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>Tiếp nhận</TableHeaderCell>
                {STORES.map((s) => (
                  <TableHeaderCell key={s.id} style={{ textAlign: 'center', fontSize: 10 }}>
                    {s.id}<br /><span style={{ fontSize: 10, opacity: 0.6 }}>{s.addr}</span>
                  </TableHeaderCell>
                ))}
                <TableHeaderCell style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>KH gốc</TableHeaderCell>
                <TableHeaderCell style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>Sẽ phân</TableHeaderCell>
                <TableHeaderCell style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>Dư/Thiếu</TableHeaderCell>
                <TableHeaderCell>Trạng thái</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SKUS.map((sku, si) => {
                const received = sku.qty;
                const planOrig = getPlanTotal(si);
                const willDistrib = getEditTotal(si);
                const surplus = received - willDistrib;
                const isDeficit = willDistrib > received;
                const isExact = surplus === 0;
                const badgeColor = isDeficit ? 'danger' : isExact ? 'success' : 'warning';
                const label = isDeficit ? 'Thiếu hàng' : isExact ? 'Đủ hàng' : `Dư ${surplus} sp`;

                return (
                  <TableRow key={sku.id} style={isDeficit ? { background: 'rgba(255,107,112,.05)' } : undefined}>
                    <TableCell><span className="mono" style={{ color: 'var(--accent)', fontSize: 12 }}>{sku.code}</span></TableCell>
                    <TableCell style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{sku.name}</TableCell>
                    <TableCell style={{ textAlign: 'right', fontWeight: 600 }}>{received}</TableCell>
                    {STORES.map((_, ci) => (
                      <TableCell key={ci} style={{ padding: '3px 4px', textAlign: 'center' }}>
                        <SpinButton
                          size="small"
                          min={0}
                          value={state.editPlan[si][ci]}
                          onChange={(_, d) => {
                            const v = d.value != null ? d.value : parseInt(d.displayValue, 10);
                            updatePlanCell(si, ci, Number.isNaN(v) ? 0 : v);
                          }}
                          style={{
                            width: 92,
                            ...(isDeficit ? { borderColor: 'var(--red)' } : {}),
                          }}
                        />
                      </TableCell>
                    ))}
                    <TableCell style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: 12 }}>{planOrig}</TableCell>
                    <TableCell style={{ textAlign: 'right', fontWeight: 700, color: isDeficit ? 'var(--red)' : 'var(--text)' }}>{willDistrib}</TableCell>
                    <TableCell style={{ textAlign: 'right', fontWeight: 600, color: isDeficit ? 'var(--red)' : isExact ? 'var(--text-muted)' : 'var(--yellow)' }}>
                      {isDeficit ? `−${willDistrib - received}` : surplus > 0 ? `+${surplus}` : '—'}
                    </TableCell>
                    <TableCell><Badge appearance="tint" color={badgeColor}>{label}</Badge></TableCell>
                  </TableRow>
                );
              })}
              <TableRow style={{ borderTop: '2px solid var(--border)', background: 'var(--surface2)' }}>
                <TableCell colSpan={2} style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Tổng cộng</TableCell>
                <TableCell style={{ textAlign: 'right', fontWeight: 700 }}>{totalReceived}</TableCell>
                {STORES.map((_, ci) => {
                  const colTotal = SKUS.reduce((a, _s, si) => a + state.editPlan[si][ci], 0);
                  return <TableCell key={ci} style={{ textAlign: 'center', fontSize: 12, fontWeight: 700 }}>{colTotal}</TableCell>;
                })}
                <TableCell style={{ textAlign: 'right', color: 'var(--text-muted)', fontWeight: 700 }}>{totalOrig}</TableCell>
                <TableCell style={{ textAlign: 'right', fontWeight: 700 }}>{totalWill}</TableCell>
                <TableCell style={{ textAlign: 'right', fontWeight: 700, color: totalSurplus < 0 ? 'var(--red)' : 'var(--yellow)' }}>
                  {totalSurplus >= 0 ? `+${totalSurplus}` : totalSurplus}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, alignItems: 'center', marginTop: 4 }}>
        {hasDeficit ? (
          <>
            <span style={{ fontSize: 12, color: 'var(--red)' }}>
              ⚠ Còn {deficitCount} SKU thiếu hàng — giảm SL ngăn trước khi chốt
            </span>
            <Button disabled icon={<CheckmarkRegular />}>Chốt kế hoạch</Button>
          </>
        ) : (
          <>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {surplusCount > 0 ? `${surplusCount} SKU dư kho — sẽ ghi nhận trong báo cáo` : 'Tất cả SKU khớp số lượng'}
            </span>
            <Button appearance="primary" icon={<CheckmarkRegular />} onClick={chotKeHoach}>Chốt kế hoạch</Button>
          </>
        )}
      </div>
    </>
  );
}
