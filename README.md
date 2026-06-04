# Pick-to-Light / Put-to-Light

Wireframe hệ thống phân hàng thông minh sử dụng đèn LED định vị — giúp công nhân kho xác định đúng ngăn kệ cần đặt/lấy hàng mà không cần đọc giấy tờ.

## Demo

**https://rockship-team.github.io/pick-to-light/**

Xem trực tiếp trên trình duyệt — không cần cài đặt hay server.

## Vai trò & phân quyền

Đăng nhập chọn 1 trong 3 vai trò — sidebar và quyền thao tác tự thay đổi theo vai trò:

| Vai trò | Nhiệm vụ | Màn hình thấy được |
|---|---|---|
| 📊 **Tổng Quản Lý** | Giám sát & ra quyết định | Dashboard, LOT/Batch *(xem)*, Gán tự động *(xem)*, Báo cáo |
| 🏭 **Quản Lý Vận Hành** | Vận hành phân hàng hằng ngày | Dashboard, LOT/Batch, Nhận API, Gán tự động *(thao tác)*, Bổ sung hàng, Layout *(xem)*, Báo cáo |
| 🔧 **IT / Kỹ Thuật** | Cài đặt & bảo trì hệ thống | Dashboard, Tạo Layout kho *(chỉnh sửa)*, Light Module Test, Cấu hình thiết bị |

## Màn hình

| Màn hình | Mô tả |
|---|---|
| Đăng nhập | Chọn vai trò → mô tả nhiệm vụ → vào Dashboard |
| Dashboard | Trang chủ theo vai trò: KPI, việc cần làm, truy cập nhanh |
| Quản lý LOT / Batch | Theo dõi tiến độ các đợt phân hàng trong ngày |
| Nhận dữ liệu API | Kết nối 2 đầu API: hàng tiếp nhận và kế hoạch phân phối |
| Kết quả gán tự động | Mapping tồn kho × kế hoạch — đủ/thiếu/dư, xác nhận/từ chối/tính lại |
| Báo cáo & thống kê | Sản lượng, độ chính xác, hiệu suất theo khu vực & nhân sự |
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
