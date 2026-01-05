import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/context/AuthContext";

// Layout Components
import Navbar from "@/components/Navbar";

// Pages - Public/Auth
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AuthSuccess from "@/pages/AuthSuccess";
import EventDetails from "@/pages/EventDetails";
import ForgotPassword from "@/pages/ForgotPassword";
// Pages - Protected
import MyBookings from "@/pages/MyBookings";
import PaymentSuccess from "@/pages/PaymentSuccess";
import Profile from "@/pages/Profile";

// Pages - Admin
import CreateEvent from "@/pages/admin/CreateEvent";
import AdminDashboard from "@/pages/admin/Dashboard";
import VerifyTicket from "@/pages/admin/VerifyTicket";
import ManageEvents from "@/pages/admin/ManageEvents";
import EditEvent from "@/pages/admin/EditEvent";
const queryClient = new QueryClient();

// --- Route Guards ---

// 1. Protected Route: Only for logged-in users
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// 2. Public Route: Only for guests (Redirects to Home if logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/" /> : children;
};

// 3. Admin Route: Only for ADMIN or ORGANIZER roles
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Check Role (Adjust "ADMIN" string based on your exact backend enum)
  if (user?.role !== "ADMIN" && user?.role !== "ORGANIZER") {
    return <Navigate to="/" />; // Redirect unauthorized users to Home
  }

  return children;
};

// --- Main App Component ---

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          {/* Global Navbar (Visible on all pages) */}
          <Navbar />

          <main className="min-h-[calc(100vh-4rem)]">
            <Routes>
              {/* --- Authentication Routes (Guests Only) --- */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />
              <Route
                path="/auth/success"
                element={
                  <PublicRoute>
                    <AuthSuccess />
                  </PublicRoute>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <PublicRoute>
                    <ForgotPassword />
                  </PublicRoute>
                }
              />

              {/* --- Public Routes (Accessible by everyone) --- */}
              <Route path="/" element={<Home />} />
              <Route path="/events/:id" element={<EventDetails />} />

              {/* --- Protected Routes (Logged-in Users Only) --- */}
              <Route
                path="/bookings"
                element={
                  <ProtectedRoute>
                    <MyBookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payment/success"
                element={
                  <ProtectedRoute>
                    <PaymentSuccess />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* --- Admin Routes (Admin/Organizer Only) --- */}
              <Route
                path="/admin/create-event"
                element={
                  <AdminRoute>
                    <CreateEvent />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/verify"
                element={
                  <AdminRoute>
                    <VerifyTicket />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/events"
                element={
                  <AdminRoute>
                    <ManageEvents />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/events/edit/:id"
                element={
                  <AdminRoute>
                    <EditEvent />
                  </AdminRoute>
                }
              />
            </Routes>
          </main>

          {/* Global Toast Notifications */}
          <Toaster position="top-right" richColors />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
