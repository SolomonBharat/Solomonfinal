# Solomon Bharat Portal

A secure B2B global sourcing marketplace connecting international buyers with verified Indian suppliers.

## 🚀 Features

- **Role-based Access Control**: Admin, Buyer, and Supplier roles with strict permissions
- **Secure RFQ Workflow**: Admin-gated approval process for all sensitive actions
- **Real-time Notifications**: Supabase Realtime for instant updates
- **Comprehensive Quotation System**: Full quote comparison and approval workflow
- **Sample Management**: End-to-end sample request and tracking
- **Order Management**: Complete order lifecycle management

## 🛠 Tech Stack

- **Frontend**: Vite + React + TypeScript + Tailwind CSS
- **Backend**: Supabase (Auth + Postgres + RLS + Realtime)
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Lucide React icons + Custom components
- **Notifications**: Sonner

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Supabase account and project
- Git for version control

## 🔧 Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd solomon-bharat-portal
npm install
```

### 2. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup

Run the SQL migrations in your Supabase SQL Editor in order:

1. `supabase/migrations/001_initial_schema.sql` - Creates all tables and types
2. `supabase/migrations/002_rls_policies.sql` - Sets up Row Level Security
3. `supabase/migrations/003_admin_rpcs.sql` - Creates admin-only functions
4. `supabase/migrations/004_seed_data.sql` - Adds initial categories

### 4. Create Test Users

In your Supabase Auth dashboard, create these test users:

**Admin User:**
- Email: `admin@solomonbharat.com`
- Password: `admin123`
- After creation, manually insert into profiles table:
```sql
INSERT INTO public.profiles (id, user_type, full_name, company_name, phone, country)
VALUES ('admin-user-id', 'admin', 'Admin User', 'Solomon Bharat', '+91-8595135554', 'India');
```

**Buyer User:**
- Email: `buyer@example.com`
- Password: `buyer123`
- Use the registration form or manually create profile

**Supplier User:**
- Email: `supplier@example.com`
- Password: `supplier123`
- Use the supplier registration form or manually create profile

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔐 Security Model

### Role Permissions

**Admin:**
- ✅ Approve/reject buyers and suppliers
- ✅ Approve/reject RFQs
- ✅ Assign suppliers to RFQs
- ✅ Moderate quotations before buyer visibility
- ✅ Oversee sample requests and orders
- ✅ Full platform oversight

**Buyer:**
- ✅ Create and manage own RFQs
- ✅ View admin-approved quotations for own RFQs
- ✅ Request samples and manage orders
- ❌ Cannot see other buyers' data
- ❌ Cannot directly contact suppliers

**Supplier:**
- ✅ View assigned RFQs or open bidding RFQs in their categories
- ✅ Submit quotations when authorized
- ✅ Manage samples and orders
- ❌ Cannot see RFQs outside their assigned/category scope
- ❌ Cannot see other suppliers' quotations

### Data Security

- **Row Level Security (RLS)**: All database access is filtered by user role and ownership
- **Admin-only RPCs**: Sensitive actions require admin privileges enforced at database level
- **Type Safety**: Full TypeScript coverage with Supabase generated types
- **Input Validation**: Zod schemas for all forms with server-side validation

## 🔄 Workflows

### RFQ Lifecycle

1. **Buyer** creates RFQ → Status: `pending_approval`
2. **Admin** reviews and approves → Status: `approved`
3. **Admin** assigns suppliers → Status: `matched`
4. **Suppliers** submit quotations → Status: `pending_admin_review`
5. **Admin** approves quotations → Status: `approved_for_buyer`
6. **Buyer** views and compares approved quotations
7. **Buyer** accepts quotation → Creates order, RFQ status: `closed`

### Sample Request Workflow

1. **Buyer** requests sample from approved quotation
2. **Admin** approves sample request
3. **Supplier** ships sample with tracking details
4. **Buyer** confirms sample delivery

### Supplier Verification

1. **Supplier** completes profile → Status: `pending`
2. **Admin** reviews supplier details
3. **Admin** verifies or rejects → Status: `verified`/`rejected`
4. Only `verified` suppliers can participate in RFQs

## 🧪 Testing

### Demo Accounts

Use these credentials to test different roles:

- **Admin**: `admin@solomonbharat.com` / `admin123`
- **Buyer**: `buyer@example.com` / `buyer123`
- **Supplier**: `supplier@example.com` / `supplier123`

### Test Scenarios

1. **Complete RFQ Flow**:
   - Login as Buyer → Create RFQ
   - Login as Admin → Approve RFQ → Assign Suppliers
   - Login as Supplier → Submit Quotation
   - Login as Admin → Approve Quotation
   - Login as Buyer → View and Accept Quotation

2. **Sample Request**:
   - Follow RFQ flow until quotation approval
   - Login as Buyer → Request Sample
   - Login as Admin → Approve Sample
   - Login as Supplier → Update Tracking
   - Login as Buyer → Confirm Delivery

3. **Access Control**:
   - Try accessing admin routes as buyer/supplier
   - Try accessing other users' data
   - Verify RLS policies are working

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components
│   ├── DashboardLayout.tsx
│   └── RequireRole.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── lib/               # Utilities and configurations
│   ├── supabase.ts    # Supabase client
│   └── queries.ts     # React Query hooks
├── pages/             # Page components
│   ├── admin/         # Admin-only pages
│   ├── buyer/         # Buyer-only pages
│   ├── supplier/      # Supplier-only pages
│   └── auth/          # Authentication pages
├── schemas/           # Zod validation schemas
└── App.tsx           # Main app component
```

## 🚀 Deployment

### Environment Variables

For production, set these environment variables:

```
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

### Build

```bash
npm run build
```

### Deploy

The built files in `dist/` can be deployed to any static hosting service (Vercel, Netlify, etc.).

## 🔍 Monitoring

- Monitor Supabase dashboard for database performance
- Check Auth logs for authentication issues
- Use browser dev tools for frontend debugging
- Monitor RLS policy performance in Supabase

## 🆘 Support

For technical support or questions:

- Email: admin@solomonbharat.com
- WhatsApp: +91-8595135554

## 📄 License

This project is proprietary software for Solomon Bharat platform.