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

**React + Fluent UI React** (component chính chủ Microsoft, theme Windows 11 dark) chạy trong Electron; build bằng Vite. Logic nghiệp vụ (phiên làm việc, scanner, WebSocket đèn) là JS thuần trong `src/renderer/core/` — không phụ thuộc React, tách bạch khỏi giao diện.

Ảnh màn hình: [docs/screenshots/](docs/screenshots/).

## Bố cục dự án

```
pick-to-light/
├── src/
│   ├── main/main.js        # Electron main: cửa sổ, single-instance, electron-log
│   ├── renderer/           # giao diện React + Fluent UI (build bằng Vite)
│   │   ├── index.html      # entry Vite + CSP
│   │   ├── main.jsx        # mount React, khởi động scanner + hardware
│   │   ├── App.jsx         # shell: header TabList, sidenav, điều phối màn hình
│   │   ├── custom.css      # style cho phần đặc thù: bảng LED, step track, sơ đồ kho
│   │   ├── core/           # LOGIC (JS thuần): data, store, session, scanner, hardware
│   │   └── screens/        # 7 màn hình: TiepNhan, KeHoach, DieuChinh, PhanCong,
│   │                       #             VanHanh (bảng LED), BaoCao, SoDoKho
│   └── legacy/             # bản vanilla cũ (chạy thẳng trên trình duyệt, cho GitHub Pages)
├── build/icon.ico          # icon app cho Windows
├── index.html              # stub redirect cho GitHub Pages → src/legacy/
├── tools/barcodes.html     # trang in mã vạch thẻ nhân viên + tem thùng SKU
├── hardware/
│   ├── DemoBridge/         # bridge C# (.NET 4.8): WebSocket localhost ↔ controller đèn
│   └── LsSample1a/         # sample WinForms của Aioi Systems (tham khảo SDK)
└── docs/                   # PRD, user flow, changelog, screenshots
```

## Dev & phát hành

| Lệnh | Tác dụng |
|---|---|
| `npm start` | Build UI (Vite) rồi mở app Electron |
| `npm run dev` | Vite dev server (xem UI trong trình duyệt, hot-reload) |
| `npm run pack` | Build thư mục app chưa đóng gói (kiểm tra nhanh) vào `dist/win-unpacked` |
| `npm run dist` | Đóng gói **installer NSIS** (`PutToLight-Setup-x.y.z.exe`) + bản **portable** |

Log runtime ghi tại `%APPDATA%/put-to-light/logs/main.log` (electron-log).

Test scanner không cần máy quét: mở DevTools, gõ `window.__scan('NV-2207')` (thẻ nhân viên) hoặc `window.__scan('ATN01-WHT-L')` (tem thùng).

Chưa thiết lập (cần khi phát hành rộng): ký số exe (code signing — tránh cảnh báo SmartScreen), auto-update (electron-updater + GitHub Releases).

