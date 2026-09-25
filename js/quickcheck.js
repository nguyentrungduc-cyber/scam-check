/**
 * LOGIC KIỂM TRA NHANH (Quickcheck)
 * ============================================
 * File này xử lý:
 *   1. Lấy text người dùng dán vào #quickcheck-input
 *   2. Quét text, so khớp với WARNING_KEYWORDS (từ khóa cảnh báo)
 *   3. Tìm và phân tích các link có trong text (domain, TLD...)
 *   4. Cộng dồn điểm rủi ro từ cả 2 nguồn (từ khóa + link)
 *   5. So với QUICKCHECK_THRESHOLDS, hiển thị kết quả (xanh/vàng/đỏ)
 *
 * Phụ thuộc:
 *   - js/data/warning-keywords.js (phải load TRƯỚC file này)
 *   - js/data/link-safety.js (phải load TRƯỚC file này)
 *   - js/checklist.js (dùng chung getRiskLevel(), renderResultBox())
 */

// ---- BƯỚC 1: Quét text tìm từ khóa khớp ----
// Chuẩn hóa NFC để text dán từ macOS/một số app (dạng NFD — dấu tách rời)
// vẫn khớp được với từ khóa có dấu
function normalizeText(text) {
    return text.normalize("NFC").toLowerCase();
}

function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Tìm mọi vị trí xuất hiện của keyword như một TỪ/CỤM TỪ riêng
// (không nằm lẫn trong từ khác) — tránh "otp" khớp nhầm trong "hotpot"
function findKeywordRanges(normalizedText, keyword) {
    const pattern = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(keyword)}(?![\\p{L}\\p{N}])`, "gu");
    return Array.from(normalizedText.matchAll(pattern), (m) => [m.index, m.index + m[0].length]);
}

function scanTextForKeywords(text) {
    const normalized = normalizeText(text);

    // Xét cụm dài trước: nếu cụm ngắn ("otp") chỉ xuất hiện BÊN TRONG cụm dài
    // đã khớp ("mã otp") thì không cộng điểm lần nữa cho cùng 1 ý
    const sorted = WARNING_KEYWORDS
        .map((item) => ({ item, keyword: normalizeText(item.keyword) }))
        .sort((a, b) => b.keyword.length - a.keyword.length);

    const usedRanges = [];
    const found = [];

    sorted.forEach(({ item, keyword }) => {
        const ranges = findKeywordRanges(normalized, keyword);
        const hasFreshMatch = ranges.some(([start, end]) =>
            !usedRanges.some(([uStart, uEnd]) => start < uEnd && end > uStart)
        );
        if (hasFreshMatch) found.push(item);
        usedRanges.push(...ranges);
    });

    // Giữ đúng thứ tự như trong WARNING_KEYWORDS để hiển thị ổn định
    return WARNING_KEYWORDS.filter((item) => found.includes(item));
}

// ---- BƯỚC 2: Tìm các link trong text ----
function extractLinks(text) {
    // Bắt cả link có scheme (http/https, không phân biệt hoa thường) lẫn
    // link không có scheme (vd: "jobsgo.vn/viec-lam/..." hoặc "abc-verify.xyz")
    const urlPattern = /(https?:\/\/[^\s]+)|((?<![@\w.-])(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s]*)?)/gi;
    const matches = text.match(urlPattern) || [];

    return matches.map((match) => {
        // Bỏ dấu câu dính ở cuối link (vd: "https://abc.xyz," hoặc "abc.xyz).")
        const raw = match.replace(/[.,;:!?)\]}'"»”]+$/, "");
        const hasScheme = /^https?:\/\//i.test(raw);
        const withScheme = hasScheme ? raw : `https://${raw}`;
        try {
            const url = new URL(withScheme);
            // Link không có scheme dễ khớp nhầm chữ thường ("xong.Vui lòng...")
            // → chỉ chấp nhận khi đuôi domain là TLD có thật trong danh sách
            if (!hasScheme) {
                const tld = url.hostname.split(".").pop();
                if (!KNOWN_TLDS.includes(tld)) return null;
            }
            return { raw, url };
        } catch {
            return null; // link không hợp lệ, bỏ qua
        }
    }).filter(Boolean);
}

