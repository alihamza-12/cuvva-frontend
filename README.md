# 🚗 Cuvva Frontend

**Cuvva Frontend — Customer / Admin Insurance App UI**

A modern, dark-themed mobile-first insurance platform UI built with **React 19**, **Vite**, and **Tailwind CSS**. It powers three distinct experiences in a single codebase:

- **Customer app** — get insured, join car clubs, manage policies, and edit a full profile with a built-in Chat Support widget.
- **Super Admin workspace** — global platform control: create users, issue policies, register vehicles, and monitor every sub-admin.
- **Sub Admin workspace** — an agent console with ownership-scoped customers, vehicles, and policies.

The frontend is fully role-aware: routing, navigation, and data visibility all adapt based on the authenticated user's role (`Super Admin`, `Sub Admin`, or `Customer`).

---

## ⚙️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | [React 19](https://react.dev/) | Component-based UI |
| **Build tool** | [Vite 8](https://vitejs.dev/) | Dev server, HMR, production bundling |
| **Language** | JavaScript (JSX) | Application code |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first styling + custom Cuvva theme |
| **Routing** | [react-router-dom 7](https://reactrouter.com/) | Role-based routing & protected layouts |
| **Global State** | [Redux Toolkit 2](https://redux-toolkit.js.org/) | Auth slice + stores |
| **Server State** | [RTK Query](https://redux-toolkit.js.org/rkq/introduction) | `authApi`, `profileApi`, and data fetching |
| **HTTP Client** | [Axios](https://axios.com/) | Custom `httpClient` with token-refresh interceptors |
| **Forms** | [react-hook-form](https://react-hook-form.com/) + [zod](https://zod.dev/) | Validation & form handling |
| **Number/Currency** | [react-number-format](https://github.com/s-yadav/react-number-format) | `CurrencyInput` masked formatting |
| **Icons** | [lucide-react](https://lucide.dev/) | Icon library |
| **Charts** | [recharts](https://recharts.org/) | Admin dashboard charts |
| **Dates** | [date-fns](https://date-fns.org/) | Date utilities |

---

## ✨ Features

### 👤 Customer Features

| Area | Highlights |
|------|-----------|
| **Get Insured** | Full purchase flow — plate search, quote (`PolicyQuotePage`), vehicle photo & camera capture, policy documents. |
| **Car Clubs** | Browse clubs (`CarClubsPage`), view club detail (`CarClubDetailPage`), **create a club** (`CreateCarClubPage`), and resource/help articles (`CarClubResourcePage`). |
| **Policies** | Active policy list (`PoliciesPage`), policy detail & receipt, claims (`MakeAClaimPage`), book a mechanic (`BookMechanicPage`), IPID insurance summary & policy wording. |
| **Profile** | Comprehensive profile rebuild — account details, bank details, discount codes, "your discounts", refer-a-friend, preferred name, emails, mobile numbers, connected accounts, identity, residential address, marketing preferences, previous incidents, delete-account info, and a full legal hub (privacy policy, terms, FON). |
| **Chat Support** | A full-screen **Chat Support Widget** at `/customer/support` — reachable from any page/icon. Includes a hub, messages list, AI/bot conversation, help articles, and terms overlay. |
| **Buy Again & Recently Viewed** | `BuyAgainSection`, `BuyAgainCard`, `RecentlyViewedSection`. |
| **Restyled Inputs** | Masked date/time inputs, currency input, inline wheel/date fields, duration & start-time picker sheets. |

### 🛡️ Super Admin Features

| Area | Highlights |
|------|-----------|
| **Overview Grid** | Global KPIs for sub-admins, customers, vehicles, and policies. |
| **Account Management** | Manage sub-admins & customers platform-wide. |
| **Own Data** | Own customers, own vehicles, own policies management tabs. |
| **All Sub-Admins** | View & manage every sub-admin on the platform. |
| **Vehicle Catalog** | Browse the global vehicle registry + DVLA lookup. |
| **Policy Contracts** | View the full policy ledger and issue new policies. |
| **Creation Wizards** | `CreateUser`, `CreatePolicy`, `CreateVehicle` — with reusable masked/currency inputs. |

### 👨‍💼 Sub Admin Features

| Area | Highlights |
|------|-----------|
| **Agent Console** | `SubAdminDashboard` with an overview of the sub-admin's own workspace. |
| **Owned Data** | Scope-limited lists: `SubAdminOwnCustomers`, `SubAdminOwnVehicles`, `SubAdminOwnPolicies`. |
| **Policy Contracts** | `SubAdminPolicyContracts` (owner-scoped). |
| **Creation Wizards** | `CreateCustomerPage`, `CreatePolicyPage`, `CreateVehiclePage`. |
| **Detail Pages** | Customer / Vehicle / Policy detail views with ownership guards. |

---

## 📁 Folder Structure

```
frontend/
├─ src/
│  ├─ main.jsx               # React entry point (Provider + App)
│  ├─ App.jsx                # Root component → renders <AppRouter/>
│  ├─ app/
│  │  ├─ store.js            # Redux store (auth + authApi + profileApi)
│  │  └─ api/                # API layer
│  │     ├─ httpClient.js    # Axios instance w/ 401-refresh-retry interceptor
│  │     ├─ authApi.js       # RTK Query: login / logout
│  │     ├─ profileApi.js    # RTK Query: /customers/me (get/update/photo)
│  │     ├─ customerApi.js / customerCreateApi.js / customerUpdateApi.js
│  │     ├─ vehicleApi.js / vehicleUpdateApi.js
│  │     ├─ policyApi.js / policyUpdateApi.js
│  │     └─ subAdminApi.js
│  ├─ assets/                # Static images (hero, react, vite)
│  ├─ components/
│  │  ├─ common/             # Reusable UI kit
│  │  │  ├─ Button, Badge, Input, Spinner, StatCard
│  │  │  ├─ CurrencyInput    # £ masked GBP input (direct decimal storage)
│  │  │  ├─ MaskedDateInput  # DD/MM/YYYY masked date
│  │  │  └─ MaskedTimeInput  # HH:MM masked time
│  │  ├─ customer/           # Customer feature components (50+ files)
│  │  ├─ layout/             # Layouts: CustomerLayout, AdminLayout, SubAdminLayout, MainLayout
│  │  ├─ policy/             # PolicyCard
│  │  ├─ super-admin/        # Super Admin dashboard components
│  │  ├─ sub-admin/          # Sub Admin dashboard components
│  │  └─ vehicle/            # Vehicle components (DvlaLookup)
│  ├─ data/                  # Static JSON (car clubs, chat bot, FON, terms, etc.)
│  ├─ features/
│  │  └─ authSlice.js        # Redux auth slice + selectCurrentUser
│  ├─ hooks/
│  │  ├─ useAuth.js          # Reads auth state
│  │  └─ useCountdown.js     # Countdown helper
│  ├─ pages/
│  │  ├─ auth/               # LoginPage
│  │  ├─ customer/           # Home, Quote, PolicyDocs, etc.
│  │  ├─ super-admin/        # Dashboard, detail pages
│  │  └─ sub-admin/          # Sub Admin pages
│  ├─ router/
│  │  ├─ AppRouter.jsx       # All routes + role-based layouts
│  │  └─ ProtectedRoute.jsx  # Role gate
│  ├─ styles/
│  │  └─ index.css           # Tailwind + custom Cuvva theme base
│  └─ utils/                 # calculatePremium, formatCurrency, formatDate,
│                            # chatLocalStorage, profileLocalStorage, uploadToCloudinary
├─ public/                   # Static assets (logos, icons, images)
├─ index.html
├─ vite.config.js            # ngrok-friendly HMR config
├─ tailwind.config.js        # Cuvva theme (colors, fonts, gradients, glows)
├─ postcss.config.js
└─ package.json
```

### What each folder does

| Folder | Role |
|--------|------|
| `app/` | Redux store + all API slices (RTK Query) and the Axios `httpClient`. |
| `api/` | Every backend endpoint the frontend talks to. `httpClient.js` centralises auth + automatic token refresh. |
| `components/common/` | Design-system primitives reused across every role (`Button`, `Badge`, `CurrencyInput`, masked inputs, etc.). |
| `components/customer/` | All customer-flow screens (buy flow, clubs, policies, profile, chat support). |
| `components/super-admin/` | Super Admin workspace modules (dashboards, grids, managers, creation wizards). |
| `components/sub-admin/` | Sub Admin workspace modules (owns-scoped lists and dashboards). |
| `components/layout/` | Layout wrappers that render `<Outlet/>` plus role-specific navigation. |
| `data/` | Local static JSON used by chat bot, car clubs, legal/terms pages. |
| `features/` | Redux slices that carry global app state (`authSlice`). |
| `pages/` | Thin route-level page wrappers (mostly super-admin/sub-admin routes). |
| `router/` | Route table (`AppRouter.jsx`) and the `ProtectedRoute` role gate. |
| `utils/` | Pure helper functions (premium calc, currency/date formatting, localStorage helpers, Cloudinary upload). |

---

## 🧭 Routing & Role-Based Access

Routing is declared centrally in **`src/router/AppRouter.jsx`** inside a `BrowserRouter`.

The app has **three isolated workspaces**, each protected by `ProtectedRoute`:

```jsx
<ProtectedRoute allowedRoles={["Super Admin"]}>…</ProtectedRoute>
<ProtectedRoute allowedRoles={["Customer"]}>…</ProtectedRoute>
<ProtectedRoute allowedRoles={["Sub Admin"]}>…</ProtectedRoute>
```

`ProtectedRoute.jsx` reads the current user from Redux:

```jsx
const user = useSelector(selectCurrentUser);
if (!user) return <Navigate to="/login" replace />;
if (allowedRoles && !allowedRoles.includes(user.role)) {
  return <Navigate to="/" replace />;
}
return children;
```

The **`RoleRedirect`** component (in `AppRouter.jsx`) automatically bounces unauthenticated users to `/login` and routes each role to its home workspaces:

| Role | Redirect target |
|------|----------------|
| `Super Admin` | `/admin/dashboard` |
| `Sub Admin` | `/dashboard` |
| `Customer` | `/customer` |
| No user | `/login` |

### Route Table Overview

| Route | Access | Description |
|-------|--------|-------------|
| `/login` | Public | Login page |
| `/` | Public | `RoleRedirect` entry point |
| `/admin/...` | Super Admin | Dashboard, customer/vehicle/sub-admin/policy details |
| `/customer` | Customer | Customer home (inside `CustomerLayout` w/ bottom nav) |
| `/customer/car-clubs/...` | Customer | Club list, create, detail, resources |
| `/customer/policies/...` | Customer | Policy list, quote, documents, photos, receipt, claim, mechanic, detail |
| `/customer/profile/...` | Customer | Full profile + account details + legal sub-pages |
| `/customer/support` | Customer | Chat Support Widget (full-screen overlay) |
| `/dashboard/...` | Sub Admin | Sub Admin home, policy/vehicle/customer details |
| `*` | Public | Catch-all → redirects to `/` |

> **Key architectural decision:** The customer workspace is nested inside `CustomerLayout`, which renders `CustomerBottomNav` (Get insured / Car clubs / Policies / Profile). Full-screen flows (quote, purchase, chat support, incident add) intentionally live **outside** `CustomerLayout` so the bottom nav stays hidden on them (an "X-to-close" pattern).

---

## 🗃️ State Management

### Redux Toolkit
The store is configured in **`src/app/store.js`**:

```js
export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, profileApi.middleware),
});
```

- **`auth` slice** (`features/authSlice.js`) — holds the current user, persisted to `localStorage` under `cuvva_user`. Actions: `setCredentials` (login) and `logOut`. Selector: `selectCurrentUser`.
- **`useAuth()`** hook reads the auth slice from Redux.

### RTK Query
Server state is managed with RTK Query:

- **`authApi`** (`app/api/authApi.js`)
  - `useLoginMutation()` → `POST /api/auth/login`
  - `useLogoutUserMutation()` → `POST /api/auth/logout`
  - Uses `fetchBaseQuery` with `credentials: "include"` so httpOnly cookies are sent automatically.
- **`profileApi`** (`app/api/profileApi.js`)
  - `useGetMyProfileQuery()` → `GET /api/customers/me`
  - `useDeleteMyAccountMutation()` → `DELETE /api/customers/me`
  - `useUpdatePreferredNameMutation()`, `useAddAdditionalEmailMutation()`, `useUpdatePhoneNumberMutation()`, `useUpdateProfilePhotoMutation()` → `PATCH /api/customers/me`
  - Uses `tagTypes: ["Profile"]` with `providesTags`/`invalidatesTags` so profile data auto-refreshes after mutations.

### Axios httpClient + Auto Refresh
`app/api/httpClient.js` creates an Axios instance that:
- Points at `VITE_API_BASE_URL` (defaults to `http://localhost:3000`).
- Sends all requests with `withCredentials: true`.
- Registers a **401 response interceptor** that:
  1. Detects a `401` (but never for already-retried requests).
  2. Holds the original request.
  3. Calls `POST /api/auth/refresh-token` using the httpOnly `refreshToken` cookie.
  4. Retries the original request once; on failure it clears local auth and redirects to `/login`.

---

## 🔐 Environment Variables

Create a `.env` file in the **`frontend/`** root:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Base URL of the backend API | `http://localhost:3000` |

> **Note:** The app will fall back to `http://localhost:3000` when `VITE_API_BASE_URL` is not set. Because auth uses **httpOnly cookies**, no token or client secret is needed in the frontend env.

Optional dev conveniences baked into `vite.config.js`:
- `allowedHosts` → `.ngrok-free.dev` / `.ngrok-free.app` for testing on a real iPhone via ngrok.
- `hmr.clientPort` → `443` so HMR works through ngrok's secure tunnel.

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ (recommended: LTS)
- npm installed
- A running **backend** (see the Backend README) — typically `http://localhost:3000`

### Steps

```bash
# 1. Move into the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. (Optional) Configure the API base URL
#    Create a .env file and set:
#    VITE_API_BASE_URL=http://localhost:3000

# 4. Start the Vite dev server
npm run dev
```

Vite will print a local URL (usually `http://localhost:5173`). Open it in your browser.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## 🧪 Testing Roles

Log in with accounts created on the backend:

| Role | Typical access |
|------|----------------|
| **Super Admin** | `/admin/dashboard` — full platform control |
| **Sub Admin** | `/dashboard` — owns-scoped agent console |
| **Customer** | `/customer` — insured flow, clubs, policies, profile, chat support |

> The default **Super Admin** is seeded by the backend (`superadmin@cuvvaclone.com`).

