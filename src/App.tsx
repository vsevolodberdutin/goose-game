import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthPage } from "./pages/AuthPage";
import { RoundsListPage } from "./pages/RoundsListPage";
import { RoundDetailPage } from "./pages/RoundDetailPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/rounds" element={<RoundsListPage />} />
        <Route path="/rounds/:id" element={<RoundDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
