# FORMA — Hướng dẫn chạy source

Bản mới nhất: Gallery Tunnel, hero vừa viewport, khu biệt thự với gara và sân vườn, animation xe chạy từ đường vào gara.

## Chạy trên máy

Cài Node.js >= 22.13.0 và pnpm 11.25.0. Mở Terminal tại thư mục vừa giải nén:

```bash
npm install -g pnpm@11.25.0
pnpm install --frozen-lockfile
pnpm dev
```

Mở http://localhost:5173 theo thông báo Terminal.

```bash
pnpm build
```

## Các file chính

- app/page.tsx: các section và điều khiển giao diện.
- app/globals.css: bố cục, responsive và màu sắc.
- app/house.tsx: mô hình Three.js, gara, sân vườn, xe và animation GSAP.
- app/intro.tsx: màn mở đầu, chuyển cảnh 2 giây.
- components/originkit/ui/gallery-tunnel.tsx: source Gallery Tunnel.
- public/images/: ảnh dùng trong website.
- IMAGE-SOURCES.md: nguồn ảnh tham khảo.

## Stack

React + TypeScript + Vinext (tương thích cấu trúc Next.js App Router), Vite, Tailwind CSS, Three.js và GSAP. Cấu hình build hiện tại hướng tới Cloudflare Workers/Sites; không phải project Next.js thuần dùng next dev.

Không cần API key Originkit để chạy: component đã được tải về dạng source. Bản demo không cần database hoặc biến môi trường. node_modules, file build và thông tin đăng nhập không nằm trong ZIP.

Giữ thư mục .openai vì vite.config.ts đọc cấu hình ở đó. Khi tạo dự án Sites độc lập mới, cần cấp project_id riêng; không tái sử dụng danh tính Site gốc để publish nhầm.

Ảnh là ảnh tham khảo cho concept, xem IMAGE-SOURCES.md trước khi sử dụng thương mại.
