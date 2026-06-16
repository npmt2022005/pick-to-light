# PRD — Hệ thống Put-to-Light quản lý phân hàng kho

**Phiên bản:** 1.0
**Cập nhật:** 2026-06-16
**Trạng thái:** Draft

---

## 1. Tổng quan

Hệ thống **Put-to-Light** hỗ trợ quy trình phân hàng từ kho trung tâm đến từng cửa hàng bằng cách dùng đèn LED gắn tại mỗi ngăn hàng để hướng dẫn nhân viên — thay thế hoàn toàn giấy tờ và việc đọc danh sách thủ công.

Nhân viên kho nhận tín hiệu đèn thay vì đọc phiếu: **đèn sáng màu nào → người màu đó bỏ hàng vào ngăn đó → nhấn xác nhận → đèn tắt → chuyển sang ngăn tiếp theo.**

---

## 2. Vấn đề cần giải quyết

| Vấn đề hiện tại | Hệ quả |
|---|---|
| Nhân viên đọc phiếu phân hàng bằng tay | Dễ nhầm ngăn, nhầm số lượng |
| Không có cơ chế đối chiếu hàng nhận vs kế hoạch | Phân hàng sai khi thiếu hàng, không ai biết |
| Quản lý không thấy tiến độ thời gian thực | Phải hỏi nhân viên hoặc chờ báo cáo cuối ca |
| Không có quy trình phân công nhân viên vào khu vực | Nhân viên tự phân công, thiếu kiểm soát |

---

## 3. Mục tiêu sản phẩm

1. **Giảm lỗi phân hàng** — nhân viên không cần đọc giấy, làm theo tín hiệu đèn
2. **Tăng tốc độ phân hàng** — nhiều nhân viên làm song song, nhiều khu vực đồng thời
3. **Quản lý có visibility thời gian thực** — biết ai đang làm gì, ở đâu, tiến độ bao nhiêu
4. **Kiểm soát sai lệch hàng tồn** — phát hiện thiếu/dư ngay trước khi bắt đầu phân hàng

---

## 4. Người dùng (Personas)

### 4.1 Quản lý vận hành
- Chịu trách nhiệm toàn bộ phiên phân hàng
- Cần đối chiếu hàng nhận, điều chỉnh kế hoạch, phân công nhân viên và theo dõi tiến độ
- Xem báo cáo tổng kết cuối phiên

### 4.2 Nhân viên kho
- Thực hiện việc phân hàng vật lý theo hướng dẫn đèn LED
- Không cần đọc tài liệu — chỉ cần làm theo đèn
- Quét thẻ để bắt đầu ca, quét SKU để kích hoạt đèn

### 4.3 IT / Kỹ thuật viên kho
- Thiết lập cấu trúc kho: khu vực, tầng, kệ, ngăn
- Kiểm tra và test hệ thống đèn LED trước ca làm việc
- Quản lý địa chỉ LED từng ngăn

---

## 5. Luồng vận hành chính

```
① Tiếp nhận hàng
   └─ Xem danh sách SKU đã về kho + số lượng thực tế nhận
   └─ Tìm kiếm SKU theo mã hoặc tên

② Kế hoạch phân phối
   └─ Bảng SKU × cửa hàng: số lượng cần phân cho từng ngăn
   └─ Tìm kiếm SKU

③ Điều chỉnh kế hoạch
   └─ Đối chiếu SL tiếp nhận vs kế hoạch → 3 trạng thái:
       • Đủ hàng   → chốt được ngay
       • Dư hàng   → chốt được, ghi nhận dư trong báo cáo
       • Thiếu hàng → phải giảm SL ngăn (tổng ≤ tiếp nhận) trước khi chốt

④ Phân công khu vực
   └─ Mỗi khu vực có 3 slot màu cố định: 🟡 Vàng · 🔴 Đỏ · 🟢 Xanh
   └─ Quản lý gán nhân viên vào từng slot màu mỗi khu vực (tối đa 3 NV/khu)
   └─ Tối đa 9 nhân viên nếu 3 khu × 3 màu đều được gán

⑤ Vận hành
   └─ Nhân viên quét thẻ theo từng màu để bắt đầu ca
   └─ Đèn LED sáng đúng màu tại đúng ngăn → nhân viên bỏ hàng → xác nhận
   └─ Quản lý thấy tiến độ thời gian thực: ai đang ở khu nào, bin bao nhiêu, SKU gì
   └─ Khi hết phiên → nút "Phiên tiếp theo" để bắt đầu lại

⑥ Báo cáo
   └─ Tổng kết: đã phân bao nhiêu sp, SKU nào dư kho, tỷ lệ hoàn thành
```

