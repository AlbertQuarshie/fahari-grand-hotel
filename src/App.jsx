import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";
import Navbar from "./components/layout/Navbar";
import { body } from "./constants/theme";
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import RoomsBrowse from "./pages/guest/RoomsBrowse";
import RoomDetail from "./pages/guest/RoomDetail";
import MyBookings from "./pages/guest/MyBookings";
import BookingPayment from "./pages/guest/BookingPayment";
import ReportIssue from "./pages/guest/ReportIssue";
import LeaveReview from "./pages/guest/LeaveReview";
import Roster from "./pages/receptionist/Roster";
import WalkInBooking from "./pages/receptionist/WalkInBooking";
import CheckInOut from "./pages/receptionist/CheckInOut";
import TaskList from "./pages/housekeeper/TaskList";
import AnalyticsDashboard from "./pages/admin/AnalyticsDashboard";
import RoomManagement from "./pages/admin/RoomManagement";
import StaffManagement from "./pages/admin/StaffManagement";
import ReviewModeration from "./pages/admin/ReviewModeration";
import MaintenanceOverview from "./pages/admin/MaintenanceOverview";
import ProfilePage from "./pages/profile/ProfilePage";

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Toaster position="top-right" />
        <Routes>
          {/* PUBLIC ROUTES — No authentication required */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* PUBLIC GUEST ROUTES — Browse rooms without login */}
          <Route element={<DashboardLayout />}>
            <Route path="/guest/rooms" element={<RoomsBrowse />} />
            <Route path="/guest/rooms/:id" element={<RoomDetail />} />
          </Route>

          {/* PROTECTED GUEST ROUTES — Requires authentication as guest */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["guest"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/guest/bookings" element={<MyBookings />} />
            <Route path="/guest/pay/:id" element={<BookingPayment />} />
            <Route path="/guest/report" element={<ReportIssue />} />
            <Route path="/guest/review" element={<LeaveReview />} />
          </Route>

          {/* PROFILE PAGE — Accessible to guest, receptionist, housekeeper */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["guest", "receptionist", "housekeeper"]}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* UNAUTHORIZED PAGE */}
          <Route
            path="/unauthorized"
            element={
              <div className={`min-h-screen bg-[#FAF8F3] ${body}`}>
                <Navbar />
                <div className="pt-16 min-h-screen flex items-center justify-center text-[#0B1F3A] font-bold">
                  You are not authorized to view this page.
                </div>
              </div>
            }
          />

          {/* PROTECTED RECEPTIONIST ROUTES */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["receptionist"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/receptionist/roster" element={<Roster />} />
            <Route path="/receptionist/walkin" element={<WalkInBooking />} />
            <Route path="/receptionist/checkinout" element={<CheckInOut />} />
          </Route>

          {/* PROTECTED HOUSEKEEPER ROUTES */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["housekeeper"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/housekeeper/tasks" element={<TaskList />} />
          </Route>

          {/* PROTECTED ADMIN ROUTES */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin/dashboard" element={<AnalyticsDashboard />} />
            <Route path="/admin/rooms" element={<RoomManagement />} />
            <Route path="/admin/staff" element={<StaffManagement />} />
            <Route path="/admin/reviews" element={<ReviewModeration />} />
            <Route path="/admin/maintenance" element={<MaintenanceOverview />} />
          </Route>

          {/* Catch-all — redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;