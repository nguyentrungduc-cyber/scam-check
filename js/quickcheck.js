/**
 * LOGIC KIỂM TRA NHANH (Quickcheck)
 * ============================================
 * File này xử lý:
 *   1. Lấy text người dùng dán vào #quickcheck-input
 *   2. Quét text, so khớp với WARNING_KEYWORDS
 *   3. Tính tổng severity của các từ khóa tìm thấy
 *   4. So với QUICKCHECK_THRESHOLDS, hiển thị kết quả (xanh/vàng/đỏ)
 *
 * Phụ thuộc: js/data/warning-keywords.js (phải load TRƯỚC file này)
 */

// ---- BƯỚC 1: Quét text tìm từ khóa khớp ----
function scanTextForKeywords(text) {
    // TODO: người viết logic
    // - Chuẩn hóa text: lowercase, có thể bỏ dấu tiếng Việt để so khớp
    //   linh hoạt hơn (tùy độ khó muốn làm)
    // - Duyệt WARNING_KEYWORDS, kiểm tra text.includes(keyword) (đã chuẩn hóa)
    // - Trả về mảng các từ khóa tìm thấy: [{ keyword, severity, note }, ...]
    return [];
}

// ---- BƯỚC 2: Tính tổng điểm rủi ro ----
function calculateQuickcheckScore(foundKeywords) {
    // TODO: người viết logic
    // Cộng severity của tất cả từ khóa tìm thấy trong foundKeywords
    return 0;
}

// ---- BƯỚC 3: Hiển thị kết quả ----
function renderQuickcheckResult(score, level, foundKeywords) {
    // TODO: người viết logic (có thể tái dùng chung với checklist.js
    // nếu cấu trúc kết quả giống nhau)
    // - Lấy #quickcheck-result
    // - Set class result-{level}, điền điểm, liệt kê từ khóa tìm thấy + note
    // - Gỡ class "hidden"
}

// ---- Gắn sự kiện ----
document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("btn-quickcheck-submit");
    if (btn) {
        btn.addEventListener("click", () => {
            const text = document.getElementById("quickcheck-input").value;

            if (!text.trim()) {
                // TODO: có thể hiện thông báo nhắc nhập nội dung
                return;
            }

            // TODO: gọi scanTextForKeywords(text), calculateQuickcheckScore(),
            // getRiskLevel() (dùng chung hàm trong checklist.js hoặc tách riêng
            // ra utils.js nếu muốn), renderQuickcheckResult()
        });
    }
});
