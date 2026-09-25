/**
 * DỮ LIỆU PHÂN TÍCH LINK — dùng cho analyzeLinkSafety() trong quickcheck.js
 * ============================================
 * Vẫn theo đúng tinh thần "rule-based, JS thuần, không gọi API ngoài" —
 * chỉ phân tích CẤU TRÚC của link (domain, TLD) so với danh sách đã
 * soạn sẵn thủ công, không tra cứu real-time bất kỳ nguồn nào.
 *
 * Cách chỉnh sửa: thêm/sửa domain vào các mảng bên dưới khi tổ phát
 * hiện trang mới cần đưa vào whitelist hoặc muốn cảnh báo thêm.
 */

// ==== DOMAIN UY TÍN (whitelist) ====
// Nếu link thuộc các domain này → không cộng điểm rủi ro cho link đó,
// thậm chí có thể coi là tín hiệu tích cực (trang tuyển dụng/ngân hàng/
// dịch vụ công thật). Chỉ nên thêm domain đã chắc chắn xác minh là thật.
const TRUSTED_DOMAINS = [
    // --- Trang tuyển dụng phổ biến, uy tín tại VN ---
    "jobsgo.vn",
    "vietnamworks.com",
    "topcv.vn",
    "careerbuilder.vn",
    "timviec365.vn",
    "careerlink.vn",
    "mywork.com.vn",
    "vieclam24h.vn",

    // --- Ngân hàng lớn tại VN (domain chính thức) ---
    "vietcombank.com.vn",
    "techcombank.com.vn",
    "acb.com.vn",
    "vpbank.com.vn",
    "bidv.com.vn",
    "vietinbank.vn",
    "mbbank.com.vn",
    "tpb.vn",
    "sacombank.com.vn",

    // --- Cơ quan nhà nước / dịch vụ công ---
    "dichvucong.gov.vn",
    "bocongan.gov.vn",
    "mst.gdt.gov.vn", // tra cứu mã số thuế

    // TODO: tổ bổ sung thêm domain đã xác minh chắc chắn là thật
];

// ==== TÊN THƯƠNG HIỆU LỚN THƯỜNG BỊ GIẢ MẠO ====
// Dùng để phát hiện domain "gần giống" — chứa tên thương hiệu nhưng
// KHÔNG nằm trong TRUSTED_DOMAINS ở trên (dấu hiệu giả mạo/phishing)
const IMPERSONATION_TARGETS = [
    { brand: "vietcombank", officialDomain: "vietcombank.com.vn" },
    { brand: "techcombank", officialDomain: "techcombank.com.vn" },
    { brand: "acb", officialDomain: "acb.com.vn" },
    { brand: "vpbank", officialDomain: "vpbank.com.vn" },
    { brand: "bidv", officialDomain: "bidv.com.vn" },
    { brand: "vietinbank", officialDomain: "vietinbank.vn" },
    { brand: "momo", officialDomain: "momo.vn" },
    { brand: "zalopay", officialDomain: "zalopay.vn" },
    { brand: "shopee", officialDomain: "shopee.vn" },
    { brand: "tiki", officialDomain: "tiki.vn" },
    // TODO: tổ bổ sung thêm thương hiệu hay bị giả mạo
];

// Tên brand có độ dài <= giá trị này (acb, bidv, momo, tiki) được coi là "ngắn":
// chỉ tính giả mạo khi tên đứng riêng thành 1 phần của domain ("acb-verify.xyz"),
// tránh báo nhầm domain vô tình chứa chuỗi đó ("tacbao.com")
const SHORT_BRAND_MAX_LENGTH = 4;

// ==== TLD (đuôi domain) THƯỜNG DÙNG CHO WEB LỪA ĐẢO ====
// Không có nghĩa domain đuôi này CHẮC CHẮN là lừa đảo — chỉ là tín hiệu
// cộng thêm điểm cảnh giác vì các TLD này rẻ/dễ đăng ký ẩn danh, hay bị
// lợi dụng làm web phishing.
const SUSPICIOUS_TLDS = [
    ".xyz", ".top", ".click", ".tk", ".work", ".live",
    ".loan", ".gq", ".ml", ".cf", ".ga", ".icu"
];

// ==== TLD PHỔ BIẾN (dùng để nhận diện link KHÔNG có http/https) ====
// Link dạng "abc-verify.xyz" (không có scheme) chỉ được coi là link khi
// đuôi domain nằm trong danh sách này — tránh nhận nhầm chữ thường
// kiểu "xong.Vui lòng..." thành domain. Có scheme thì không cần kiểm tra.
const KNOWN_TLDS = [
    "vn", "com", "net", "org", "info", "biz", "io", "co", "me", "app",
    "online", "site", "shop", "store", "link", "cc", "ly", "at", "gd",
    ...SUSPICIOUS_TLDS.map((tld) => tld.slice(1))
];

// ==== DỊCH VỤ RÚT GỌN LINK ====
// Bản thân dịch vụ rút gọn không xấu, nhưng che giấu domain thật —
// nên gắn 1 mức cảnh giác nhẹ, không nặng như domain giả mạo hẳn.
const URL_SHORTENERS = [
    "bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly",
    "is.gd", "buff.ly", "rebrand.ly", "shorturl.at"
];

/**
 * ĐIỂM SỐ CHO TỪNG LOẠI TÍN HIỆU LINK
 * ============================================
 * Cộng vào tổng điểm quickcheck giống như WARNING_KEYWORDS,
 * dùng chung 1 thang điểm và 1 ngưỡng kết luận.
 */
const LINK_SEVERITY = {
    impersonation: 6,   // domain giả mạo gần giống thương hiệu lớn — rất nghiêm trọng
    suspiciousTld: 3,   // domain dùng TLD đáng ngờ
    shortener: 2,       // dùng dịch vụ rút gọn link
    trusted: 0          // domain nằm trong whitelist — KHÔNG trừ điểm: nếu trừ, kẻ lừa đảo
                        // chỉ cần chèn thêm vài link thật là "rửa" được điểm rủi ro
};
