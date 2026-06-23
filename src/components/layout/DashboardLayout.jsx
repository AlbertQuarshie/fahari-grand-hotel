import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />

          {/* Footer */}
          <footer className="mt-12 border-t border-slate-800 pt-6 pb-2">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-slate-600 text-xs">
                © {new Date().getFullYear()} Fahari Grand Hotel & Suites. All rights reserved.
              </p>
              <p className="text-slate-700 text-xs italic">
                Where magnificence lives.
              </p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;