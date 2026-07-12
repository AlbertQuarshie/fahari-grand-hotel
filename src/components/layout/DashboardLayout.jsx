import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";
import { body } from "../../constants/theme";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`h-screen bg-[#FAF8F3] overflow-hidden ${body}`}>
      {/* Navbar is fixed and spans the full width at the top of every page */}
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      {/* Sidebar + content sit below the fixed navbar's 64px height */}
      <div className="h-[calc(100vh-4rem)] mt-16 flex min-w-0 overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-6xl mx-auto">
            <Outlet />

            <footer className="mt-12 border-t border-[#0B1F3A]/10 pt-6 pb-2">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <p className="text-[#0B1F3A] text-xs font-semibold">
                  © {new Date().getFullYear()} Fahari Grand Hotel & Suites. All rights reserved.
                </p>
                <p className="text-[#C9A24B] text-xs italic font-semibold">
                  Where magnificence lives.
                </p>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;