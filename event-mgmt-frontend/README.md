<div align="center">

# 🎟️ Event Management & Ticket Booking System (Frontend)
### Modern React Client | Vite | TanStack Query | Tailwind CSS

A robust, high-performance frontend interface for the Event Booking Platform.
Features **interactive seat mapping**, **JWT authentication with auto-refresh**, and **integrated payment gateways**.

<!-- Badges -->
<p>
  <img src="https://img.shields.io/badge/Vite-Fast_Build-646CFF?style=flat&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/React-v18-61DAFB?style=flat&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-Styling-38B2AC?style=flat&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/TanStack_Query-Async_State-FF4154?style=flat&logo=react-query&logoColor=white" alt="TanStack Query" />
  <img src="https://img.shields.io/badge/Axios-Networking-5A29E4?style=flat&logo=axios&logoColor=white" alt="Axios" />
</p>

---
</div>

## 🚀 Key Features

### 👤 **Authentication & Profile**
*   **Secure Auth:** JWT handling with **automatic token rotation** via Axios interceptors.
*   **Google OAuth:** Seamless login integration.
*   **Profile Management:** Update avatar (Multer compatible), change password, and real-time state sync.

### 🎫 **Event & Booking Experience**
*   **Interactive Seat Selection:** Visual grid system (Red: Booked, White: Available, Primary: Selected).
*   **Rich Details:** Image galleries and comprehensive event information.
*   **Optimistic Updates:** UI reflects changes instantly while syncing with the server.

### 💳 **Payments & Orders**
*   **My Bookings:** dedicated dashboard to view ticket status (`PENDING`, `COMPLETED`).
*   **Integrated Gateways:**
    *   **Khalti** (eWallet)
    *   **PayPal**
*   **Workflow:** Atomic booking creation $\rightarrow$ Payment Gateway $\rightarrow$ Success/Ticket Generation.

---

## 🧰 Tech Stack

| Category | Technology | Usage |
| :--- | :--- | :--- |
| **Core** | Vite + React (JS) | Fast development environment and UI library. |
| **Styling** | Tailwind CSS + Shadcn/UI | Responsive design and accessible components. |
| **Server State** | TanStack Query (v5) | Caching, synchronization, and server state management. |
| **Client State** | Context API | Global Auth Session and User Profile synchronization. |
| **Networking** | Axios | Centralized HTTP client with interceptors and retry queues. |
| **Routing** | React Router DOM v6 | Client-side routing and protected route guards. |

---

## 🔧 Engineering Highlights

### 1. Robust Axios Interceptors
We handle access token expiration automatically without disrupting the user experience.
*   **401 Detection:** Intercepts unauthorized errors.
*   **Token Refresh:** Calls `/refresh`, updates the header.
*   **Retry Queue:** Failed requests are paused, queued, and re-executed once the new token is acquired.

### 2. State Synchronization
*   **Data Extraction:** Helper utilities handle nested API responses robustly (e.g., `data?.data?.events || []`).
*   **Auth Sync:** When a user updates their profile (`PATCH /users/me`), the `AuthContext` is immediately updated to reflect changes in the UI (Navbar, Sidebar) without a reload.

### 3. Form Handling
*   **Multipart/Form-Data:** Used for Avatar and Event Banner uploads.
*   **Complex Data:** JSON arrays (like seat configurations) are stringified before being appended to `FormData`.

---

## 📁 Project Structure

```text
src/
├── api/
│   ├── axios.js         # Base config + Interceptors + Retry Queue
│   ├── auth.js          # Login, Register, Google OAuth
│   ├── bookings.js      # Booking CRUD operations
│   ├── events.js        # Event fetching & details
│   ├── payment.js       # Gateway integration logic
│   └── user.js          # Profile & Password management
├── components/
│   ├── ui/              # Reusable Shadcn components
│   ├── EventCard.jsx    # Display card for event lists
│   └── Navbar.jsx       # Auth-aware navigation bar
├── context/
│   └── AuthContext.jsx  # Context Provider (Session + User Sync)
├── hooks/
│   ├── useAuthMutations.js # React Query mutations for Auth
│   ├── useBookings.js      # Hooks for fetching bookings
│   ├── useEvents.js        # Hooks for event data
│   └── usePayment.js       # Payment processing hooks
├── pages/
│   ├── Home.jsx            # Landing page (Event Grid)
│   ├── Login.jsx           # Sign In Form
│   ├── Register.jsx        # Sign Up Form
│   ├── EventDetails.jsx    # Seat Map & Event Info
│   ├── MyBookings.jsx      # Order history & Payment Actions
│   ├── PaymentSuccess.jsx  # Post-payment landing
│   └── Profile.jsx         # User settings (Tabs)
└── App.jsx                 # Route definitions & Guard logic
🔄 Booking & Payment Flow
code
Mermaid
graph LR
    A[User] --> B(Select Seats)
    B --> C{Create Booking}
    C -->|Success| D[My Bookings (Pending)]
    D --> E[Select Payment Method]
    E -->|Khalti/PayPal| F[Payment Gateway]
    F -->|Success| G[Backend Webhook]
    F -->|Redirect| H[Payment Success Page]
    H --> I[Ticket Generated]
▶️ Getting Started
Prerequisites
Node.js v18+
Backend Server Running on Port 8000
Installation
Clone the repository
code
Bash
git clone https://github.com/yourusername/event-frontend.git
cd event-frontend
Install dependencies
code
Bash
npm install
Environment Setup
Create a .env file in the root directory:
code
Bash
VITE_API_URL=http://localhost:8000/v1
Start Development Server
code
Bash
npm run dev
Access the application at http://localhost:5173
