import { Routes, Route, Navigate } from "react-router-dom";
import { ScrollManager } from "./lib/scroll";
import { HomePage } from "./pages/HomePage";
import { AboutPage } from "./pages/AboutPage";
import { ResearchPage } from "./pages/ResearchPage";
import { TeamsPage } from "./pages/TeamsPage";
import { EventsPage } from "./pages/EventsPage";
import { MembersPage } from "./pages/MembersPage";
import { JoinPage } from "./pages/JoinPage";
import { AdminPage } from "./pages/AdminPage";

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/research" element={<ResearchPage />} />
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/members" element={<MembersPage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}