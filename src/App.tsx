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
          {/* Secret reveal route — Q-Connect details live ONLY here */}
          <Route path="/transmission" element={<QConnectPage />} />
          <Route path="/transmission/register" element={<QConnectRegisterPage />} />
          <Route path="/transmission/success" element={<QConnectSuccessPage />} />
          <Route path="/transmission/failure" element={<QConnectFailurePage />} />
          {/* Legacy guessable URLs → obscure secret path */}
          <Route path="/qconnect" element={<Navigate to="/transmission" replace />} />
          <Route path="/qconnect/register" element={<Navigate to="/transmission/register" replace />} />
          <Route path="/qconnect/success" element={<Navigate to="/transmission/success" replace />} />
          <Route path="/qconnect/failure" element={<Navigate to="/transmission/failure" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </RouteTransition>
    </>
  );
}
