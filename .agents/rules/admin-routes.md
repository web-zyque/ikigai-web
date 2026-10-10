# Admin Route Architecture & Rules

This document defines the canonical routing architecture for the IKIGAI Admin Panel.

---

## 1. Products & Inventory Architecture Rule

- **Single Combined Route:** Products and Inventory MUST always remain one combined page under the single route directory:
  `frontend/app/admin/products-inventory/page.tsx` (Route: `/admin/products-inventory`).
- **Do Not Separate:** Never create separate `products/` or `inventory/` page folders inside `frontend/app/admin/`.
- **Special Characters:** Never use reserved URI characters such as `&` in route folder names (e.g., do NOT use `product&inventory`), as they break Next.js App Router internal type generation (`validator.ts`) and violate URL standards.
- **Sidebar Integration:** The Admin Sidebar navigation item for "Products & Inventory" must link to `/admin/products-inventory`.
