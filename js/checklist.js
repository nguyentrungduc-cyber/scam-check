/**
 * LOGIC CHECKLIST
 * ============================================
 * File này xử lý:
 *   1. Render các câu hỏi từ CHECKLIST_QUESTIONS vào #checklist-questions
 *   2. Lắng nghe sự kiện submit form
 *   3. Tính tổng điểm dựa trên câu trả lời + trọng số
 *   4. So với CHECKLIST_THRESHOLDS, hiển thị kết quả (xanh/vàng/đỏ)
 *
 * Phụ thuộc: js/data/checklist-questions.js (phải load TRƯỚC file này)
 */

// ---- BƯỚC 1: Render câu hỏi ----
function renderChecklistQuestions() {
    // TODO: người viết logic
    // - Lấy #checklist-questions
    // - Duyệt qua CHECKLIST_QUESTIONS, với mỗi câu tạo 1 khối HTML:
    //     <div class="question-item">
    //       <p class="question-text">{text}</p>
    //       <div class="question-options">
    //         <label><input type="radio" name="{id}" value="yes"> Có</label>
    //         <label><input type="radio" name="{id}" value="no"> Không</label>
    //       </div>
    //     </div>
    // - Nhớ xóa placeholder-note trước khi render
}

// ---- BƯỚC 2: Tính điểm khi submit ----
function calculateChecklistScore(formData) {
    // TODO: người viết logic
    // - Duyệt qua CHECKLIST_QUESTIONS
    // - Với mỗi câu, nếu formData trả lời "yes" → cộng weight vào tổng
    // - Trả về { totalScore, triggeredQuestions: [...câu đã chọn Có...] }
    return {
        totalScore: 0,
        triggeredQuestions: []
    };
}

// ---- BƯỚC 3: Xác định mức độ (xanh/vàng/đỏ) ----
function getRiskLevel(score, thresholds) {
    // TODO: người viết logic
    // So score với thresholds.warning và thresholds.danger
    // Trả về 'safe' | 'warning' | 'danger'
    if (score >= thresholds.danger) return "danger";
    if (score >= thresholds.warning) return "warning";
    return "safe";
}

// ---- BƯỚC 4: Hiển thị kết quả ----
function renderChecklistResult(score, level, triggeredQuestions) {
    // TODO: người viết logic (có thể tái dùng chung hàm với quickcheck.js
    // nếu cấu trúc kết quả giống nhau — xem #result-template trong index.html)
    // - Lấy #checklist-result
    // - Set class result-{level}, điền điểm, lý do, lời khuyên
    // - Gỡ class "hidden"
}

// ---- Gắn sự kiện ----
document.addEventListener("DOMContentLoaded", () => {
    renderChecklistQuestions();

    const form = document.getElementById("checklist-form");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            // TODO: lấy dữ liệu form, gọi calculateChecklistScore(),
            // getRiskLevel(), renderChecklistResult()
        });
    }
});
