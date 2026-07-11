import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import MobileBottomNav from './components/MobileBottomNav';
import CreateNewModal from './components/CreateNewModal';
import Toast from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import VerifiedOnly from './components/VerifiedOnly';
import IntroSplash from './components/IntroSplash';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import GeneralMarket from './pages/GeneralMarket';
import CollegeMarket from './pages/CollegeMarket';
import ProductDetails from './pages/ProductDetails';
import CreateListing from './pages/CreateListing';
import Profile from './pages/Profile';
import Vendors from './pages/Vendors';
import Orders from './pages/Orders';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Chat from './pages/Chat';
import Notifications from './pages/Notifications';

// Layout wrapper to inject Navbar & BottomNav
const AppLayout = ({ children }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const location = useLocation();

  // Check if we are currently inside an active chat thread on mobile
  const searchParams = new URLSearchParams(location.search);
  const isChatActive = location.pathname.startsWith('/chat') && searchParams.get('conversationId');

  return (
    <div className="min-h-screen bg-white flex flex-col antialiased">
      {/* Intro video splash screen overlay (Mobile Only) */}
      <IntroSplash />

      {/* Desktop + Mobile Header */}
      <Navbar />

      {/* Main Page Panel */}
      <main className="flex-1 w-full">
        {children}
      </main>

      {/* Mobile Floating Bottom Bar - Hide inside active chat thread */}
      {!isChatActive && (
        <MobileBottomNav isCreateOpen={isCreateOpen} setIsCreateOpen={setIsCreateOpen} />
      )}

      {/* Global Center Modal */}
      <CreateNewModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      
      {/* Toast Notification overlay */}
      <Toast />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            {/* Market Browse Pages */}
            <Route path="/" element={<Home />} />
            <Route path="/general-market" element={<GeneralMarket />} />
            <Route 
              path="/college-market" 
              element={
                <ProtectedRoute>
                  <CollegeMarket />
                </ProtectedRoute>
              } 
            />
            <Route path="/listing/:id" element={<ProductDetails />} />

            {/* Creation (requires verification) */}
            <Route 
              path="/listing/new" 
              element={
                <ProtectedRoute>
                  <VerifiedOnly>
                    <CreateListing />
                  </VerifiedOnly>
                </ProtectedRoute>
              } 
            />

            {/* Auth Flows */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/chat" 
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/notifications" 
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              } 
            />

            {/* Stubs / Coming Soon */}
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/orders" element={<Orders />} />

            {/* Admin Management */}
            <Route path="/dev/admin-simulator" element={<AdminLogin />} />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Redirect fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
