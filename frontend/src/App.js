import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Pages
import SplashScreen from './pages/SplashScreen';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/customer/HomePage';
import MenuPage from './pages/customer/MenuPage';
import FoodDetailPage from './pages/customer/FoodDetailPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrderConfirmPage from './pages/customer/OrderConfirmPage';
import OrderTrackingPage from './pages/customer/OrderTrackingPage';
import OrderHistoryPage from './pages/customer/OrderHistoryPage';
import ProfilePage from './pages/customer/ProfilePage';

import OwnerDashboard from './pages/owner/OwnerDashboard';
import OwnerOrders from './pages/owner/OwnerOrders';
import OwnerMenu from './pages/owner/OwnerMenu';
import OwnerAddItem from './pages/owner/OwnerAddItem';

import BottomNav from './components/common/BottomNav';
import TopNav from './components/common/TopNav';

const CustomerRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'customer') return <Navigate to="/owner/dashboard" />;
  return children;
};

const OwnerRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'owner') return <Navigate to="/home" />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to={user.role === 'owner' ? '/owner/dashboard' : '/home'} />;
  return children;
};

function AppLayout() {
  const { user } = useAuth();

  return (
    <>
      {user && <TopNav />}
      <Routes>
        <Route path="/" element={<PublicRoute><SplashScreen /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

        <Route path="/home" element={<CustomerRoute><HomePage /></CustomerRoute>} />
        <Route path="/menu" element={<CustomerRoute><MenuPage /></CustomerRoute>} />
        <Route path="/food/:id" element={<CustomerRoute><FoodDetailPage /></CustomerRoute>} />
        <Route path="/cart" element={<CustomerRoute><CartPage /></CustomerRoute>} />
        <Route path="/checkout" element={<CustomerRoute><CheckoutPage /></CustomerRoute>} />
        <Route path="/order-confirm/:id" element={<CustomerRoute><OrderConfirmPage /></CustomerRoute>} />
        <Route path="/order-tracking/:id" element={<CustomerRoute><OrderTrackingPage /></CustomerRoute>} />
        <Route path="/orders" element={<CustomerRoute><OrderHistoryPage /></CustomerRoute>} />
        <Route path="/profile" element={<CustomerRoute><ProfilePage /></CustomerRoute>} />

        <Route path="/owner/dashboard" element={<OwnerRoute><OwnerDashboard /></OwnerRoute>} />
        <Route path="/owner/orders" element={<OwnerRoute><OwnerOrders /></OwnerRoute>} />
        <Route path="/owner/menu" element={<OwnerRoute><OwnerMenu /></OwnerRoute>} />
        <Route path="/owner/menu/add" element={<OwnerRoute><OwnerAddItem /></OwnerRoute>} />
        <Route path="/owner/menu/edit/:id" element={<OwnerRoute><OwnerAddItem /></OwnerRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {user && user.role === 'customer' && <BottomNav />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster position="top-center" toastOptions={{ duration: 3000, style: { background: '#1e1e2a', color: '#f0f0f5', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', fontFamily: "'DM Sans', sans-serif" } }} />
          <AppLayout />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
