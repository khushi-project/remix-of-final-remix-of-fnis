import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { NutritionProvider } from "@/context/NutritionContext";
import AdminRoute from "@/components/AdminRoute";
import RoleRoute from "@/components/RoleRoute";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MealPlanner from "./pages/MealPlanner";
import Workouts from "./pages/Workouts";
import About from "./pages/About";
import AdminDashboard from "./pages/AdminDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import TrainerDashboard from "./pages/TrainerDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NutritionProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/client-dashboard" element={<RoleRoute role="client"><ClientDashboard /></RoleRoute>} />
              <Route path="/trainer-dashboard" element={<RoleRoute role="trainer"><TrainerDashboard /></RoleRoute>} />
              <Route path="/meals" element={<ProtectedRoute><MealPlanner /></ProtectedRoute>} />
              <Route path="/workouts" element={<ProtectedRoute><Workouts /></ProtectedRoute>} />
              <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
              <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </NutritionProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
