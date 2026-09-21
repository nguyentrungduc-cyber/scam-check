/**
 * BỘ TEST TÌNH HUỐNG MẪU
 * ============================================
 * Test tự động cho logic checklist.js + quickcheck.js bằng cách giả lập
 * một trình duyệt (jsdom) và tương tác thật với index.html.
 *
 * Cách chạy:
 *   1. cd vào thư mục gốc project (chứa index.html)
 *   2. npm install jsdom --no-save     (chỉ cần khi test, không commit vào repo)
 *   3. node tests/run-tests.js
 *
 * Không cần chạy thường xuyên — dùng khi sửa dữ liệu (checklist-questions.js,
 * warning-keywords.js) hoặc logic (checklist.js, quickcheck.js) để đảm bảo
 * không có gì bị vỡ.
 */

const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

function loadPage() {
    const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
    const dom = new JSDOM(html, { runScripts: "dangerously", url: "http://localhost/" });
    const { window } = dom;

    const scripts = [
        "js/data/checklist-questions.js",
        "js/data/warning-keywords.js",
        "js/checklist.js",
        "js/quickcheck.js",
        "js/main.js",
    ];
    scripts.forEach((f) => {
        const scriptEl = window.document.createElement("script");
        scriptEl.textContent = fs.readFileSync(path.join(ROOT, f), "utf8");
        window.document.body.appendChild(scriptEl);
    });

    window.document.dispatchEvent(new window.Event("DOMContentLoaded", { bubbles: true, cancelable: true }));
    return window;
}

let passCount = 0;
let failCount = 0;

function check(label, actual, expected) {
    const pass = actual === expected;
    console.log(`${pass ? "✅ PASS" : "❌ FAIL"} - ${label}`);
    if (!pass) console.log(`         Mong đợi: ${expected} | Thực tế: ${actual}`);
    pass ? passCount++ : failCount++;
}

function answerChecklist(window, answers) {
    // answers: { q1: "yes", q2: "no", ... } — câu nào không có mặc định "no"
    CHECKLIST_QUESTIONS_IDS(window).forEach((id) => {
        const value = answers[id] || "no";
        window.document.querySelector(`input[name=${id}][value=${value}]`).checked = true;
    });
    window.document.getElementById("checklist-form")
        .dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
}

function CHECKLIST_QUESTIONS_IDS(window) {
    return Array.from(window.document.querySelectorAll("#checklist-questions .question-item input[value=yes]"))
        .map((el) => el.name);
}

function runQuickcheck(window, text) {
    window.document.getElementById("quickcheck-input").value = text;
    window.document.getElementById("btn-quickcheck-submit").click();
}

function getResultScore(window, containerId) {
    return window.document.getElementById(containerId).querySelector(".score-value")?.textContent;
}

function getResultTitle(window, containerId) {
    return window.document.getElementById(containerId).querySelector(".result-title")?.textContent;
}

console.log("=".repeat(60));
console.log("BỘ TEST TÌNH HUỐNG MẪU — scam-check");
console.log("=".repeat(60));

// ==============================================================
// NHÓM A: CHECKLIST
// ==============================================================
console.log("\n--- Checklist ---\n");

{
    const window = loadPage();
    check("Render đủ số câu hỏi checklist", window.document.querySelectorAll("#checklist-questions .question-item").length, CHECKLIST_QUESTIONS_IDS(window).length);
}

{
    // Tình huống A1: Rủi ro cao — OTP + chuyển tiền trước + giả danh công an
    const window = loadPage();
    answerChecklist(window, { q1: "yes", q2: "yes", q3: "yes" });
    check("A1: Rủi ro cao (OTP+chuyển tiền+giả danh) — điểm", getResultScore(window, "checklist-result"), "15");
    check("A1: Rủi ro cao (OTP+chuyển tiền+giả danh) — mức độ", getResultTitle(window, "checklist-result"), "🚨 Rủi ro cao");
}

{
    // Tình huống A2: Cẩn thận — kênh không chính thức + không xác minh được + thúc ép
    const window = loadPage();
    answerChecklist(window, { q7: "yes", q8: "yes", q4: "yes" });
    check("A2: Cẩn thận (kênh lạ+ko xác minh+thúc ép) — điểm", getResultScore(window, "checklist-result"), "10");
    check("A2: Cẩn thận (kênh lạ+ko xác minh+thúc ép) — mức độ", getResultTitle(window, "checklist-result"), "⚠️ Cẩn thận");
}

