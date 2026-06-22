import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/shared/ProtectedRoute";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

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

          {/* Placeholder protected routes — we'll build real pages next */}
          <Route
            path="/guest/rooms"
            element={
              <ProtectedRoute allowedRoles={["guest"]}>
                <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
                  Guest Dashboard (placeholder)
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/receptionist/roster"
            element={
              <ProtectedRoute allowedRoles={["receptionist"]}>
                <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
                  Receptionist Dashboard (placeholder)
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/housekeeper/tasks"
            element={
              <ProtectedRoute allowedRoles={["housekeeper"]}>
                <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
                  Housekeeper Dashboard (placeholder)
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
                  Admin Dashboard (placeholder)
                </div>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;