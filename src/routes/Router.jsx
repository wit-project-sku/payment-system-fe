import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import KioskLayout from '@layouts/KioskLayout';
import AdminLayout from '@layouts/AdminLayout';

const ShopPage = lazy(() => import('@pages/shop/ShopPage'));

const ProductManagePage = lazy(() => import('@pages/admin/ProductManagePage'));
const PaymentHistoryPage = lazy(() => import('@pages/admin/PaymentHistoryPage'));
const IssueTrackerPage = lazy(() => import('@pages/admin/IssueTrackerPage'));
const LoginPage = lazy(() => import('@pages/admin/LoginPage'));

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

export default function AppRouter() {
  const kioskRoutes = [
    { path: 'shop', element: <ShopPage /> },
    { path: '*', element: <NotFoundPage /> },
  ];

  const adminRoutes = [
    { path: 'products', element: <ProductManagePage /> },
    { path: 'payments', element: <PaymentHistoryPage /> },
    { path: 'issues', element: <IssueTrackerPage /> },
    { path: 'login', element: <LoginPage /> },
    { path: '*', element: <NotFoundPage /> },
  ];

  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
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
          <Route path='*' element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
