import { Navigate, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import Steganography from "./dashboard/Steganography";
import Steganalysis from "./dashboard/Steganalysis";
import History from "./dashboard/History";
import DashboardSettings from "./dashboard/Settings";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard/steganography" replace />} />
        <Route path="/steganography" element={<Steganography />} />
        <Route path="/steganalysis" element={<Steganalysis />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<DashboardSettings />} />
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard;
