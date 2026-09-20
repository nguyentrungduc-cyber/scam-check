/**
 * LOGIC KIỂM TRA NHANH (Quickcheck)
 * ============================================
 * File này xử lý:
 *   1. Lấy text người dùng dán vào #quickcheck-input
 *   2. Quét text, so khớp với WARNING_KEYWORDS
 *   3. Tính tổng severity của các từ khóa tìm thấy
 *   4. So với QUICKCHECK_THRESHOLDS, hiển thị kết quả (xanh/vàng/đỏ)
 *
 * Phụ thuộc:
 *   - js/data/warning-keywords.js (phải load TRƯỚC file này)
 *   - js/checklist.js (dùng chung getRiskLevel(), renderResultBox())
 */

// ---- BƯỚC 1: Quét text tìm từ khóa khớp ----
function scanTextForKeywords(text) {
    const normalized = text.toLowerCase();

    return WARNING_KEYWORDS.filter((item) =>
        normalized.includes(item.keyword.toLowerCase())
    );
}

// ---- BƯỚC 2: Tính tổng điểm rủi ro ----
function calculateQuickcheckScore(foundKeywords) {
    return foundKeywords.reduce((sum, item) => sum + item.severity, 0);
}

// ---- BƯỚC 3: Hiển thị kết quả ----
// Dùng chung renderResultBox() đã định nghĩa trong checklist.js
function renderQuickcheckResult(score, level, foundKeywords) {
    const reasons = foundKeywords.map(k => ({
        text: `"${k.keyword}"`,
        note: k.note
    }));
    renderResultBox("quickcheck-result", score, level, reasons);
}

// ---- Gắn sự kiện ----
document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("btn-quickcheck-submit");
    const input = document.getElementById("quickcheck-input");

    if (btn && input) {
        btn.addEventListener("click", () => {
            const text = input.value;

            if (!text.trim()) {
                input.focus();
                input.placeholder = "⚠️ Vui lòng dán nội dung cần kiểm tra trước khi bấm Kiểm tra";
                return;
            }

            const foundKeywords = scanTextForKeywords(text);
            const score = calculateQuickcheckScore(foundKeywords);
            const level = getRiskLevel(score, QUICKCHECK_THRESHOLDS);

            renderQuickcheckResult(score, level, foundKeywords);
        });
    }
});
