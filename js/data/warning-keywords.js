/**
 * DỮ LIỆU TỪ KHÓA CẢNH BÁO — dùng cho chức năng "Kiểm tra nhanh"
 * ============================================
 * Mỗi từ khóa/cụm từ có "mức độ nghiêm trọng" (severity) riêng.
 * quickcheck.js sẽ quét text người dùng dán vào, so khớp (không phân biệt
 * hoa thường, không phân biệt dấu — tùy độ khó khi code) với danh sách này.
 *
 * Cách chỉnh sửa: thêm/sửa/xóa object trong mảng WARNING_KEYWORDS.
 * Không cần sửa logic quét — chỉ cần thêm dữ liệu ở đây.
 */

const WARNING_KEYWORDS = [
    // ---- VÍ DỤ MẪU — tổ bổ sung thêm theo nội dung đã soạn ----
    {
        keyword: "mã OTP",
        severity: 5,
        note: "Không tổ chức hợp pháp nào yêu cầu bạn cung cấp mã OTP"
    },
    {
        keyword: "chuyển khoản trước",
        severity: 5,
        note: "Dấu hiệu điển hình của lừa đảo việc làm/trúng thưởng"
    },
    {
        keyword: "đặt cọc",
        severity: 4,
        note: "Cẩn trọng với yêu cầu đặt cọc trước khi nhận việc/hàng"
    },
    {
        keyword: "việc nhẹ lương cao",
        severity: 4,
        note: "Cụm từ quảng cáo phổ biến trong các bài tuyển dụng lừa đảo"
    },
    {
        keyword: "link rút gọn",
        severity: 3,
        note: "Link rút gọn có thể che giấu địa chỉ web độc hại"
    },
    {
        keyword: "gấp",
        severity: 2,
        note: "Tạo cảm giác gấp gáp là chiến thuật tâm lý thường gặp"
    },
    {
        keyword: "công an",
        severity: 3,
        note: "Cơ quan công an thật không làm việc/xử phạt qua điện thoại/Zalo"
    },
    {
        keyword: "trúng thưởng",
        severity: 3,
        note: "Cẩn trọng với thông báo trúng thưởng không rõ nguồn gốc"
    },
    // TODO: tổ bổ sung từ khóa từ nội dung đã soạn (email lừa đảo, tin tuyển dụng mẫu...)
];

/**
 * NGƯỠNG KẾT LUẬN CHO QUICKCHECK
 * ============================================
 * Tổng severity của các từ khóa tìm thấy sẽ so với các ngưỡng dưới đây.
 */
const QUICKCHECK_THRESHOLDS = {
    safe: 0,
    warning: 4,
    danger: 8
};
