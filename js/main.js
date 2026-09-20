/**
 * MAIN.JS — logic chung của toàn trang
 * ============================================
 * Hiện tại chỉ xử lý điều hướng mượt (smooth scroll) giữa các section
 * khi bấm nút ở trang chủ. Thêm các hành vi UI chung khác vào đây
 * nếu không thuộc riêng checklist hay quickcheck.
 */

document.addEventListener("DOMContentLoaded", () => {
    // Smooth scroll cho 2 nút CTA ở trang chủ
    document.querySelectorAll("[data-action]").forEach((el) => {
        el.addEventListener("click", (e) => {
            const targetId = el.getAttribute("href");
            if (targetId && targetId.startsWith("#")) {
                e.preventDefault();
                document.querySelector(targetId)?.scrollIntoView({ behavior: "smooth" });
            }
        });
    });
});
