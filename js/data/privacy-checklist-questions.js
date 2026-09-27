/**
 * DỮ LIỆU CHECKLIST — BẢO VỆ DỮ LIỆU CÁ NHÂN
 * ============================================
 * Khác với checklist lừa đảo (đánh giá 1 TÌNH HUỐNG cụ thể đang gặp),
 * checklist này đánh giá THÓI QUEN BẢO MẬT hằng ngày của người dùng.
 *
 * Cơ chế NGƯỢC CHIỀU so với checklist lừa đảo:
 *   - Trả lời "Chưa làm" (chưa có thói quen tốt) → CỘNG điểm rủi ro
 *   - Trả lời "Đã làm" (đã có thói quen tốt)     → KHÔNG cộng điểm
 * Vì vậy option value dùng "no"/"yes" giữ nguyên quy ước cũ để tái
 * dùng chung logic renderChecklistQuestions()/calculateChecklistScore(),
 * nhưng ý nghĩa hiển thị cho người dùng là "Đã làm" / "Chưa làm".
 *
 * Mỗi câu có trọng số theo mức độ quan trọng của thói quen đó.
 */

const PRIVACY_CHECKLIST_QUESTIONS = [
    {
        id: "p1",
        text: "Bạn có bật xác thực 2 lớp (2FA) cho email và các tài khoản quan trọng (ngân hàng, mạng xã hội) không?",
        weight: 5
        // 2FA là lớp bảo vệ cuối cùng khi mật khẩu bị lộ — thiếu bước này
        // đồng nghĩa chỉ cần biết mật khẩu là chiếm được tài khoản ngay
    },
    {
        id: "p2",
        text: "Bạn có dùng chung 1 mật khẩu cho nhiều tài khoản không?",
        weight: 5
        // Lưu ý: câu này hỏi theo hướng NGƯỢC — "Có" dùng chung mới là xấu.
        // Xem cách xử lý riêng trong renderPrivacyChecklistQuestions().
    },
    {
        id: "p3",
        text: "Bạn có đổi mật khẩu định kỳ hoặc ngay khi nghi ngờ bị lộ không?",
        weight: 4
    },
    {
        id: "p4",
        text: "Bạn có dùng trình quản lý mật khẩu (password manager) không?",
        weight: 3
    },
    {
        id: "p5",
        text: "Bạn có công khai số điện thoại/CCCD/địa chỉ nhà trên mạng xã hội không?",
        weight: 5
        // Câu hỏi theo hướng NGƯỢC (giống p2) — "Có" công khai mới là xấu
    },
    {
        id: "p6",
        text: "Bạn có đọc kỹ điều khoản/quyền truy cập trước khi cài đặt app lạ không?",
        weight: 4
    },
    {
        id: "p7",
        text: "Bạn có kiểm tra và điều chỉnh quyền riêng tư (privacy settings) trên Facebook/Zalo định kỳ không?",
        weight: 3
    },
    {
        id: "p8",
        text: "Bạn có đăng nhập tài khoản ngân hàng/email quan trọng khi dùng WiFi công cộng không?",
        weight: 4
        // Câu hỏi theo hướng NGƯỢC — "Có" đăng nhập qua WiFi công cộng mới là xấu
    },
    {
        id: "p9",
        text: "Điện thoại/máy tính của bạn có luôn cập nhật phần mềm/hệ điều hành phiên bản mới nhất không?",
        weight: 3
    },
    {
        id: "p10",
        text: "Bạn có tắt các quyền truy cập không cần thiết (định vị, danh bạ, micro...) cho các ứng dụng không thực sự cần dùng không?",
        weight: 3
    },
];

/**
 * DANH SÁCH CÂU HỎI "NGƯỢC CHIỀU"
 * ============================================
 * Với đa số câu, "Đã làm" (yes) = tốt, "Chưa làm" (no) = cộng điểm rủi ro.
 * Nhưng 3 câu p2, p5, p8 hỏi theo kiểu hành vi XẤU — "Có làm điều này"
 * (yes) mới là đáng lo, "Không" (no) mới là tốt.
 * Mảng này liệt kê các id cần đảo ngược logic khi tính điểm.
 */
const PRIVACY_REVERSED_QUESTIONS = ["p2", "p5", "p8"];

/**
 * NGƯỠNG KẾT LUẬN
 * ============================================
 * Tổng điểm tối đa: 5+5+4+3+5+4+3+4+3+3 = 39
 */
const PRIVACY_CHECKLIST_THRESHOLDS = {
    safe: 0,      // 0-6 điểm: hầu hết thói quen tốt đã có
    warning: 7,   // 7-16 điểm: còn thiếu vài thói quen quan trọng
    danger: 17    // từ 17 điểm: thiếu nhiều lớp bảo vệ cơ bản, cần hành động ngay
};
