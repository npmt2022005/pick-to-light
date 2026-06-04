# Pick-to-Light / Put-to-Light

Wireframe hệ thống phân hàng thông minh sử dụng đèn LED định vị — giúp công nhân kho xác định đúng ngăn kệ cần đặt/lấy hàng mà không cần đọc giấy tờ.

## Demo

**https://rockship-team.github.io/pick-to-light/**

Xem trực tiếp trên trình duyệt — không cần cài đặt hay server.

## Màn hình

| Màn hình | Mô tả |
|---|---|
| Đăng nhập | Xác thực theo vai trò: Quản Lý Vận Hành, IT, Tổng Quản Lý |
| Quản lý LOT / Batch | Theo dõi tiến độ các đợt phân hàng trong ngày |
| Nhận dữ liệu API | Kết nối 2 đầu API: hàng tiếp nhận và kế hoạch phân phối |
| Kết quả gán tự động | Xem và điều chỉnh phân bổ hàng theo từng cửa hàng |
| Tạo Layout kho | Cấu hình khu vực, kệ, tầng — kéo thả gán địa chỉ đèn |
| Bổ sung hàng | Replenishment — đèn sáng hướng dẫn vị trí cần bổ sung |
| Light Module Test | Kiểm tra hoạt động từng đèn trước khi vận hành |
| Cấu hình thiết bị | Quản lý Controller, Block, đèn, tài khoản người dùng |

## Luồng dữ liệu

```
API 1 — Hàng tiếp nhận        API 2 — Kế hoạch phân phối
(LOT, vị trí kệ, số lượng)    (SKU, cửa hàng, số lượng yêu cầu)
              └──────────────┬──────────────┘
                             ▼
                  Thuật toán gán tự động
                             ▼
              Xác nhận kết quả → Bật đèn
                             ▼
                  Công nhân phân hàng theo đèn
```

## Tech

Single-file HTML — không có dependency ngoài. Fonts từ Google Fonts (IBM Plex Mono, IBM Plex Sans Thai).
