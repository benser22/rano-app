# Changelog

All notable changes to the Rano Urban frontend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [0.5.0] - 2025-12-17

### Added

- **TikTok Integration**
  - Added `tiktokUrl` field to Store Config in backend.
  - Added TikTok icon (outline style) to Footer and Contact page.
  - Links dynamically to the configured TikTok URL.
- **Email Template Enhancements**
  - Contact emails now link the Logo and Header Title to the frontend website.
  - Added explicit text links ("Ir a la Web" / "Visitar Tienda") to email headers for better visibility when images are blocked.

### Changed

- **Email HTML Refactor**
  - Refactored email header HTML to use independent `<a>` tags for each element (logo, title, text) to improve compatibility with email clients (Gmail, Outlook) and prevent link stripping.
- **WhatsApp Button**
  - Updated button color and pulse animation duration.
- **Social Icons**
  - TikTok icon updated to use a custom SVG outline that matches the style of existing Lucide icons.
  - Added `cursor-pointer` to social links in Footer and Contact page.

## [0.4.1] - 2025-12-17

### Added

- **ProductForm 3-Row Layout** - Reorganized form with responsive grid
  - Row 1: Basic Info + Images (equal height)
  - Row 2: Prices & Stock + Category + Options + Tags (4 cards)
  - Row 3: Sizes + Colors (with flex proportions)
- **RowContainer Component** - Flexbox container for equal-height cards
- **Predefined Tags** - Clickable tag buttons (Nuevo, Oferta, Destacado, etc.)
- **Visual Icons** - Category (📂) and Options (mini-carousel) with dynamic opacity
- **Image Upload Improvements**
  - Multi-file drag & drop support
  - Individual error handling per file
  - Success/error count feedback
  - Larger upload icon (64px)
- **Responsive Admin Pages**
  - ProductsPage header with flex wrap
  - CategoriesPage header with flex wrap
  - ConfigPage refactored with RowContainer and SectionCard
  - All action buttons now use size="L" for better padding

### Changed

- SKU and Slug fields now use flex-wrap for responsive layout
- SectionCard accepts style prop for custom flex values
- CustomGrid uses transient props ($cols, $tabletCols, $mobileCols)
- Increased image size limit from 3MB to 5MB
- Form header is now responsive with wrap
- ConfigPage now uses 2-row layout: (Datos+Envíos) and (Horarios+Redes)
- RowContainer improved with better responsive breakpoints

### Fixed

- React DOM warnings for styled-components props
- Image upload state getting stuck after errors
- Tags, sizes, and colors now show as removable Tag components
- ConfigPage now correctly loads all config values from API

---

## [0.4.0] - 2025-12-16

### Added

- **Quick Loader Plugin** - Complete admin plugin for fast product management
  - Product creation with auto-publish functionality
  - Image upload with validation (max 4 images, 3MB limit)
  - Form validation (name, SKU, price, stock, category, sizes, colors required)
  - Category management (create, edit, delete)
  - Store configuration editing
  - Dashboard with sales and products statistics
- **Dashboard Statistics**
  - Total sales and monthly sales
  - Paid orders and monthly orders count
  - Products count, categories count
  - Low stock and out of stock alerts
- **Orphaned Images Cleanup**
  - Weekly cron job (Sundays at 3:00 AM)
  - Runs on server startup
  - Cleans both DB records and physical files
- **Upload Configuration**
  - 3MB file size limit
  - Image breakpoints configuration

### Changed

- Replaced all browser `alert()` and `confirm()` with styled UI components
- Product form uses Content Manager API with authenticated requests
- Delete confirmations now use Dialog component

### Fixed

- Product edit mode now correctly loads category relation
- Image upload validates size before sending to server
- Navigation after save uses timeout to prevent abort errors

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
