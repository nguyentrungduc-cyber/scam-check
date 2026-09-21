# Nhận Diện Lừa Đảo — Web Checklist & Kiểm Tra Nhanh

Công cụ web tĩnh giúp người dùng tự đánh giá mức độ rủi ro lừa đảo qua 2 chức năng: checklist câu hỏi có trọng số và quét từ khóa cảnh báo trong tin nhắn/tin tuyển dụng.

Dự án nhóm môn **Kỹ năng nghề nghiệp** — UIT.

## Công nghệ

HTML + CSS + JavaScript thuần — không backend, không database, không gọi AI/API ngoài. Toàn bộ logic chạy trên trình duyệt (client-side).

## Cấu trúc thư mục

```
scam-check/
├── index.html                      # Trang chủ — intro + 2 khối chức năng
├── pages/
│   └── dau-hieu-lua-dao.html       # Trang nội dung tĩnh: dấu hiệu lừa đảo phổ biến
├── css/
│   └── style.css                   # Toàn bộ style — đã định nghĩa sẵn màu xanh/vàng/đỏ
├── js/
│   ├── data/
│   │   ├── checklist-questions.js  # Mảng câu hỏi checklist + trọng số + ngưỡng
│   │   └── warning-keywords.js     # Mảng từ khóa cảnh báo + mức độ + ngưỡng
│   ├── checklist.js                # Logic xử lý checklist (khung sườn, có TODO)
│   ├── quickcheck.js               # Logic quét từ khóa (khung sườn, có TODO)
│   └── main.js                     # Logic UI chung (smooth scroll...)
└── assets/                         # Hình ảnh, icon (nếu cần)
```

## Cách chạy thử

Không cần cài gì cả — mở thẳng `index.html` bằng trình duyệt, hoặc dùng Live Server (VS Code extension) để có auto-reload khi sửa code.

## Deploy

Deploy miễn phí bằng GitHub Pages:
1. Settings → Pages → Source: chọn nhánh `main`, thư mục `/ (root)`
2. Web sẽ có link dạng `https://<username>.github.io/<repo>/`

## Chia việc (2 người kỹ thuật)

### Người viết logic — làm trong `js/`
- Điền dữ liệu thật vào `js/data/checklist-questions.js` (8-10 câu hỏi + trọng số)
- Điền dữ liệu thật vào `js/data/warning-keywords.js` (từ khóa cảnh báo)
- Hoàn thiện các hàm còn `TODO` trong `checklist.js` và `quickcheck.js`
- Test thử các mức ngưỡng (safe/warning/danger) có hợp lý không

### Người làm giao diện — làm trong `css/` + `index.html`
- Tinh chỉnh `css/style.css` theo thiết kế thật (màu sắc, font, spacing)
- Có thể thêm ảnh minh họa vào `assets/`
- Đảm bảo responsive tốt trên điện thoại (đã có sẵn media query mẫu)
- Không cần đụng vào các file `.js` — chỉ cần biết các `id`/`class` mà JS dùng (xem comment trong `index.html`)

### Điểm nối giữa 2 người
- HTML đã có sẵn đầy đủ `id` mà JS sẽ dùng để tìm phần tử (`#checklist-questions`, `#checklist-result`, `#quickcheck-input`, `#quickcheck-result`...) — **không đổi tên các id này** để tránh vỡ code của nhau
- Class kết quả dùng chung: `result-safe` / `result-warning` / `result-danger` — CSS đã định nghĩa màu sẵn cho cả 2 chức năng

## Trạng thái hiện tại

- [x] Cấu trúc file, thư mục
- [x] HTML khung sườn đầy đủ (chưa có nội dung/logic thật)
- [x] CSS layout + màu sắc cơ bản
- [x] Dữ liệu câu hỏi checklist thật (10 câu, 6 nhóm lừa đảo phổ biến)
- [x] Dữ liệu từ khóa cảnh báo thật (40 từ khóa, 6 nhóm)
- [x] Logic tính điểm + hiển thị kết quả (checklist + quickcheck)
- [x] Nội dung trang "Dấu hiệu lừa đảo phổ biến" (9 dấu hiệu chi tiết)
- [x] Phân tích link trong quickcheck: whitelist domain uy tín, phát hiện
      domain giả mạo thương hiệu (typosquatting), TLD đáng ngờ, link rút gọn
- [x] Bộ test tự động (23 test case, xem `tests/run-tests.js`)
- [ ] Deploy GitHub Pages

## Chạy test tự động

Bộ test giả lập tương tác thật trong trình duyệt (jsdom), kiểm tra checklist
và quickcheck với nhiều tình huống mẫu (rủi ro cao / cẩn thận / an toàn / edge case).

```bash
npm install jsdom --no-save    # chỉ cần cài tạm để test, không commit vào repo
node tests/run-tests.js
```

Chạy lại bộ test này mỗi khi sửa dữ liệu (`checklist-questions.js`,
`warning-keywords.js`) hoặc logic (`checklist.js`, `quickcheck.js`) để đảm
bảo không có gì bị vỡ ngoài ý muốn.
