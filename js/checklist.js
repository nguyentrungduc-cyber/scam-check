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
    const container = document.getElementById("checklist-questions");
    if (!container) return;

    container.innerHTML = "";

    CHECKLIST_QUESTIONS.forEach((q, index) => {
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
function calculateChecklistScore(formData) {
    let totalScore = 0;
    const triggeredQuestions = [];

    CHECKLIST_QUESTIONS.forEach((q) => {
        if (formData.get(q.id) === "yes") {
            totalScore += q.weight;
            triggeredQuestions.push(q);
        }
    });

    return { totalScore, triggeredQuestions };
}

// ---- BƯỚC 3: Xác định mức độ (xanh/vàng/đỏ) ----
// Hàm dùng chung cho cả checklist.js và quickcheck.js
function getRiskLevel(score, thresholds) {
    if (score >= thresholds.danger) return "danger";
    if (score >= thresholds.warning) return "warning";
    return "safe";
}

// Nhãn + lời khuyên tương ứng từng mức độ — dùng chung 2 chức năng
const RISK_LEVEL_INFO = {
    safe: {
        title: "✅ An toàn",
        advice: "Chưa phát hiện dấu hiệu lừa đảo rõ ràng. Tuy vậy vẫn nên cẩn trọng với các giao dịch tài chính và không chia sẻ thông tin cá nhân/OTP cho bất kỳ ai."
    },
    warning: {
        title: "⚠️ Cẩn thận",
        advice: "Có một số dấu hiệu đáng ngờ. Hãy xác minh lại thông tin qua kênh chính thức (gọi trực tiếp, kiểm tra website công ty) trước khi thực hiện bất kỳ giao dịch nào."
    },
    danger: {
        title: "🚨 Rủi ro cao",
        advice: "Tình huống này có nhiều dấu hiệu lừa đảo nghiêm trọng. KHÔNG chuyển tiền, KHÔNG cung cấp OTP/mật khẩu, và nên báo cáo/chặn liên hệ này ngay."
    }
};

// ---- BƯỚC 4: Hiển thị kết quả ----
// reasons: mảng các { text, note } — text là câu hỏi/từ khóa, note là giải thích (có thể để trống)
function renderResultBox(containerId, score, level, reasons) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const info = RISK_LEVEL_INFO[level];

    const reasonsHtml = reasons.length > 0
        ? reasons.map(r => `<li>${r.text}${r.note ? ` — <em>${r.note}</em>` : ""}</li>`).join("")
        : "<li>Không có dấu hiệu nào được ghi nhận.</li>";

    container.innerHTML = `
        <div class="result-card result-${level}">
            <h3 class="result-title">${info.title}</h3>
            <p class="result-score">Điểm rủi ro: <span class="score-value">${score}</span></p>
            <ul class="result-reasons">${reasonsHtml}</ul>
            <p class="result-advice">${info.advice}</p>
            <a href="pages/dau-hieu-lua-dao.html" class="link-more">
                Xem đầy đủ các dấu hiệu lừa đảo phổ biến →
            </a>
        </div>
    `;

    container.classList.remove("hidden");
    if (typeof container.scrollIntoView === "function") {
        container.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
}

function renderChecklistResult(score, level, triggeredQuestions) {
    const reasons = triggeredQuestions.map(q => ({ text: q.text }));
    renderResultBox("checklist-result", score, level, reasons);
}

// ---- Gắn sự kiện ----
document.addEventListener("DOMContentLoaded", () => {
    renderChecklistQuestions();

    const form = document.getElementById("checklist-form");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const { totalScore, triggeredQuestions } = calculateChecklistScore(formData);
            const level = getRiskLevel(totalScore, CHECKLIST_THRESHOLDS);

            renderChecklistResult(totalScore, level, triggeredQuestions);
        });
    }
});
