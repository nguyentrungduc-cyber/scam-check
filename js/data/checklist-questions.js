/**
 * DỮ LIỆU CÂU HỎI CHECKLIST
 * ============================================
 * Mỗi câu hỏi có "trọng số" ẩn — câu càng nghiêm trọng thì weight càng cao.
 * Người dùng trả lời Có/Không, nếu chọn "Có" thì cộng weight vào tổng điểm.
 *
 * Cách chỉnh sửa: chỉ cần thêm/sửa/xóa object trong mảng CHECKLIST_QUESTIONS
 * bên dưới — không cần đụng vào file logic (checklist.js).
 *
 * Thang điểm:
 *   weight 1-2  = dấu hiệu nhẹ, đơn lẻ chưa đáng ngại (thường gặp trong giao dịch bình thường)
 *   weight 3-4  = dấu hiệu trung bình, cần cẩn trọng, nên xác minh thêm
 *   weight 5+   = dấu hiệu nghiêm trọng — không tổ chức/cá nhân hợp pháp nào làm việc này
 *
 * 10 câu hỏi bao quát các nhóm lừa đảo phổ biến tại Việt Nam:
 * tuyển dụng, đầu tư/tài chính, giả danh cơ quan chức năng,
 * mạo danh người quen, trúng thưởng, tình cảm qua mạng.
 */

const CHECKLIST_QUESTIONS = [
    {
        id: "q1",
        text: "Đối phương yêu cầu bạn cung cấp mã OTP, mật khẩu, hoặc mã xác thực ngân hàng?",
        weight: 5
        // Nghiêm trọng nhất: không ngân hàng/tổ chức hợp pháp nào cần OTP của bạn
        // để "xử lý", "hoàn tiền" hay "xác minh tài khoản"
    },
    {
        id: "q2",
        text: "Bạn được yêu cầu chuyển tiền, đặt cọc, hoặc đóng phí trước khi nhận việc/hàng/thưởng?",
        weight: 5
        // Mẫu số chung của gần như mọi hình thức lừa đảo: luôn có bước
        // "nộp tiền trước" dưới danh nghĩa phí hồ sơ, phí bảo hiểm, tiền cọc...
    },
    {
        id: "q3",
        text: "Người liên hệ tự xưng là công an, viện kiểm sát, tòa án hoặc nhân viên ngân hàng qua điện thoại/Zalo?",
        weight: 5
        // Cơ quan nhà nước và ngân hàng thật không làm việc, điều tra hay
        // yêu cầu chuyển tiền qua điện thoại/mạng xã hội
    },
    {
        id: "q4",
        text: "Bạn bị hối thúc phải quyết định hoặc chuyển tiền ngay lập tức, không có thời gian suy nghĩ?",
        weight: 4
        // Tạo áp lực thời gian là chiến thuật tâm lý cốt lõi để nạn nhân
        // không kịp kiểm chứng thông tin
    },
    {
        id: "q5",
        text: "Được yêu cầu tải ứng dụng lạ hoặc truy cập đường link rút gọn/không rõ nguồn gốc?",
        weight: 4
        // App giả mạo hoặc link chứa mã độc để chiếm quyền điều khiển
        // điện thoại, đánh cắp thông tin
    },
    {
        id: "q6",
        text: "Lời mời/thông báo có lợi ích bất thường (lương rất cao cho việc nhẹ, lãi suất đầu tư vượt xa thị trường, trúng thưởng lớn dù không tham gia)?",
        weight: 4
        // "Ngon" hơn bình thường quá nhiều luôn là dấu hiệu cảnh báo —
        // không có lợi ích nào miễn phí hoặc bất tương xứng với rủi ro
    },
    {
        id: "q7",
        text: "Liên hệ qua Zalo/Telegram/Facebook cá nhân, không qua kênh chính thức (email công ty, tổng đài, website chính thức)?",
        weight: 3
    },
    {
        id: "q8",
        text: "Bạn không tìm thấy thông tin xác thực về công ty/tổ chức/người này trên các kênh chính thống (website, MST, đánh giá công khai)?",
        weight: 3
    },
    {
        id: "q9",
        text: "Người quen/bạn bè nhắn tin vay tiền hoặc nhờ chuyển khoản gấp nhưng cách xưng hô, văn phong khác lạ?",
        weight: 4
        // Dấu hiệu tài khoản mạng xã hội bị hack/giả mạo — luôn gọi điện
        // xác nhận trực tiếp trước khi chuyển tiền
    },
    {
        id: "q10",
        text: "Mối quan hệ hình thành online (chưa từng gặp mặt) rồi bất ngờ có lý do cần bạn gửi tiền/mua thẻ cào/đầu tư hộ?",
        weight: 4
        // Mô hình lừa đảo tình cảm (romance scam) — xây dựng lòng tin
        // trong thời gian dài rồi lợi dụng để trục lợi tài chính
    },
];

/**
 * NGƯỠNG KẾT LUẬN
 * ============================================
 * Tổng điểm tối đa có thể đạt: 5+5+5+4+4+4+3+3+4+4 = 41 điểm
 * Ngưỡng được chia theo tỷ lệ trên tổng điểm tối đa, có thể tinh chỉnh
 * lại sau khi test thử với nhiều tình huống thật.
 */
const CHECKLIST_THRESHOLDS = {
    safe: 0,      // 0 - 6 điểm: chưa phát hiện dấu hiệu đáng ngại rõ ràng
    warning: 7,   // 7 - 14 điểm: có dấu hiệu cần cẩn trọng, nên xác minh thêm
    danger: 15    // từ 15 điểm trở lên: rủi ro cao, khả năng lừa đảo rất lớn
};
