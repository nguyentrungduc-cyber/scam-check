/**
 * DỮ LIỆU TỪ KHÓA CẢNH BÁO — dùng cho chức năng "Kiểm tra nhanh"
 * ============================================
 * Mỗi từ khóa/cụm từ có "mức độ nghiêm trọng" (severity) riêng.
 * quickcheck.js sẽ quét text người dùng dán vào, so khớp (không phân biệt
 * hoa thường) với danh sách này.
 *
 * Cách chỉnh sửa: thêm/sửa/xóa object trong mảng WARNING_KEYWORDS.
 * Không cần sửa logic quét — chỉ cần thêm dữ liệu ở đây.
 *
 * Được nhóm theo 6 nhóm lừa đảo phổ biến để dễ bổ sung/rà soát:
 *   1. Xác thực/bảo mật tài khoản (OTP, mật khẩu...)
 *   2. Tài chính — yêu cầu chuyển tiền trước
 *   3. Tuyển dụng / việc làm
 *   4. Giả danh cơ quan chức năng / ngân hàng
 *   5. Đầu tư / trúng thưởng bất thường
 *   6. Tạo áp lực tâm lý / thúc ép
 */

const WARNING_KEYWORDS = [

    // ==== NHÓM 1: Xác thực / bảo mật tài khoản ====
    { keyword: "mã otp", severity: 5, note: "Không tổ chức hợp pháp nào yêu cầu bạn cung cấp mã OTP qua điện thoại/tin nhắn" },
    { keyword: "otp", severity: 5, note: "Cẩn trọng khi được yêu cầu đọc mã OTP cho người khác" },
    { keyword: "mật khẩu", severity: 5, note: "Không ai có quyền yêu cầu bạn cung cấp mật khẩu tài khoản" },
    { keyword: "mã pin", severity: 5, note: "Mã PIN thẻ ngân hàng tuyệt đối không được chia sẻ" },
    { keyword: "cccd", severity: 3, note: "Cẩn trọng khi được yêu cầu chụp/gửi ảnh CCCD cho người lạ" },
    { keyword: "căn cước công dân", severity: 3, note: "Cẩn trọng khi được yêu cầu chụp/gửi ảnh CCCD cho người lạ" },
    { keyword: "mã xác thực", severity: 4, note: "Mã xác thực chỉ dùng để bạn tự đăng nhập, không chia sẻ cho ai" },

    // ==== NHÓM 2: Tài chính — yêu cầu chuyển tiền trước ====
    { keyword: "chuyển khoản trước", severity: 5, note: "Dấu hiệu điển hình của lừa đảo việc làm/trúng thưởng" },
    { keyword: "đặt cọc", severity: 4, note: "Cẩn trọng với yêu cầu đặt cọc trước khi nhận việc/hàng" },
    { keyword: "phí hồ sơ", severity: 4, note: "Tuyển dụng hợp pháp không thu phí xin việc" },
    { keyword: "phí bảo hiểm", severity: 3, note: "Cẩn trọng với yêu cầu đóng phí bảo hiểm bất thường trước khi nhận tiền/hàng" },
    { keyword: "nộp tiền trước", severity: 5, note: "Mẫu số chung của hầu hết hình thức lừa đảo" },
    { keyword: "phí giải ngân", severity: 5, note: "Vay tiền hợp pháp không thu phí trước khi giải ngân" },
    { keyword: "thẻ cào", severity: 4, note: "Yêu cầu mua thẻ cào điện thoại để 'xác minh' hoặc 'đóng phí' là dấu hiệu lừa đảo rất phổ biến" },
    { keyword: "chuyển khoản gấp", severity: 4, note: "Xác nhận trực tiếp qua điện thoại trước khi chuyển tiền" },

    // ==== NHÓM 3: Tuyển dụng / việc làm ====
    { keyword: "việc nhẹ lương cao", severity: 4, note: "Cụm từ quảng cáo phổ biến trong các bài tuyển dụng lừa đảo" },
    { keyword: "làm tại nhà thu nhập cao", severity: 3, note: "Cẩn trọng với quảng cáo việc làm hứa hẹn thu nhập bất tương xứng" },
    { keyword: "không cần kinh nghiệm lương cao", severity: 3, note: "Cẩn trọng với tin tuyển dụng có lợi ích bất thường so với yêu cầu công việc" },
    { keyword: "tuyển cộng tác viên", severity: 2, note: "Nhiều mô hình lừa đảo núp bóng tuyển CTV bán hàng/marketing online" },
    { keyword: "nhận việc ngay không phỏng vấn", severity: 3, note: "Quy trình tuyển dụng bỏ qua phỏng vấn/xác minh là dấu hiệu bất thường" },

    // ==== NHÓM 4: Giả danh cơ quan chức năng / ngân hàng ====
    { keyword: "công an", severity: 4, note: "Cơ quan công an thật không làm việc/xử phạt qua điện thoại/Zalo" },
    { keyword: "viện kiểm sát", severity: 4, note: "Viện kiểm sát không thông báo/điều tra qua điện thoại hoặc mạng xã hội" },
    { keyword: "tòa án", severity: 4, note: "Tòa án làm việc bằng văn bản chính thức, không qua điện thoại/Zalo" },
    { keyword: "lệnh bắt", severity: 5, note: "Đe dọa bằng 'lệnh bắt' qua điện thoại là chiêu thức lừa đảo phổ biến" },
    { keyword: "tài khoản liên quan đến đường dây", severity: 5, note: "Chiêu thức đe dọa cổ điển để nạn nhân hoảng sợ làm theo yêu cầu" },
    { keyword: "nhân viên ngân hàng", severity: 3, note: "Ngân hàng thật không yêu cầu thông tin bảo mật qua điện thoại" },
    { keyword: "khóa tài khoản", severity: 3, note: "Cẩn trọng với thông báo khẩn cấp về khóa tài khoản kèm yêu cầu bấm link" },

    // ==== NHÓM 5: Đầu tư / trúng thưởng bất thường ====
    { keyword: "trúng thưởng", severity: 3, note: "Cẩn trọng với thông báo trúng thưởng không rõ nguồn gốc" },
    { keyword: "lãi suất cao", severity: 3, note: "Lãi suất đầu tư vượt xa mức thị trường là dấu hiệu cảnh báo mô hình Ponzi" },
    { keyword: "đầu tư sinh lời nhanh", severity: 4, note: "Cam kết lợi nhuận nhanh và chắc chắn không tồn tại trong đầu tư hợp pháp" },
    { keyword: "nhân đôi số tiền", severity: 5, note: "Cam kết nhân đôi/nhân ba tiền trong thời gian ngắn là dấu hiệu lừa đảo rõ ràng" },
    { keyword: "không rủi ro", severity: 3, note: "Không có hình thức đầu tư nào 'không rủi ro' tuyệt đối" },
    { keyword: "quà tặng miễn phí", severity: 2, note: "Cẩn trọng với quà tặng yêu cầu cung cấp thông tin cá nhân/thanh toán phí ship" },

    // ==== NHÓM 6: Tạo áp lực tâm lý / thúc ép ====
    { keyword: "gấp", severity: 2, note: "Tạo cảm giác gấp gáp là chiến thuật tâm lý thường gặp" },
    { keyword: "ngay lập tức", severity: 2, note: "Yêu cầu hành động ngay không cho thời gian suy nghĩ/xác minh" },
    { keyword: "trong vòng 30 phút", severity: 3, note: "Giới hạn thời gian ngắn bất thường để ép quyết định vội vàng" },
    { keyword: "bảo mật thông tin không được nói với ai", severity: 4, note: "Yêu cầu giữ bí mật với người thân là dấu hiệu cô lập nạn nhân điển hình" },
    { keyword: "link rút gọn", severity: 3, note: "Link rút gọn có thể che giấu địa chỉ web độc hại" },
    { keyword: "bit.ly", severity: 2, note: "Cẩn trọng khi bấm vào link rút gọn từ người lạ" },
    { keyword: "cài đặt ứng dụng", severity: 3, note: "Cẩn trọng với yêu cầu tải app ngoài Google Play/App Store chính thức" },
];

/**
 * NGƯỠNG KẾT LUẬN CHO QUICKCHECK
 * ============================================
 * Tổng severity của các từ khóa tìm thấy sẽ so với các ngưỡng dưới đây.
 * Vì 1 đoạn text thường chỉ trúng vài từ khóa (không phải tất cả),
 * ngưỡng được đặt thấp hơn nhiều so với tổng cộng dồn tối đa.
 */
const QUICKCHECK_THRESHOLDS = {
    safe: 0,      // 0 - 3 điểm: chưa phát hiện dấu hiệu đáng ngại rõ ràng
    warning: 4,   // 4 - 7 điểm: có một vài dấu hiệu, nên cẩn trọng
    danger: 8     // từ 8 điểm trở lên: nhiều dấu hiệu trùng khớp, rủi ro cao
};
