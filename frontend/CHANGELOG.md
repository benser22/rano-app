# Changelog

All notable changes to the Rano Urban frontend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [0.3.0] - 2025-12-13

### Added
- **Product Search** with debounced autocomplete (`SearchCombobox.tsx`)
- **Mobile Search** dialog for responsive design (`MobileSearch.tsx`)
- **Checkout Flow** with 2-step process (shipping → confirmation)
- **MercadoPago Integration** for payment processing
- **Checkout Success/Error Pages** with appropriate UX
- **Wishlist Feature** with localStorage persistence
  - `wishlistStore.ts` - Zustand store
  - `WishlistButton.tsx` - Icon/button variants
  - `/favoritos` page with add-to-cart functionality
- **Price Filters** functional with URL params
- **Product Sorting** (price asc/desc, name, recent)
- **Grid Toggle** (2 or 3 columns)
- **Load More Pagination** for products
- **ProductGrid Component** - Client component handling sorting, grid, pagination
- **SEO Metadata** complete in layout and pages
  - Viewport configuration
  - Open Graph tags
  - Twitter cards
  - Robots directives
  - Title template system
- **qs library** for proper Strapi filter serialization

### Fixed
- Hydration error in Navbar by using `mounted` state for badges
- Price filter URL encoding issue (changed `25000+` to `25000-max`)
- Empty state layout not filling full width

### Changed
- `strapi.ts` now uses `qs` for params serialization
- Products page uses `ProductGrid` client component

---

## [0.2.0] - 2025-12-13

### Added
- **Authentication System**
  - Login page with email/password
  - Register page with validation
  - Google OAuth integration
  - `authStore.ts` with Zustand persistence
  - `UserDropdown.tsx` component
- **Profile Page** (`/perfil`) - Protected route
- **Orders Page** (`/pedidos`) - Protected route
- **Backend Google OAuth Endpoint** - Custom token exchange

### Changed
- Navbar updated with UserDropdown integration
- Backend `bootstrap` enables Google provider automatically

---

## [0.1.0] - 2025-12-13

### Added
- **Design System** based on Tailwind v4 + shadcn/ui
- **Core UI Components**
  - Button, Card, Input, Badge, Separator
  - Label, Dialog, Sheet
  - ImgWithFallback
- **Layout Components**
  - `Navbar.tsx` - Responsive with mobile menu
  - `Footer.tsx` - With newsletter, links, social
- **Home Page** - Hero, features, categories, featured products
- **Products Page** (`/productos`)
  - Category sidebar
  - Product grid
  - Breadcrumbs
- **Product Detail Page** (`/productos/[slug]`)
  - Image gallery
  - Price display
  - Stock status
  - Related products
- **Cart System**
  - `cartStore.ts` with Zustand
  - `CartDetails.tsx` component
  - `/carrito` page
- **Product Components**
  - `ProductCard.tsx`
  - `PriceDisplay.tsx`
  - `ProductBadge.tsx`

### Technical
- Next.js 15 with App Router
- Tailwind CSS v4
- Zustand for state management
- Axios for API calls
- Sonner for toast notifications
