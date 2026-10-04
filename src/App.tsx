import { Routes, Route, Navigate } from "react-router-dom";
import { ScrollManager } from "./lib/scroll";
import { SmoothScroll } from "./components/SmoothScroll";
import { RouteTransition } from "./components/RouteTransition";
import { HomePage } from "./pages/HomePage";
import { AboutPage } from "./pages/AboutPage";
import { ResearchPage } from "./pages/ResearchPage";
import { TeamsPage } from "./pages/TeamsPage";
import { EventsPage } from "./pages/EventsPage";
import { MembersPage } from "./pages/MembersPage";
import { JoinPage } from "./pages/JoinPage";
import { AdminPage } from "./pages/AdminPage";
import { QConnectPage } from "./pages/QConnectPage";
import { QConnectRegisterPage } from "./pages/QConnectRegisterPage";
import { QConnectSuccessPage, QConnectFailurePage } from "./pages/QConnectResultPages";

export default function App() {
  return (
    <>
      <SmoothScroll />
      <ScrollManager />
      <RouteTransition>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/research" element={<ResearchPage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/join" element={<JoinPage />} />
          <Route path="/admin" element={<AdminPage />} />
          {/* Q-Connect — open 2nd event */}
          <Route path="/qconnect" element={<QConnectPage />} />
          <Route path="/qconnect/register" element={<QConnectRegisterPage />} />
          <Route path="/qconnect/success" element={<QConnectSuccessPage />} />
          <Route path="/qconnect/failure" element={<QConnectFailurePage />} />
          {/* Legacy secret path → open canonical URLs */}
          <Route path="/transmission" element={<Navigate to="/qconnect" replace />} />
          <Route path="/transmission/register" element={<Navigate to="/qconnect/register" replace />} />
          <Route path="/transmission/success" element={<Navigate to="/qconnect/success" replace />} />
          <Route path="/transmission/failure" element={<Navigate to="/qconnect/failure" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </RouteTransition>
    </>
  );
}
