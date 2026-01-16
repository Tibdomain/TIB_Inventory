import './App.css';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { NavBar } from './components/NavBar/NavBar';
import Home from './pages/Home/Home';
import QueryData from './pages/QueryData/QueryData';
import AddData from './pages/AddData/AddData';
import Assembly from './pages/Assembly/Assembly';
import LoginPage from './pages/LoginPage/LoginPage';
import AddVendorPage from './pages/VendorForm/VendorPage';

// This component will check the current location and conditionally render the NavBar
const AppContent = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <>
      {!isLoginPage && <NavBar />}
      <Routes>
  <Route path="/login" element={<LoginPage />} />
  
  {/* Protected routes */}
  <Route path="/" element={
    <ProtectedRoute>
      <Home />
    </ProtectedRoute>
  } />
  <Route path="/query-data" element={
    <ProtectedRoute>
      <QueryData />
    </ProtectedRoute>
  } />
  <Route path="/add-data" element={
    <ProtectedRoute>
      <AddData />
    </ProtectedRoute>
  } />
  <Route path="/assembly" element={
    <ProtectedRoute>
      <Assembly />
    </ProtectedRoute>
  } />
  {/* Add the vendor management route inside the Routes component */}
  <Route path="/vendor-management" element={
    <ProtectedRoute>
      <AddVendorPage />
    </ProtectedRoute>
  } />
</Routes>

    </>

    
  );
};

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
