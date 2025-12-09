import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import KioskLayout from '@layouts/KioskLayout';
import AdminLayout from '@layouts/AdminLayout';
import MobileLayout from '@layouts/MobileLayout';

const StorePage = lazy(() => import('@pages/store/StorePage'));

const ProductManagePage = lazy(() => import('@pages/admin/ProductManagePage'));
const PaymentHistoryPage = lazy(() => import('@pages/admin/PaymentHistoryPage'));
const IssueTrackerPage = lazy(() => import('@pages/admin/IssueTrackerPage'));
const LoginPage = lazy(() => import('@pages/admin/LoginPage'));

const MobileMainPage = lazy(() => import('@pages/mobile/MobileMainPage'));
const SearchPage = lazy(() => import('@pages/mobile/SearchPage'));
const OptionPage = lazy(() => import('@pages/mobile/OptionPage'));
const AddressPage = lazy(() => import('@pages/mobile/AddressPage'));
const DeliveryPage = lazy(() => import('@pages/mobile/DeliveryPage'));
const RefundPage = lazy(() => import('@pages/mobile/RefundPage'));

const NotFoundPage = lazy(() => import('@pages/NotFound/NotFound'));

const PageLoader = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '16px',
      color: '#666',
    }}
  >
    페이지를 불러오는 중...
  </div>
);

function AddressGuard({ children }) {
  const location = useLocation();
  const allowed = location.state && location.state.fromOption === true;
  return allowed ? children : <Navigate to='/mobile' replace />;
}

function AdminGuard({ children }) {
  const isAdmin = localStorage.getItem('admin-auth') === 'true';
  return isAdmin ? children : <Navigate to='/admin/login' replace />;
}

export default function AppRouter() {
  const kioskRoutes = [
    { path: 'store', element: <StorePage /> },
    { path: '*', element: <Navigate to='/mobile' replace /> },
  ];

  const adminRoutes = [
    {
      path: 'products',
      element: (
        <AdminGuard>
          <ProductManagePage />
        </AdminGuard>
      ),
    },
    {
      path: 'payments',
      element: (
        <AdminGuard>
          <PaymentHistoryPage />
        </AdminGuard>
      ),
    },
    {
      path: 'issues',
      element: (
        <AdminGuard>
          <IssueTrackerPage />
        </AdminGuard>
      ),
    },
    { path: 'login', element: <LoginPage /> },
    { path: '*', element: <Navigate to='/mobile' replace /> },
  ];

  const mobileRoutes = [
    { path: '', element: <MobileMainPage /> },
    {
      path: 'option',
      element: (
        <AddressGuard>
          <OptionPage />
        </AddressGuard>
      ),
    },
    { path: 'search', element: <SearchPage /> },
    {
      path: 'address',
      element: (
        <AddressGuard>
          <AddressPage />
        </AddressGuard>
      ),
    },
    {
      path: 'delivery',
      element: (
        <AddressGuard>
          <DeliveryPage />
        </AddressGuard>
      ),
    },
    { path: 'refund', element: <RefundPage /> },
    { path: '*', element: <NotFoundPage /> },
  ];

  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path='/' element={<Navigate to='/mobile' replace />} />
          <Route path='/kiosk/*' element={<KioskLayout />}>
            {kioskRoutes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
          </Route>

          <Route path='/admin/*' element={<AdminLayout />}>
            {adminRoutes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
          </Route>

          <Route path='/mobile/*' element={<MobileLayout />}>
            {mobileRoutes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
          </Route>
          <Route path='*' element={<Navigate to='/mobile' replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