{
    // Tình huống A3: An toàn — không chọn Có câu nào
    const window = loadPage();
    answerChecklist(window, {});
    check("A3: An toàn (không có dấu hiệu nào) — điểm", getResultScore(window, "checklist-result"), "0");
    check("A3: An toàn (không có dấu hiệu nào) — mức độ", getResultTitle(window, "checklist-result"), "✅ An toàn");
}

{
    // Tình huống A4: Biên — gần ngưỡng warning (q7+q8 = 3+3 = 6, dưới ngưỡng 7 nên vẫn An toàn)
    // Test này dùng làm mốc: nếu ai đó sửa trọng số q7/q8 mà không để ý,
    // test sẽ FAIL và nhắc kiểm tra lại ngưỡng CHECKLIST_THRESHOLDS.
    const window = loadPage();
    answerChecklist(window, { q7: "yes", q8: "yes" });
    check("A4: Biên gần ngưỡng (q7+q8=6, dưới warning=7) — điểm", getResultScore(window, "checklist-result"), "6");
    check("A4: Biên gần ngưỡng (q7+q8=6, dưới warning=7) — mức độ", getResultTitle(window, "checklist-result"), "✅ An toàn");
}

// ==============================================================
// NHÓM B: QUICKCHECK
// ==============================================================
console.log("\n--- Quickcheck ---\n");

{
    // Tình huống B1: Rủi ro cao — tin nhắn lừa đảo việc làm điển hình
    const window = loadPage();
    runQuickcheck(window, "Chào bạn, bên mình có việc nhẹ lương cao, không cần kinh nghiệm lương cao. Bạn chỉ cần đóng phí hồ sơ 500k rồi cung cấp mã OTP để xác nhận. Cần làm gấp trong hôm nay nhé!");
    const score = parseInt(getResultScore(window, "quickcheck-result"), 10);
    check("B1: Tin nhắn lừa việc làm — có phát hiện rủi ro cao", getResultTitle(window, "quickcheck-result"), "🚨 Rủi ro cao");
    console.log(`   (B1 điểm thực tế: ${score})`);
}

{
    // Tình huống B2: An toàn — hội thoại mua bán bình thường
    const window = loadPage();
    runQuickcheck(window, "Chào shop, sản phẩm này còn hàng không ạ? Giá bao nhiêu vậy?");
    check("B2: Hội thoại mua bán bình thường — điểm", getResultScore(window, "quickcheck-result"), "0");
    check("B2: Hội thoại mua bán bình thường — mức độ", getResultTitle(window, "quickcheck-result"), "✅ An toàn");
}

{
    // Tình huống B3: Giả danh công an — đe dọa pháp lý
    const window = loadPage();
    runQuickcheck(window, "Tôi là công an, anh/chị có liên quan đến đường dây rửa tiền, cần hợp tác điều tra ngay, nếu không sẽ có lệnh bắt.");
    check("B3: Giả danh công an — mức độ", getResultTitle(window, "quickcheck-result"), "🚨 Rủi ro cao");
}

{
    // Tình huống B4: Input rỗng — không crash, không hiện kết quả
    const window = loadPage();
    runQuickcheck(window, "");
    const resultBox = window.document.getElementById("quickcheck-result");
    check("B4: Input rỗng — không hiện result box", resultBox.classList.contains("hidden"), true);
}

{
    // Tình huống B5: Lừa đảo đầu tư
    const window = loadPage();
    runQuickcheck(window, "Đầu tư sinh lời nhanh, cam kết nhân đôi số tiền trong 7 ngày, lãi suất cao không rủi ro.");
    check("B5: Lừa đảo đầu tư — mức độ", getResultTitle(window, "quickcheck-result"), "🚨 Rủi ro cao");
}

{
    // Tình huống B6: Chỉ 1 từ khóa nhẹ — không nên báo động quá mức
    const window = loadPage();
    runQuickcheck(window, "Mình cần bạn xử lý việc này gấp trước cuối ngày nhé, deadline dự án.");
    console.log(`   (B6 - chỉ có từ 'gấp', điểm: ${getResultScore(window, "quickcheck-result")}, mức: ${getResultTitle(window, "quickcheck-result")} — kỳ vọng KHÔNG phải Rủi ro cao)`);
    check("B6: Chỉ 1 dấu hiệu nhẹ — không nên là Rủi ro cao", getResultTitle(window, "quickcheck-result") === "🚨 Rủi ro cao", false);
}

// ==============================================================
console.log("\n" + "=".repeat(60));
console.log(`KẾT QUẢ: ${passCount} PASS / ${failCount} FAIL`);
console.log("=".repeat(60));

process.exit(failCount > 0 ? 1 : 0);
