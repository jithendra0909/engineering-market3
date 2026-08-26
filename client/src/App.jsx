import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';

// Core UI Components (Eagerly loaded)
import Navbar from './components/Navbar';
import MobileBottomNav from './components/MobileBottomNav';
import CreateNewModal from './components/CreateNewModal';
import Toast from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import VerifiedOnly from './components/VerifiedOnly';
import IntroSplash from './components/IntroSplash';
import FeedbackWidget from './components/FeedbackWidget';
import PWAInstallPrompt from './components/PWAInstallPrompt';

// Public Crawlable & Core Marketplace Pages (Eagerly loaded for instant SEO & UX)
import Home from './pages/Home';
import GeneralMarket from './pages/GeneralMarket';
import CollegeMarket from './pages/CollegeMarket';
import ProductDetails from './pages/ProductDetails';
import Vendors from './pages/Vendors';
import GiftStudio from './pages/GiftStudio';
import GiftStudioProducts from './pages/GiftStudioProducts';
import GiftProductDetails from './pages/GiftProductDetails';
import NotFound from './pages/NotFound';

// Code-split Secondary / Auth / Dashboard Pages (Lazy loaded for Core Web Vitals performance)
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const CreateListing = lazy(() => import('./pages/CreateListing'));
const Profile = lazy(() => import('./pages/Profile'));
const Chat = lazy(() => import('./pages/Chat'));
const Notifications = lazy(() => import('./pages/Notifications'));
const FeedbackRoadmap = lazy(() => import('./pages/FeedbackRoadmap'));
const PrintDashboard = lazy(() => import('./pages/PrintDashboard'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Minimal Suspense fallback spinner
const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-8 h-8 border-3 border-[#6D3FD6] border-t-transparent rounded-full animate-spin" />
  </div>
);

// Layout wrapper to inject Navbar & BottomNav
const AppLayout = ({ children }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const location = useLocation();

  // Check if we are currently inside an active chat thread on mobile
  const searchParams = new URLSearchParams(location.search);
  const isChatActive = location.pathname.startsWith('/chat') && searchParams.get('conversationId');

  return (
    <div className="min-h-screen bg-white flex flex-col antialiased">
      {/* Animated intro splash screen overlay */}
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

      {/* Floating feedback button & drawer widget */}
      <FeedbackWidget />

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
};

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppLayout>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Marketplace Browse Pages */}
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
                <Route path="/listing/:id/:slug" element={<ProductDetails />} />

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
                      <VerifiedOnly>
                        <Chat />
                      </VerifiedOnly>
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
                <Route 
                  path="/feedback-roadmap" 
                  element={
                    <ProtectedRoute>
                      <FeedbackRoadmap />
                    </ProtectedRoute>
                  } 
                />

                {/* Public Vendors & Gift Studio */}
                <Route path="/vendors" element={<Vendors />} />
                <Route path="/vendors/gift-studio" element={<GiftStudio />} />
                <Route path="/gift-studio/products" element={<GiftStudioProducts />} />
                <Route path="/gift-studio/product/:id" element={<GiftProductDetails />} />
                <Route path="/gift-studio/product/:id/:slug" element={<GiftProductDetails />} />
                <Route path="/vendors/print-studio" element={<Navigate to="/vendors" replace />} />
                <Route path="/orders" element={<Navigate to="/vendors" replace />} />
                <Route 
                  path="/vendors/print-dashboard" 
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <PrintDashboard />
                    </ProtectedRoute>
                  } 
                />

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

                {/* 404 Catch-All (Proper SEO & UX instead of silent home redirect) */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AppLayout>
        </BrowserRouter>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
