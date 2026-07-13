import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider, ScrollRestoration } from 'react-router-dom'
import { MainLayout } from '@/layouts/MainLayout'
import { Loader } from '@/components/ui'

const HomePage       = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })))
const CatalogPage    = lazy(() => import('@/pages/CatalogPage').then((m) => ({ default: m.CatalogPage })))
const CategoryPage   = lazy(() => import('@/pages/CategoryPage').then((m) => ({ default: m.CategoryPage })))
const ProductPage    = lazy(() => import('@/pages/ProductPage').then((m) => ({ default: m.ProductPage })))
const CartPage       = lazy(() => import('@/pages/CartPage').then((m) => ({ default: m.CartPage })))
const WishlistPage   = lazy(() => import('@/pages/WishlistPage').then((m) => ({ default: m.WishlistPage })))
const AboutPage      = lazy(() => import('@/pages/AboutPage').then((m) => ({ default: m.AboutPage })))
const ContactsPage   = lazy(() => import('@/pages/ContactsPage').then((m) => ({ default: m.ContactsPage })))
const AuthPage       = lazy(() => import('@/pages/AuthPage').then((m) => ({ default: m.AuthPage })))
const ProfilePage    = lazy(() => import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })))
const CheckoutPage   = lazy(() => import('@/pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage })))
const AdminPage      = lazy(() => import('@/pages/AdminPage').then((m) => ({ default: m.AdminPage })))
const AuthCallbackPage = lazy(() =>
  import('@/pages/AuthCallbackPage').then((m) => ({ default: m.AuthCallbackPage })),
)
const NotFoundPage   = lazy(() => import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))

const PageFallback = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Loader size="lg" />
  </div>
)

function LayoutWithScroll() {
  return (
    <>
      <ScrollRestoration />
      <MainLayout />
    </>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <LayoutWithScroll />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageFallback />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: 'catalog',
        element: (
          <Suspense fallback={<PageFallback />}>
            <CatalogPage />
          </Suspense>
        ),
      },
      {
        path: 'catalog/:category',
        element: (
          <Suspense fallback={<PageFallback />}>
            <CategoryPage />
          </Suspense>
        ),
      },
      {
        path: 'catalog/:category/:subcategory',
        element: (
          <Suspense fallback={<PageFallback />}>
            <CategoryPage />
          </Suspense>
        ),
      },
      {
        path: 'product/:slug',
        element: (
          <Suspense fallback={<PageFallback />}>
            <ProductPage />
          </Suspense>
        ),
      },
      {
        path: 'cart',
        element: (
          <Suspense fallback={<PageFallback />}>
            <CartPage />
          </Suspense>
        ),
      },
      {
        path: 'wishlist',
        element: (
          <Suspense fallback={<PageFallback />}>
            <WishlistPage />
          </Suspense>
        ),
      },
      {
        path: 'about',
        element: (
          <Suspense fallback={<PageFallback />}>
            <AboutPage />
          </Suspense>
        ),
      },
      {
        path: 'contacts',
        element: (
          <Suspense fallback={<PageFallback />}>
            <ContactsPage />
          </Suspense>
        ),
      },
      {
        path: 'login',
        element: (
          <Suspense fallback={<PageFallback />}>
            <AuthPage />
          </Suspense>
        ),
      },
      {
        path: 'profile',
        element: (
          <Suspense fallback={<PageFallback />}>
            <ProfilePage />
          </Suspense>
        ),
      },
      {
        path: 'checkout',
        element: (
          <Suspense fallback={<PageFallback />}>
            <CheckoutPage />
          </Suspense>
        ),
      },
      {
        path: 'admin',
        element: (
          <Suspense fallback={<PageFallback />}>
            <AdminPage />
          </Suspense>
        ),
      },
      {
        path: 'auth/callback',
        element: (
          <Suspense fallback={<PageFallback />}>
            <AuthCallbackPage />
          </Suspense>
        ),
      },
      {
        path: '*',
        element: (
          <Suspense fallback={<PageFallback />}>
            <NotFoundPage />
          </Suspense>
        ),
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
