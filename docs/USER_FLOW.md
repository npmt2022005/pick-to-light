# User Flow — Hệ thống Put-to-Light

**Phiên bản:** 1.0
**Cập nhật:** 2026-06-16

---

## Tổng quan luồng

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Quản lý VH │     │  Nhân viên  │     │     IT      │
│             │     │    kho      │     │             │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │                   │         ┌─────────▼────────┐
       │                   │         │  Setup sơ đồ kho  │
       │                   │         │  Test đèn LED      │
       │                   │         └─────────┬─────────┘
       │                   │                   │
┌──────▼──────────────────────────────────────-┘
│
│  ① TIẾP NHẬN → ② KẾ HOẠCH → ③ ĐIỀU CHỈNH
│         → ④ PHÂN CÔNG → ⑤ VẬN HÀNH → ⑥ BÁO CÁO
│
└─ Lặp lại cho phiên tiếp theo
```

---

## Flow IT — Setup kho (thực hiện 1 lần)

```
[IT vào hệ thống]
       │
       ▼
[Vào màn hình Sơ đồ kho]
       │
       ├─── Khu vực đã có sẵn (A, B, C)?
       │         │
       │        YES ──► Bỏ qua
       │         │
       │        NO  ──► [Thêm khu vực mới]
       │                   └─ Nhập: Mã · Tên · Tầng · Kệ/tầng · Ngăn/kệ
       │                   └─ Hệ thống tự tính tổng ngăn
       │
       ▼
[Test đèn từng ngăn]
       │
       ├─ Click từng chấm màu (Vàng / Đỏ / Xanh) → đèn bật/tắt độc lập
       │
       ▼
[Test đèn toàn khu vực]
       │
       ├─ Chọn khu vực → chọn màu → toàn bộ ngăn trong khu sáng
       │
       ▼
[✓ Kho sẵn sàng]
```

---

## Flow Quản lý VH — Phiên phân hàng

### Bước ① — Tiếp nhận hàng

```
[Hàng về kho]
       │
       ▼
[Quản lý vào màn hình Tiếp nhận]
       │
       ▼
[Xem danh sách SKU]
       │
       ├─ Mã SKU · Tên hàng · Số lượng nhận
       ├─ Tìm kiếm theo mã hoặc tên nếu cần
       │
       ▼
[Xác nhận danh sách → sang Kế hoạch]
```

---

### Bước ② — Kế hoạch phân phối

```
[Màn hình Kế hoạch]
       │
       ▼
[Xem bảng SKU × Cửa hàng]
       │
       ├─ Mỗi ô = số lượng cần phân cho cửa hàng đó
       ├─ Tìm kiếm SKU nếu cần
       │
       ▼
[Nắm được tổng kế hoạch → sang Điều chỉnh]
```

---

### Bước ③ — Điều chỉnh kế hoạch

```
[Màn hình Điều chỉnh]
       │
       ▼
[Hệ thống so sánh: SL nhận vs Tổng kế hoạch mỗi SKU]
       │
       ├──── Tất cả SKU Đủ hàng ──────────────────────► [Chốt kế hoạch ✓]
       │                                                        │
       ├──── Có SKU Dư hàng ──► Ghi nhận, vẫn chốt được ─────►│
       │                                                        │
       └──── Có SKU Thiếu hàng                                 │
                    │                                           │
                    ▼                                           │
       [Quản lý chỉnh SL từng ngăn cho SKU thiếu]              │
                    │                                           │
                    ▼                                           │
       [Tổng đã phân ≤ SL nhận?]                               │
                    │                                           │
                   YES ────────────────────────────────────────►│
                    │                                           │
                   NO  ──► [Tiếp tục chỉnh]                    │
                                                                ▼
                                                   [Sang Phân công khu vực]
```

---

### Bước ④ — Phân công khu vực

```
[Màn hình Phân công khu vực]
       │
       ▼
[Xem sơ đồ 3 khu vực: A · B · C]
Mỗi khu có 3 slot màu cố định: 🟡 Vàng · 🔴 Đỏ · 🟢 Xanh
       │
       ▼
[Quản lý gán nhân viên vào slot]
       │
       ├─ Click slot màu trong khu vực
       ├─ Chọn nhân viên từ pool (9 người)
       ├─ Nhân viên biến khỏi pool sau khi gán
       ├─ Gỡ nhân viên: click [×] trên slot đã gán
       │
       ├─ Ràng buộc:
       │   └─ Tối đa 3 NV / khu vực (1 người / màu)
       │   └─ 1 NV chỉ được gán 1 slot duy nhất
       │
       ▼
[Đã gán ít nhất 1 NV?]
       │
      YES ──► [Bắt đầu Vận hành →]
       │
      NO  ──► Nút bị khoá, chưa thể tiếp tục
