/**
 * LOGIC CHECKLIST — BẢO VỆ DỮ LIỆU CÁ NHÂN
 * ============================================
 * Tái sử dụng getRiskLevel(), RISK_LEVEL_INFO, renderResultBox() đã có
 * trong checklist.js — file này CHỈ xử lý phần riêng của checklist bảo
 * vệ dữ liệu: hiển thị nhãn Đã làm/Chưa làm đúng ngữ nghĩa từng câu,
 * và tính điểm có xử lý các câu hỏi ngược chiều (PRIVACY_REVERSED_QUESTIONS).
 *
 * Phụ thuộc (phải load TRƯỚC file này):
 *   - js/data/privacy-checklist-questions.js
 *   - js/checklist.js (dùng chung getRiskLevel(), renderResultBox())
 */

// ---- BƯỚC 1: Render câu hỏi ----
// Khác checklist.js gốc: label nút bấm tùy theo câu là thuận hay ngược chiều,
// để người dùng luôn thấy "Có" ứng với hành động thật họ mô tả, không gây
// hiểu lầm dù bên trong logic tính điểm coi "yes" theo nghĩa khác nhau.
function renderPrivacyChecklistQuestions() {
    const container = document.getElementById("privacy-checklist-questions");
    if (!container) return;

    container.innerHTML = "";

    PRIVACY_CHECKLIST_QUESTIONS.forEach((q, index) => {
        const item = document.createElement("div");
        item.className = "question-item";
        item.innerHTML = `
            <p class="question-text">${index + 1}. ${q.text}</p>
            <div class="question-options">
                <label><input type="radio" name="${q.id}" value="yes" required> Có</label>
                <label><input type="radio" name="${q.id}" value="no"> Không</label>
            </div>
        `;
        container.appendChild(item);
    });
}

// ---- BƯỚC 2: Tính điểm khi submit ----
// Với câu THUẬN (đa số): "no" (Không/Chưa làm) mới cộng điểm rủi ro.
// Với câu NGƯỢC (p2, p5, p8 — hỏi về hành vi xấu): "yes" (Có làm) mới cộng điểm.
function calculatePrivacyScore(formData) {
    let totalScore = 0;
    const triggeredQuestions = [];

    PRIVACY_CHECKLIST_QUESTIONS.forEach((q) => {
        const answer = formData.get(q.id);
        const isReversed = PRIVACY_REVERSED_QUESTIONS.includes(q.id);

        // isReversed=true: "yes" là đáng lo (VD: có công khai CCCD)
        // isReversed=false: "no" là đáng lo (VD: chưa bật 2FA)
        const isRisky = isReversed ? (answer === "yes") : (answer === "no");

        if (isRisky) {
            totalScore += q.weight;
            triggeredQuestions.push(q);
        }
    });

    return { totalScore, triggeredQuestions };
}

// ---- BƯỚC 3: Hiển thị kết quả ----
// Dùng lại renderResultBox() từ checklist.js, nhưng trỏ "Xem thêm" tới
// trang hướng dẫn bảo vệ dữ liệu (khác trang dấu hiệu lừa đảo)
function renderPrivacyChecklistResult(score, level, triggeredQuestions) {
    const reasons = triggeredQuestions.map(q => ({ text: q.text }));
    renderResultBox("privacy-checklist-result", score, level, reasons, {
        href: "pages/bao-ve-du-lieu-ca-nhan.html",
        label: "Xem hướng dẫn bảo vệ dữ liệu cá nhân chi tiết →"
    });
}

// ---- Gắn sự kiện ----
document.addEventListener("DOMContentLoaded", () => {
    renderPrivacyChecklistQuestions();

    const form = document.getElementById("privacy-checklist-form");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const { totalScore, triggeredQuestions } = calculatePrivacyScore(formData);
            const level = getRiskLevel(totalScore, PRIVACY_CHECKLIST_THRESHOLDS);

            renderPrivacyChecklistResult(totalScore, level, triggeredQuestions);
        });
    }
});
