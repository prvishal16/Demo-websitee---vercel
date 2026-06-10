# Bhoomi Tiffins & Snacks - Frontend

A standalone React frontend application for Bhoomi Tiffins & Snacks, converted from a Replit monorepo project.

## Tech Stack

- React 18 + TypeScript
- Vite 6
- Tailwind CSS v4
- TanStack React Query
- Wouter (routing)
- Framer Motion (animations)
- shadcn/ui components

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Configuration

Copy `.env.example` to `.env` and configure:

```
VITE_API_BASE_URL=/api
```

The frontend expects a backend API at the `/api` prefix. All API endpoints:

- `GET /api/menu-items` - List menu items
- `GET /api/categories` - List categories
- `GET /api/offers` - List offers
- `GET /api/feedback` - List feedback
- `GET /api/orders` - List orders
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/top-selling` - Top selling items
- `GET /api/catering-inquiries` - Catering inquiries
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/user/login` - User login
- `POST /api/auth/user/register` - User registration
- `POST /api/orders` - Create order
- `POST /api/feedback` - Submit feedback
- `POST /api/menu-items` - Create menu item
- `POST /api/offers` - Create offer
- `POST /api/catering-inquiries` - Submit catering inquiry
- `PATCH /api/orders/:id/status` - Update order status
- `PATCH /api/menu-items/:id` - Update menu item
- `PATCH /api/feedback/:id` - Update feedback
- `PATCH /api/offers/:id` - Update offer
- `DELETE /api/menu-items/:id` - Delete menu item
- `DELETE /api/feedback/:id` - Delete feedback
- `DELETE /api/offers/:id` - Delete offer

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── AdminLayout.tsx
│   │   ├── FloatingButtons.tsx
│   │   ├── Navbar.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── UserProtectedRoute.tsx
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utilities
│   │   ├── utils.ts      # cn() helper
│   │   └── api-client.ts # API client hooks
│   ├── pages/            # Page components
│   │   └── admin/        # Admin pages
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/               # Static assets
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tsconfig.app.json
```
