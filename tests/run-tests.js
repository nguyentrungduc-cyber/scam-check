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
        "js/data/link-safety.js",
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
// NHÓM C: PHÂN TÍCH LINK
// ==============================================================
console.log("\n--- Phân tích link ---\n");

{
    // Tình huống C1: Link tuyển dụng thật từ JobsGo (whitelist)
    const window = loadPage();
    runQuickcheck(window, "https://jobsgo.vn/viec-lam/nhan-vien-thiet-ke-noi-that-luong-10tr-20trtai-ha-noi-hcm-28682134118.html?ref_component=job_list__item");
    check("C1: Link JobsGo thật — mức độ", getResultTitle(window, "quickcheck-result"), "✅ An toàn");
    check("C1: Link JobsGo thật — điểm", getResultScore(window, "quickcheck-result"), "0");
}

{
    // Tình huống C2: Domain giả mạo ngân hàng (gạch ngang chen giữa tên brand)
    const window = loadPage();
    runQuickcheck(window, "Tài khoản của bạn bị khóa, vui lòng xác minh tại https://vietcom-bank-verify.xyz/login");
    const hasImpersonationWarning = window.document
        .getElementById("quickcheck-result")
        .querySelector(".result-reasons")
        .textContent.includes("giả mạo");
    check("C2: Domain giả mạo Vietcombank — phát hiện được", hasImpersonationWarning, true);
    check("C2: Domain giả mạo Vietcombank — mức độ", getResultTitle(window, "quickcheck-result"), "🚨 Rủi ro cao");
}

{
    // Tình huống C3: Domain chính thức — KHÔNG được báo nhầm là giả mạo
    const window = loadPage();
    runQuickcheck(window, "Đăng nhập tại https://vietcombank.com.vn để kiểm tra số dư");
    const hasImpersonationWarning = window.document
        .getElementById("quickcheck-result")
        .querySelector(".result-reasons")
        .textContent.includes("giả mạo");
    check("C3: Domain chính thức — KHÔNG báo nhầm giả mạo", hasImpersonationWarning, false);
    check("C3: Domain chính thức — mức độ", getResultTitle(window, "quickcheck-result"), "✅ An toàn");
}

{
    // Tình huống C4: Link rút gọn
    const window = loadPage();
    runQuickcheck(window, "Nhận quà miễn phí tại đây: https://bit.ly/abc123");
    const hasShortenerWarning = window.document
        .getElementById("quickcheck-result")
        .querySelector(".result-reasons")
        .textContent.includes("rút gọn");
    check("C4: Link rút gọn bit.ly — phát hiện được", hasShortenerWarning, true);
}

// ==============================================================
// NHÓM D: CHỐNG CỘNG ĐIỂM SAI / BÁO NHẦM / BỎ SÓT
// ==============================================================
console.log("\n--- Trường hợp biên ---\n");

function getReasonsText(window) {
    return window.document.getElementById("quickcheck-result").querySelector(".result-reasons").textContent;
}

{
    // D1: "mã OTP" chỉ tính 1 lần (không cộng thêm từ khóa "otp" nằm bên trong)
    const window = loadPage();
    runQuickcheck(window, "Gửi mình mã OTP nhé");
    check("D1: 'mã OTP' không bị cộng trùng — điểm", getResultScore(window, "quickcheck-result"), "5");
}

{
    // D2: Chèn nhiều link uy tín KHÔNG được làm giảm điểm rủi ro
    const window = loadPage();
    runQuickcheck(window, "Đóng phí hồ sơ và gửi mã OTP. Tham khảo jobsgo.vn/a topcv.vn/b vietnamworks.com/c");
    check("D2: Chèn link uy tín không rửa được điểm — mức độ", getResultTitle(window, "quickcheck-result"), "🚨 Rủi ro cao");
}

{
    // D3: Từ khóa nằm lẫn trong từ khác không bị tính ("otp" trong "hotpot")
    const window = loadPage();
    runQuickcheck(window, "Tối nay đi ăn hotpot không?");
    check("D3: 'hotpot' không khớp 'otp' — điểm", getResultScore(window, "quickcheck-result"), "0");
}

{
    // D4: Cùng 1 link lặp lại nhiều lần chỉ tính 1 lần; link rút gọn không bị tính trùng với từ khóa
    const window = loadPage();
    runQuickcheck(window, "https://bit.ly/a https://bit.ly/b https://bit.ly/c");
    check("D4: Link bit.ly lặp lại chỉ tính 1 lần — điểm", getResultScore(window, "quickcheck-result"), "2");
}

{
    // D5: Dấu câu dính cuối link không làm hỏng việc nhận diện TLD
    const window = loadPage();
    runQuickcheck(window, "Xác minh tại https://vietcom-bank-verify.xyz, nhanh");
    check("D5: Link có dấu phẩy phía sau — điểm", getResultScore(window, "quickcheck-result"), "9");
}

{
    // D6: Scheme viết hoa
    const window = loadPage();
    runQuickcheck(window, "HTTPS://vietcom-bank.xyz/a");
    check("D6: Link 'HTTPS://' viết hoa — điểm", getResultScore(window, "quickcheck-result"), "9");
}

{
    // D7: Link không có scheme, không có path
    const window = loadPage();
    runQuickcheck(window, "Truy cập vietcom-bank-verify.xyz để xác minh");
    check("D7: Link không scheme/không path — phát hiện giả mạo", getReasonsText(window).includes("giả mạo"), true);
}

{
    // D8: Chữ dính dấu chấm không có TLD thật thì không bị coi là link
    const window = loadPage();
    runQuickcheck(window, "Mình gửi vietcombank.Vui lòng kiểm tra giúp");
    check("D8: 'vietcombank.Vui' không bị coi là link — điểm", getResultScore(window, "quickcheck-result"), "0");
}

{
    // D9: Text dạng Unicode NFD (dấu tách rời) vẫn khớp từ khóa
    const window = loadPage();
    runQuickcheck(window, "Cung cấp mật khẩu cho mình".normalize("NFD"));
    check("D9: Text NFD vẫn khớp 'mật khẩu' — điểm", getResultScore(window, "quickcheck-result"), "5");
}

{
    // D10: Brand ngắn không báo nhầm khi nằm lẫn trong từ khác, nhưng vẫn bắt khi đứng riêng
    const window = loadPage();
    runQuickcheck(window, "https://tacbao.com/a");
    check("D10a: 'tacbao.com' không bị báo giả mạo ACB", getReasonsText(window).includes("giả mạo"), false);
    runQuickcheck(window, "https://acb-verify.com/a");
    check("D10b: 'acb-verify.com' bị báo giả mạo ACB", getReasonsText(window).includes("giả mạo"), true);
}

{
    // D11: Bấm kiểm tra với ô trống sau khi đã có kết quả → ẩn kết quả cũ
    const window = loadPage();
    runQuickcheck(window, "Gửi mình mã OTP nhé");
    runQuickcheck(window, "   ");
    check("D11: Input rỗng sau lần check trước — ẩn kết quả cũ", window.document.getElementById("quickcheck-result").classList.contains("hidden"), true);
}

// ==============================================================
console.log("\n" + "=".repeat(60));
console.log(`KẾT QUẢ: ${passCount} PASS / ${failCount} FAIL`);
console.log("=".repeat(60));

process.exit(failCount > 0 ? 1 : 0);
