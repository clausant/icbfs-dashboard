import React from "react";
import { Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/dashboard/DashboardPage";
import Home from "./pages/home/Home";
import ProtectedRoute from "./components/common/ProtectedRoute";
import ErrorPage from "./pages/ErrorPage";

function App() {
  return (
    <main style={{ minHeight: '100vh' }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </main>
  );
}

export default App;