---

## 6. Tính năng chi tiết

### 6.1 Tiếp nhận hàng
- Hiển thị danh sách SKU với mã, tên, số lượng nhận
- Tìm kiếm SKU theo mã hoặc tên hàng

### 6.2 Kế hoạch phân phối
- Bảng crosstab: SKU (hàng) × Cửa hàng (cột)
- Hiển thị số lượng cần phân cho từng ngăn
- Tìm kiếm SKU

### 6.3 Điều chỉnh kế hoạch
- So sánh tổng kế hoạch vs số lượng tiếp nhận theo từng SKU
- Cho phép sửa số lượng từng ngăn (từng ô trong bảng)
- Hiển thị trạng thái: Đủ / Thiếu / Dư
- Nút Chốt chỉ active khi không có SKU nào thiếu hàng

### 6.4 Phân công khu vực
- Hiển thị sơ đồ kho theo khu vực
- 3 slot màu cố định mỗi khu: Vàng · Đỏ · Xanh
- Pool 9 nhân viên — gán vào slot màu bất kỳ
- Mỗi nhân viên chỉ thuộc 1 slot màu trong 1 khu vực

### 6.5 Vận hành
- Step-by-step check-in: từng màu quét thẻ
- Bảng LED thời gian thực: mỗi ngăn hiển thị trạng thái đèn (sáng / xác nhận / chờ)
- Sidebar per-worker: tên, mã NV, khu vực, màu, SKU đang làm, tiến độ
- Nhân viên ở các khu vực làm song song, không chờ nhau
- Khi xong phiên: xem báo cáo hoặc bắt đầu phiên mới

### 6.6 Báo cáo
- Tổng số sản phẩm đã phân
- Danh sách SKU còn dư kho
- Tỷ lệ hoàn thành theo SKU

### 6.7 Sơ đồ kho (IT)
- Hiển thị toàn bộ ngăn vật lý theo khu vực
- Test đèn từng ngăn (3 màu độc lập)
- Test đèn toàn bộ khu vực
- Thêm khu vực mới: tầng · kệ/tầng · ngăn/kệ

---

## 7. Mô hình LED

| Đơn vị | Mô tả |
|---|---|
| 1 ngăn | 1 cửa hàng = 1 địa chỉ LED |
| 1 địa chỉ LED | 3 slot màu (Vàng / Đỏ / Xanh) |
| 1 màu | 1 nhân viên trong khu vực đó |
| Nhiều màu | Có thể sáng đồng thời trong cùng 1 ngăn |
| 1 nhân viên | Chỉ đảm nhiệm 1 SKU tại 1 thời điểm |

---

## 8. Cấu trúc kho

```
Kho
└─ Khu vực (Zone) — ví dụ: A, B, C
   └─ Tầng
      └─ Kệ
         └─ Ngăn (Bin) — địa chỉ LED
```

Mỗi ngăn có địa chỉ theo format: `{KhuVực}-{SốThứTự}` (VD: A-01, B-12)

---

## 9. Vai trò & Quyền truy cập

| Màn hình | Quản lý VH | IT | Tổng Quản lý |
|---|:---:|:---:|:---:|
| Tiếp nhận | ✓ | ✓ | — |
| Kế hoạch | ✓ | ✓ | — |
| Điều chỉnh | ✓ | ✓ | — |
| Phân công | ✓ | ✓ | — |
| Vận hành | ✓ | ✓ | — |
| Báo cáo | ✓ | ✓ | — |
| Sơ đồ kho / IT | — | ✓ | — |
| Dashboard tổng | — | — | ✓ |

---

## 10. Phạm vi (Scope)

### Trong scope (v1)
- Luồng 6 bước cho 1 phiên phân hàng
- Tối đa 3 khu vực, 9 nhân viên đồng thời
- Demo với dữ liệu tĩnh (20 SKU, 9 cửa hàng)
- Giao diện web, single-page

### Ngoài scope (v1)
- Backend / database thật
- Kết nối phần cứng LED thật
- Quản lý nhiều phiên song song
- Lịch sử phiên, analytics dài hạn
- Mobile app cho nhân viên

---

## 11. Metrics thành công

| Metric | Mục tiêu |
|---|---|
| Tỷ lệ phân hàng đúng ngăn | ≥ 99% |
| Thời gian phân hàng / phiên | Giảm ≥ 30% so với phương pháp giấy tờ |
| Thời gian phát hiện sai lệch hàng tồn | Trước khi bắt đầu phân (bước Điều chỉnh) |
| Thời gian setup ca làm việc | < 5 phút |
