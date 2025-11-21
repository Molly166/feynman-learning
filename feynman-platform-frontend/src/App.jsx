// src/App.jsx
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import KnowledgePointFormPage from "./pages/KnowledgePointFormPage";
import VoiceLearningPage from "./pages/VoiceLearningPage";
import AIPolishPage from "./pages/AIPolishPage";
import QuizPage from "./pages/QuizPage";
import AgentPage from "./pages/AgentPage";
import GraphPage from "./pages/GraphPage";
import ThreeJSPage from "./pages/ThreeJSPage";
import KnowledgeUniversePage from "./pages/KnowledgeUniversePage";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import WelcomePage from './pages/WelcomePage';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/kp/new" element={<KnowledgePointFormPage />} />
          <Route path="/kp/edit/:id" element={<KnowledgePointFormPage />} />
          <Route path="/voice-learning/:id" element={<VoiceLearningPage />} />
          <Route path="/quiz/:id" element={<QuizPage />} />
          <Route path="/ai" element={<AIPolishPage />} />
          <Route path="/agent" element={<AgentPage />} />
          <Route path="/graph" element={<GraphPage />} />
          <Route path="/3d-world" element={<ThreeJSPage />} />
          <Route path="/knowledge-universe" element={<KnowledgeUniversePage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
