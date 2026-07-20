import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "@/features/auth/login-page";
import { RegisterPage } from "@/features/auth/register-page";
import { DashboardPage } from "@/features/dashboard/dashboard-page";
import { TransactionsPage } from "@/features/transactions/transactions-page";
import { CardsPage } from "@/features/cards/cards-page";
import { SettingsPage } from "@/features/settings/settings-page";
import { ProtectedRoute } from "@/routes/protected-route";
import { Layout } from "@/components/layout";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/cards" element={<CardsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
