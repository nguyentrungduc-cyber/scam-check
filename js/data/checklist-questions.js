/**
 * DỮ LIỆU CÂU HỎI CHECKLIST
 * ============================================
 * Mỗi câu hỏi có "trọng số" ẩn — câu càng nghiêm trọng thì weight càng cao.
 * Người dùng trả lời Có/Không, nếu chọn "Có" thì cộng weight vào tổng điểm.
 *
 * Cách chỉnh sửa: chỉ cần thêm/sửa/xóa object trong mảng CHECKLIST_QUESTIONS
 * bên dưới — không cần đụng vào file logic (checklist.js).
 *
 * Gợi ý thang điểm (bàn lại với tổ khi có đủ câu hỏi thật):
 *   weight 1-2  = dấu hiệu nhẹ, đơn lẻ chưa đáng ngại
 *   weight 3-4  = dấu hiệu trung bình, cần cẩn trọng
 *   weight 5+   = dấu hiệu nghiêm trọng, gần như chắc chắn lừa đảo
 */

const CHECKLIST_QUESTIONS = [
    // ---- VÍ DỤ MẪU — sửa/xóa/thêm tùy nội dung tổ thống nhất ----
    {
        id: "q1",
        text: "Đối phương yêu cầu bạn cung cấp mã OTP hoặc mật khẩu?",
        weight: 5
    },
    {
        id: "q2",
        text: "Bạn được yêu cầu chuyển tiền/đặt cọc trước khi nhận việc hoặc nhận thưởng?",
        weight: 5
    },
    {
        id: "q3",
        text: "Lời mời chỉ liên hệ qua Zalo/Telegram cá nhân, không qua kênh chính thức của công ty?",
        weight: 3
    },
    {
        id: "q4",
        text: "Công việc/lợi ích được mô tả là 'nhẹ nhàng, lương cao bất thường'?",
        weight: 3
    },
    {
        id: "q5",
        text: "Đối phương tạo cảm giác gấp gáp, thúc ép bạn quyết định ngay?",
        weight: 4
    },
    {
        id: "q6",
        text: "Bạn không tìm thấy thông tin công ty/tổ chức này trên các kênh chính thống?",
        weight: 3
    },
    {
        id: "q7",
        text: "Được yêu cầu tải app lạ hoặc truy cập link rút gọn không rõ nguồn gốc?",
        weight: 4
    },
    {
        id: "q8",
        text: "Người liên hệ tự xưng là công an/ngân hàng/cơ quan nhà nước qua điện thoại?",
        weight: 4
    },
    // TODO: tổ bổ sung thêm câu hỏi tại đây (8-10 câu theo yêu cầu ban đầu)
];

/**
 * NGƯỠNG KẾT LUẬN
 * ============================================
 * Tổng điểm sau khi cộng các câu "Có" sẽ so với các ngưỡng dưới đây.
 * Cần tinh chỉnh lại sau khi có đủ câu hỏi thật và test thử.
 */
const CHECKLIST_THRESHOLDS = {
    safe: 0,      // tổng điểm từ 0 đến dưới ngưỡng warning → "an toàn"
    warning: 5,   // tổng điểm từ đây đến dưới ngưỡng danger → "cẩn thận"
    danger: 10    // tổng điểm từ đây trở lên → "rủi ro cao"
};
