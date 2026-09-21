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
function scanTextForKeywords(text) {
    const normalized = text.toLowerCase();

    return WARNING_KEYWORDS.filter((item) =>
        normalized.includes(item.keyword.toLowerCase())
    );
}

// ---- BƯỚC 2: Tìm các link trong text ----
function extractLinks(text) {
    // Bắt cả link có scheme (http/https) lẫn link không có scheme
    // (vd: "jobsgo.vn/viec-lam/...") — thêm scheme giả để URL() parse được
    const urlPattern = /(https?:\/\/[^\s]+)|(\b[a-z0-9-]+\.[a-z]{2,}(?:\.[a-z]{2,})?\/[^\s]*)/gi;
    const matches = text.match(urlPattern) || [];

    return matches.map((raw) => {
        const withScheme = raw.startsWith("http") ? raw : `https://${raw}`;
        try {
            return { raw, url: new URL(withScheme) };
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

    // 3a. Domain nằm trong whitelist uy tín -> trừ điểm, dừng phân tích thêm
    const isTrusted = TRUSTED_DOMAINS.some((d) => host === d || host.endsWith("." + d));
    if (isTrusted) {
        return {
            severity: LINK_SEVERITY.trustedBonus,
            reasons: [{ text: `Link "${host}"`, note: "Thuộc domain đã xác minh uy tín" }]
        };
    }

    // 3b. Kiểm tra giả mạo thương hiệu: domain CHỨA tên brand nhưng
    // không phải chính domain chính thức của brand đó.
    // Chuẩn hóa: bỏ dấu gạch ngang/số để bắt được cả kiểu giả mạo
    // "vietcom-bank-verify.xyz" (có gạch ngang chen giữa tên brand)
    const normalizedHost = host.replace(/[-0-9]/g, "");
    for (const target of IMPERSONATION_TARGETS) {
        const isOfficial = host === target.officialDomain || host.endsWith("." + target.officialDomain);
        const containsBrandName = normalizedHost.includes(target.brand);

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

    links.forEach(({ url }) => {
        const { severity, reasons } = analyzeSingleLink(url.hostname);
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
// score truyền vào đã là điểm cuối cùng để hiển thị (không âm)
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
                input.focus();
                input.placeholder = "⚠️ Vui lòng dán nội dung cần kiểm tra trước khi bấm Kiểm tra";
                return;
            }

            const foundKeywords = scanTextForKeywords(text);
            const linkAnalysis = analyzeLinkSafety(text);
            const rawScore = calculateQuickcheckScore(foundKeywords, linkAnalysis);
            const displayScore = Math.max(0, rawScore); // không hiển thị điểm âm
            const level = getRiskLevel(displayScore, QUICKCHECK_THRESHOLDS);

            renderQuickcheckResult(displayScore, level, foundKeywords, linkAnalysis);
        });
    }
});
