# Pick-to-Light / Put-to-Light

Wireframe hệ thống phân hàng thông minh sử dụng đèn LED định vị — giúp công nhân kho xác định đúng ngăn kệ cần đặt/lấy hàng mà không cần đọc giấy tờ.

## Demo

**https://rockship-team.github.io/pick-to-light/**

Xem trực tiếp trên trình duyệt — không cần cài đặt hay server.

## Vai trò & phân quyền

Đăng nhập chọn 1 trong 3 vai trò — sidebar và quyền thao tác tự thay đổi theo vai trò:

| Vai trò | Nhiệm vụ | Màn hình thấy được |
|---|---|---|
| 📊 **Tổng Quản Lý** | Giám sát & ra quyết định | Dashboard, LOT/Batch *(xem)*, Chuẩn bị lô *(xem)*, Vận hành *(giám sát)*, Báo cáo |
| 🏭 **Quản Lý Vận Hành** | Vận hành phân hàng hằng ngày | Dashboard, LOT/Batch, Chuẩn bị lô hàng *(thao tác)*, Vận hành *(điều khiển)*, Bổ sung hàng, Layout *(xem)*, Báo cáo |
| 🔧 **IT / Kỹ Thuật** | Cài đặt & bảo trì hệ thống | Dashboard, Tạo Layout kho *(chỉnh sửa)*, Light Module Test, Cấu hình thiết bị |

## Màn hình

| Màn hình | Mô tả |
|---|---|
| Đăng nhập | Chọn vai trò → mô tả nhiệm vụ → vào Dashboard |
| Dashboard | Trang chủ theo vai trò: hành trình lô, việc cần làm, truy cập nhanh |
| Quản lý LOT / Batch | Theo dõi tiến độ các đợt phân hàng trong ngày |
| Chuẩn bị lô hàng | Nhận **từng API** và xem danh sách thô (bảng tồn kho · bảng kế hoạch) → bấm **Xác nhận & Đối chiếu** hệ thống mới map 2 nguồn → duyệt kết quả gán (đủ/thiếu/dư, chỉnh tay) → chốt kế hoạch |
| Giám sát vận hành | Chuẩn bị ca (load layout, kiểm tra thiết bị, double-check dữ liệu) → ca chạy thực: quét thẻ NV + SKU, đèn sáng, nhấn nút xác nhận, xử lý sự cố → biên bản ca |
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
       nhận từng nguồn → NGƯỜI XEM dữ liệu thô → Xác nhận & Đối chiếu
                             ▼
        Thuật toán gán tự động → người duyệt, chốt kế hoạch
                             ▼
   Chuẩn bị ca: load layout · kiểm tra controller/đèn · double-check dữ liệu
                             ▼
                           Mở ca
                             ▼
   NV quét thẻ vào ca → quét SKU → đèn sáng → bỏ hàng → nhấn nút xác nhận
                             ▼
   Xử lý sự cố (thiếu hàng → phiếu bổ sung · đèn lỗi → báo IT)
                             ▼
                   Đóng ca → biên bản ca
```

## Dữ liệu demo & khả năng scale

Toàn bộ dữ liệu (layout, lô hàng, SKU, cửa hàng, nhân viên) được **sinh động theo preset quy mô** — không hardcode. Đổi quy mô bằng dropdown trên màn Vận hành:

| Preset | Khu | Đèn | Cửa hàng | SKU |
|---|---|---|---|---|
| Kho nhỏ | 2 | 72 | 5 | 12 |
| Kho vừa | 4 | 288 | 12 | 24 |
| Kho lớn | 6 | 960 | 24 | 48 |

UI thiết kế để scale: sơ đồ kho hiển thị 2 cấp (thẻ tổng quan từng khu → chi tiết kệ của khu đang chọn, tự bám theo hoạt động hoặc ghim), bảng gán tự động sinh cột theo số cửa hàng (cuộn ngang, cột SKU ghim trái), dải SKU gộp chip khi lô lớn, bảng đèn nhóm theo khu.

## Hành trình lô hàng (Batch Pipeline)

User flow được dẫn bằng **pipeline 5 bước sống theo trạng thái thật** — hiển thị trên mọi màn thuộc quy trình và dashboard:

```
① Nhận dữ liệu → ② Duyệt & chốt kế hoạch → ③ Chuẩn bị ca → ④ Ca chạy → ⑤ Biên bản & báo cáo
```

- Bước chưa đủ điều kiện bị **khóa kèm lý do** (vd: chưa nhận dữ liệu thì khu duyệt gán mờ + nút chốt khóa; chưa chốt kế hoạch thì màn vận hành khóa)
- Luôn có đúng **một nút "Tiếp theo"** chỉ việc cần làm
- Tổng Quản Lý vào giám sát được bỏ qua gate (mô phỏng việc Vận Hành đã làm các bước trước)

## Giao diện

Theme **control-room tối** (graphite + amber — màu đèn LED của sản phẩm), bộ icon SVG thống nhất, type scale 6 cỡ chữ:

- **Màn Giám sát vận hành** bố cục control-room không cuộn: thanh trạng thái ca (chỉ số gọn + tiến độ + dải SKU) ghim trên · trái = sơ đồ kho chủ đạo · phải = trạm quét, sự cố, nhật ký
- **Màn hình trạm** — persona nhân viên: chữ to, một hành động (quét → đèn → chạm xác nhận), bật bằng nút "Màn hình trạm"
- **Demo bar** đáy màn — gom toàn bộ điều khiển mô phỏng (tốc độ, quy mô kho, quét nhanh), tách hẳn khỏi UI sản phẩm

## Tech

Single-file HTML — không có dependency ngoài. Fonts từ Google Fonts (IBM Plex Mono, IBM Plex Sans Thai).
