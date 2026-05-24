import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import FounderDashboard from './pages/FounderDashboard';
import ProductShowcasePage from './pages/ProductShowcasePage';
import AIInsightsPage from './pages/AIInsightsPage';
import UserProfilePage from './pages/UserProfilePage';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/founder" element={<FounderDashboard />} />
          <Route path="/product/:id" element={<ProductShowcasePage />} />
          <Route path="/product/:id/insights" element={<AIInsightsPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
