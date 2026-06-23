import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import RoomsBrowse from "./pages/guest/RoomsBrowse";
import RoomDetail from "./pages/guest/RoomDetail";
import MyBookings from "./pages/guest/MyBookings";
import BookingPayment from "./pages/guest/BookingPayment";

const Placeholder = ({ title }) => (
  <div className="flex items-center justify-center h-64">
    <p className="text-slate-400 text-lg">{title} — coming soon</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/unauthorized"
            element={
              <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
                You are not authorized to view this page.
              </div>
            }
          />

          {/* Guest routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["guest"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/guest/rooms" element={<RoomsBrowse />} />
            <Route path="/guest/rooms/:id" element={<RoomDetail />} />
            <Route path="/guest/bookings" element={<MyBookings />} />
            <Route path="/guest/pay/:id" element={<BookingPayment />} />
          </Route>

          {/* Receptionist routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["receptionist"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/receptionist/roster" element={<Placeholder title="Roster" />} />
            <Route path="/receptionist/walkin" element={<Placeholder title="Walk-in Booking" />} />
            <Route path="/receptionist/checkinout" element={<Placeholder title="Check In / Out" />} />
          </Route>

          {/* Housekeeper routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["housekeeper"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/housekeeper/tasks" element={<Placeholder title="My Tasks" />} />
          </Route>

          {/* Admin routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin/dashboard" element={<Placeholder title="Admin Dashboard" />} />
            <Route path="/admin/rooms" element={<Placeholder title="Room Management" />} />
            <Route path="/admin/staff" element={<Placeholder title="Staff Management" />} />
            <Route path="/admin/reviews" element={<Placeholder title="Review Moderation" />} />
            <Route path="/admin/maintenance" element={<Placeholder title="Maintenance" />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;