// ---- BƯỚC 3: Phân tích độ an toàn của 1 domain ----
// Trả về { severity, reasons: [{text, note}] } cho MỘT link
function analyzeSingleLink(hostname) {
    const host = hostname.toLowerCase().replace(/^www\./, "");
    let severity = 0;
    const reasons = [];

    // 3a. Domain nằm trong whitelist uy tín -> không cộng điểm, dừng phân tích thêm
    const isTrusted = TRUSTED_DOMAINS.some((d) => host === d || host.endsWith("." + d));
    if (isTrusted) {
        return {
            severity: LINK_SEVERITY.trusted,
            reasons: [{ text: `Link "${host}"`, note: "Thuộc domain đã xác minh uy tín" }]
        };
    }

    // 3b. Kiểm tra giả mạo thương hiệu: domain CHỨA tên brand nhưng
    // không phải chính domain chính thức của brand đó.
    // Chuẩn hóa: bỏ dấu gạch ngang/số để bắt được cả kiểu giả mạo
    // "vietcom-bank-verify.xyz" (có gạch ngang chen giữa tên brand)
    const normalizedHost = host.replace(/[-0-9]/g, "");
    // Tên brand ngắn (acb, bidv, tiki...) dễ nằm lẫn trong từ khác ("tacbao.com")
    // → chỉ tính khi đứng thành 1 phần riêng của domain ("acb-verify.xyz")
    const hostTokens = host.replace(/[0-9]/g, "").split(/[.-]/);
    for (const target of IMPERSONATION_TARGETS) {
        const isOfficial = host === target.officialDomain || host.endsWith("." + target.officialDomain);
        const containsBrandName = target.brand.length <= SHORT_BRAND_MAX_LENGTH
            ? hostTokens.includes(target.brand)
            : normalizedHost.includes(target.brand);

        if (containsBrandName && !isOfficial) {
            severity += LINK_SEVERITY.impersonation;
            reasons.push({
                text: `Link "${host}"`,
                note: `Chứa tên "${target.brand}" nhưng KHÔNG phải domain chính thức (${target.officialDomain}) — nghi ngờ giả mạo`
            });
            break; // 1 domain chỉ tính giả mạo 1 thương hiệu, tránh cộng điểm trùng
        }
    }

    // 3c. Kiểm tra TLD đáng ngờ
    const matchedTld = SUSPICIOUS_TLDS.find((tld) => host.endsWith(tld));
    if (matchedTld) {
        severity += LINK_SEVERITY.suspiciousTld;
        reasons.push({
            text: `Link "${host}"`,
            note: `Dùng đuôi domain "${matchedTld}" — loại TLD thường bị lợi dụng cho web lừa đảo`
        });
    }

    // 3d. Kiểm tra dịch vụ rút gọn link
    const isShortener = URL_SHORTENERS.some((s) => host === s);
    if (isShortener) {
        severity += LINK_SEVERITY.shortener;
        reasons.push({
            text: `Link "${host}"`,
            note: "Dùng dịch vụ rút gọn link — có thể che giấu địa chỉ web thật"
        });
    }

    return { severity, reasons };
}

// ---- BƯỚC 4: Phân tích toàn bộ link tìm thấy trong text ----
function analyzeLinkSafety(text) {
    const links = extractLinks(text);
    let totalSeverity = 0;
    let allReasons = [];

    // Mỗi domain chỉ phân tích 1 lần — dán lặp lại cùng 1 link nhiều lần
    // không làm điểm tăng/giảm theo số lần lặp
    const uniqueHosts = [...new Set(links.map(({ url }) => url.hostname.toLowerCase().replace(/^www\./, "")))];

    uniqueHosts.forEach((hostname) => {
        const { severity, reasons } = analyzeSingleLink(hostname);
        totalSeverity += severity;
        allReasons = allReasons.concat(reasons);
    });

    return { severity: totalSeverity, reasons: allReasons, linkCount: links.length };
}

// ---- BƯỚC 5: Tính tổng điểm rủi ro (từ khóa + link) ----
function calculateQuickcheckScore(foundKeywords, linkAnalysis) {
    const keywordScore = foundKeywords.reduce((sum, item) => sum + item.severity, 0);
    return keywordScore + linkAnalysis.severity;
}

// ---- BƯỚC 6: Hiển thị kết quả ----
// Dùng chung renderResultBox() đã định nghĩa trong checklist.js
function renderQuickcheckResult(score, level, foundKeywords, linkAnalysis) {
    const keywordReasons = foundKeywords.map((k) => ({
        text: `"${k.keyword}"`,
        note: k.note
    }));
    const reasons = keywordReasons.concat(linkAnalysis.reasons);

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
                // Ẩn kết quả của lần kiểm tra trước để tránh hiểu nhầm
                document.getElementById("quickcheck-result")?.classList.add("hidden");
                input.focus();
                input.placeholder = "⚠️ Vui lòng dán nội dung cần kiểm tra trước khi bấm Kiểm tra";
                return;
            }

            const foundKeywords = scanTextForKeywords(text);
            const linkAnalysis = analyzeLinkSafety(text);
            const score = calculateQuickcheckScore(foundKeywords, linkAnalysis);
            const level = getRiskLevel(score, QUICKCHECK_THRESHOLDS);

            renderQuickcheckResult(score, level, foundKeywords, linkAnalysis);
        });
    }
});
