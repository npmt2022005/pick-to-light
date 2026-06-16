# Put-to-Light — Demo App

Demo hệ thống phân hàng có hướng dẫn đèn LED — nhân viên kho biết chính xác cần bỏ hàng vào ngăn nào mà không cần đọc giấy tờ.

## Demo

**https://rockship-team.github.io/pick-to-light/**

Chạy thẳng trên trình duyệt — không cần cài đặt hay server.

---

## Mô hình hoạt động

- **1 ngăn = 1 cửa hàng = 1 địa chỉ LED**
- **1 địa chỉ LED có 3 slot màu** (vàng / đỏ / xanh) — nhiều màu có thể sáng đồng thời
- **1 màu = 1 nhân viên** — màu là danh tính nhân viên, không phải loại hàng
- Nhân viên làm 1 SKU → đi qua tất cả khu vực (A → B → C) → xong mới sang SKU tiếp theo
- Tối đa 3 nhân viên làm đồng thời, mỗi người 1 màu đèn riêng

---

## Vai trò

| Vai trò | Màn hình |
|---|---|
| **Quản lý vận hành** | Tiếp nhận · Kế hoạch · Điều chỉnh · Vận hành · Báo cáo |
| **IT** | Sơ đồ kho (quản lý khu vực, test đèn) + toàn bộ màn hình trên |

---

## Luồng vận hành

```
① Tiếp nhận       Xem danh sách 20 SKU đã nhận về kho + số lượng
       ↓
② Kế hoạch        Bảng SKU × cửa hàng — số lượng cần phân cho từng ngăn
       ↓
③ Điều chỉnh      Đối chiếu tiếp nhận vs kế hoạch
                   • Đủ hàng   → cho phép chốt
                   • Dư hàng   → cho phép chốt, ghi nhận dư ở báo cáo
                   • Thiếu hàng → manager giảm SL từng ngăn, tổng ≤ tiếp nhận mới chốt
       ↓
④ Vận hành        Nhân viên quét thẻ + quét SKU → đèn sáng đúng ngăn
                   → nhấn xác nhận từng ngăn → sang ngăn tiếp theo
       ↓
⑤ Báo cáo         Tổng kết: đã phân bao nhiêu, SKU nào còn dư kho
```

---

## Màn hình IT — Sơ đồ kho

- Hiển thị toàn bộ **89 ngăn vật lý** (Khu A: 49 ngăn · Khu B: 37 ngăn · Khu C: 3 ngăn)
- Ngăn đang dùng trong phiên được đánh dấu riêng
- **Test đèn từng ngăn**: click từng chấm màu để bật/tắt độc lập
- **Test đèn cả khu vực**: chọn màu → toàn bộ ngăn trong khu sáng cùng lúc
- **Thêm khu vực**: nhập mã · tên · số tầng · số kệ/tầng · số ngăn/kệ → tự tính tổng ngăn

---

## Dữ liệu demo

| | |
|---|---|
| SKU | 20 (mix 7 đủ / 7 thiếu / 6 dư) |
| Cửa hàng trong phiên | 9 |
| Ngăn vật lý | 89 |
| Nhân viên | 3 (An · Bình · Cường) |
| Khu vực | A (49 ngăn) · B (37 ngăn) · C (3 ngăn) |

---

## Tech

Single-file HTML — CSS + JS inline, không có dependency ngoài ngoài Google Fonts.
