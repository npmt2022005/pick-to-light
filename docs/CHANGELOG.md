# CHANGELOG — Hệ thống Put-to-Light

Tất cả thay đổi đáng chú ý của dự án được ghi lại tại đây.
Format theo [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

---

## [1.3.0] — 2026-06-16

### Thêm mới
- **Bước Phân công khu vực (step 4)** — màn hình mới giữa Điều chỉnh và Vận hành
  - Mỗi khu vực hiển thị 3 slot màu cố định: 🟡 Vàng · 🔴 Đỏ · 🟢 Xanh
  - Pool 9 nhân viên — gán vào slot màu bằng 2 click
  - Gỡ nhân viên bằng nút ×
  - Nút "Bắt đầu Vận hành" chỉ active khi đã gán ít nhất 1 người
- **Vòng lặp phiên** — nút "↩ Phiên phân hàng tiếp theo" sau khi vận hành xong
  - Reset toàn bộ state (workers, sim, kế hoạch, phân công)
  - Quay về màn hình Phân công để bắt đầu phiên mới
- **`WORKERS_POOL`** — pool 9 nhân viên với màu sắc riêng biệt
- **`SLOT_COLORS`** — constant 3 màu cố định (yellow/red/green) dùng xuyên suốt hệ thống
- **`getWorkersForSlot(colorKey)`** — lấy danh sách NV được gán cho 1 màu qua tất cả khu vực
- **`getZoneStoreIndices(zoneId)`** — map zone → global store indices

### Thay đổi
- **Simulation song song theo zone** — mỗi NV chỉ làm trong zone của mình, các zone chạy đồng thời (không còn tuần tự A→B→C)
- **Sidebar vận hành** — hiển thị per-worker card thay vì per-slot:
  - Tên, mã NV, badge khu vực, badge màu đèn
  - Status: "Bin X/N", "✓ Zone xong — chờ", "Quét SKU tiếp theo…"
  - Progress bar tính theo zone của từng NV
- **LED board** — đèn màu chỉ sáng ở zone có NV được gán màu đó
- **Nút check-in** dùng tên NV thật từ phân công (không còn hardcode An/Bình/Cường)
- Step tracker dùng tên NV động theo phân công
- Số bước tăng từ 5 → 6 (thêm Phân công = step 4, Vận hành = step 5, Báo cáo = step 6)
- Khu vực C thêm `floors/racksPerFloor/binsPerRack` để tính bin count nhất quán
- Bỏ `WORKERS` khỏi toàn bộ simulation/LED/sidebar — thay bằng `SLOT_COLORS`

### Docs
- Thêm `docs/PRD.md`
- Thêm `docs/USER_FLOW.md`
- Thêm `docs/CHANGELOG.md`

---

## [1.2.0] — 2026-06-15

### Thêm mới
- **20 SKU** (tăng từ 9) với mix 7 đủ / 7 thiếu / 6 dư
- **STORES_ALL** (89 ngăn vật lý: A×49 + B×37 + C×3) tách biệt với STORES (9 cửa hàng phiên demo)
- **Search filter** trên màn hình Tiếp nhận và Kế hoạch — tìm SKU theo mã hoặc tên
- **IT — Khu vực management**: thêm khu vực với tầng/kệ/ngăn hierarchy
- **IT — LED test**: test từng ngăn (3 chấm màu độc lập) và test toàn khu vực
- **editPlan 2D** (`state.editPlan[skuIdx][storeIdx]`) — Điều chỉnh per-store thay vì per-SKU
- **WORKER_QUEUES** phân 20 SKU cho 3 người: An 7 / Bình 7 / Cường 6

### Thay đổi
- **Điều chỉnh** — redesign thành bảng crosstab SKU × cửa hàng (sửa từng ô)
- **Zone** đổi tên thành **Khu vực** toàn bộ UI
- Bỏ city labels (Hà Nội, TP.HCM...) khỏi zone và store
- Bỏ `shortName` khỏi STORES
- Bỏ trường LOT (không cần thiết)
- Kế hoạch không hiển thị grouping theo khu vực (chỉ biết SKU × cửa hàng × số lượng)
- Hardcode Khu vực A (1 tầng, 1 kệ, 49 ngăn) và Khu vực B (1 tầng, 1 kệ, 37 ngăn)

### Sửa lỗi
- Bỏ reference `store.name` còn sót trong `renderBaoCao` (sau khi xoá city names)
- Fix duplicate `${s.id}` trong header Kế hoạch

---

## [1.1.0] — 2026-06-14

### Thêm mới
- **Mock data 3 case đồng thời**: đủ hàng / thiếu hàng / dư hàng trong cùng 1 phiên
- **Màn hình Vận hành** — control-room UI, LED board thời gian thực
  - Sidebar: worker cards với trạng thái, SKU đang làm, progress bar
  - LED board: per-bin với 3 slot màu, animation khi đang phân
  - Simulation tự động: tick mỗi 700ms, random eligible worker
- **Màn hình Báo cáo** — tổng kết phiên, SKU dư kho
- **Màn hình IT — Sơ đồ kho** — hiển thị ngăn vật lý, test đèn
- **3 vai trò**: Quản lý VH / IT / Tổng quản lý (tab switching)

### Thay đổi
- Redesign toàn bộ layout: dark theme, control-room style
- Sidebar navigation với step tracker (done/active/pending)
- LED model: 1 ngăn = 3 slot màu, nhiều màu sáng đồng thời

---

## [1.0.0] — 2026-06-10

### Thêm mới
- Khởi tạo project: single-file HTML (CSS + JS inline)
- Màn hình Tiếp nhận hàng
- Màn hình Kế hoạch phân phối (bảng SKU × cửa hàng)
- Màn hình Điều chỉnh (tổng per-SKU)
- 3 khu vực A / B / C, 9 cửa hàng demo
- Deploy GitHub Pages: `rockship-team.github.io/pick-to-light`

---

## Quy ước version

| Version | Ý nghĩa |
|---|---|
| **Major** (1.x.x → 2.x.x) | Thay đổi model/architecture lớn |
| **Minor** (x.1.x → x.2.x) | Thêm tính năng mới |
| **Patch** (x.x.1 → x.x.2) | Sửa lỗi, tweak UI nhỏ |