```

---

### Bước ⑤ — Vận hành

```
[Màn hình Vận hành]
       │
       ▼
┌─── CHECK-IN NHÂN VIÊN ───────────────────────────────────┐
│                                                           │
│  [NV màu Vàng quét thẻ] ──► slot Vàng active             │
│  [NV màu Đỏ quét thẻ]  ──► slot Đỏ active                │
│  [NV màu Xanh quét thẻ]──► slot Xanh active              │
│                                                           │
│  [▶ Bắt đầu phiên làm việc]                              │
│  [▶ Nhân viên bắt đầu phân hàng]                         │
└───────────────────────────────────────────────────────────┘
       │
       ▼
┌─── VÒNG LẶP PHÂN HÀNG ──────────────────────────────────┐
│                                                           │
│  Với mỗi SKU trong hàng đợi (mỗi màu có hàng đợi riêng):│
│                                                           │
│  ┌─ Slot Vàng ─────────────────────────────────────┐     │
│  │  Đèn vàng sáng tại ngăn → NV vàng bỏ hàng      │     │
│  │  NV xác nhận → đèn chuyển trạng thái ✓          │     │
│  │  Tiến đến ngăn tiếp theo trong khu vực           │     │
│  └──────────────────────────────────────────────────┘     │
│                                                           │
│  ┌─ Slot Đỏ ───────────────────────────────────────┐     │
│  │  Song song với Vàng — cùng lúc, khu vực khác    │     │
│  └──────────────────────────────────────────────────┘     │
│                                                           │
│  ┌─ Slot Xanh ─────────────────────────────────────┐     │
│  │  Song song — độc lập với Vàng và Đỏ             │     │
│  └──────────────────────────────────────────────────┘     │
│                                                           │
│  Xong hết ngăn trong khu → quét SKU tiếp theo            │
│  Xong hết SKU trong hàng đợi → NV hoàn thành ca          │
└───────────────────────────────────────────────────────────┘
       │
       ▼
[Tất cả NV hoàn thành?]
       │
      YES
       │
       ▼
┌────────────────────────────────┐
│  ✓ Phiên hoàn thành!           │
│                                │
│  [Xem Báo cáo →]               │
│  [↩ Phiên phân hàng tiếp theo] │
└────────────────────────────────┘
```

---

### Bước ⑥ — Báo cáo

```
[Màn hình Báo cáo]
       │
       ▼
[Xem tổng kết phiên]
       │
       ├─ Tổng sản phẩm đã phân
       ├─ Danh sách SKU dư kho (nếu có)
       ├─ Tỷ lệ hoàn thành
       │
       ▼
[Kết thúc phiên]   hoặc   [Quay lại Phân công → phiên mới]
```

---

## Vòng lặp phiên

```
         ┌──────────────────────────────────────┐
         │                                      │
         ▼                                      │
   [Phân công khu vực]                          │
         │                                      │
         ▼                                      │
      [Vận hành]                                │
         │                                      │
         ▼                                      │
      [Báo cáo]                                 │
         │                                      │
         ├── Phiên tiếp theo ───────────────────┘
         │
         └── Kết thúc ngày làm việc
```

---

## Trạng thái đèn LED mỗi ngăn

```
┌──────────────────────────────────────────────────────┐
│  Ngăn A-01                                           │
│                                                      │
│  🟡 ●  ATN01-WHT-L   20 sp   [ĐANG PHÂN]            │  ← đèn vàng đang sáng
│  🔴 ●  ATN01-BLK-XL  15 sp                          │  ← đèn đỏ đang sáng
│  🟢 ○  —                                             │  ← đèn xanh chưa active
│                                                      │
└──────────────────────────────────────────────────────┘

Trạng thái có thể có:
  ○  Chưa active (NV chưa check-in hoặc không được gán)
  ●  Đang chờ (NV đang ở ngăn khác)
  ● [ĐANG PHÂN]  NV đang phân hàng vào ngăn này
  ✓  Đã xác nhận xong
```

---

## Edge Cases

| Tình huống | Xử lý |
|---|---|
| SKU thiếu hàng | Khoá nút Chốt — bắt buộc giảm SL ngăn trước |
| Slot màu chưa có NV | Đèn màu đó không sáng, không ảnh hưởng màu khác |
| Tất cả NV 1 màu xong | Slot đó done, 2 màu còn lại tiếp tục bình thường |
| Khu vực chưa gán NV | Đèn của khu đó không bao giờ sáng trong phiên |
| Quản lý muốn phiên mới | Nhấn "Phiên tiếp theo" → reset toàn bộ state, về Phân công |
