import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context';
import { Layout } from './components/Layout';
import { Toasts } from './components/ui';
import { Login, Register } from './pages/Auth';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminUsers } from './pages/AdminUsers';
import { AdminPublications } from './pages/AdminPublications';
import { Profile } from './pages/Profile';
import { UserDashboard } from './pages/UserDashboard';
import { MyTrips } from './pages/MyTrips';
import { NewTrip } from './pages/NewTrip';
import { TripDetail } from './pages/TripDetail';
import { Followers } from './pages/Followers';
import { Notifications } from './pages/Notifications';

function ProtectedRoute({ children, admin = false }: { children: React.ReactNode; admin?: boolean }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace/>;
  if (admin && user.role !== 'admin') return <Navigate to="/dashboard" replace/>;
  if (!admin && user.role === 'admin') return <Navigate to="/admin/dashboard" replace/>;
  return <>{children}</>;
}

function RootRedirect() {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace/>;
  return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace/>;
}

function AppInner() {
  const { toasts } = useApp();
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route element={<Layout/>}>
          <Route path="/admin/dashboard" element={<ProtectedRoute admin><AdminDashboard/></ProtectedRoute>}/>
          <Route path="/admin/utilizadores" element={<ProtectedRoute admin><AdminUsers/></ProtectedRoute>}/>
          <Route path="/admin/publicacoes" element={<ProtectedRoute admin><AdminPublications/></ProtectedRoute>}/>
          <Route path="/admin/perfil" element={<ProtectedRoute admin><Profile admin/></ProtectedRoute>}/>

          <Route path="/dashboard" element={<ProtectedRoute><UserDashboard/></ProtectedRoute>}/>
          <Route path="/viagens" element={<ProtectedRoute><MyTrips/></ProtectedRoute>}/>
          <Route path="/viagens/nova" element={<ProtectedRoute><NewTrip/></ProtectedRoute>}/>
          <Route path="/viagens/:id" element={<ProtectedRoute><TripDetail/></ProtectedRoute>}/>
          <Route path="/seguidores" element={<ProtectedRoute><Followers/></ProtectedRoute>}/>
          <Route path="/perfil" element={<ProtectedRoute><Profile/></ProtectedRoute>}/>
          <Route path="/notificacoes" element={<ProtectedRoute><Notifications/></ProtectedRoute>}/>
        </Route>
        <Route path="/" element={<RootRedirect/>}/>
        <Route path="*" element={<RootRedirect/>}/>
      </Routes>
      <Toasts toasts={toasts}/>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppInner/>
      </BrowserRouter>
    </AppProvider>
  );
}
