import { useEffect } from 'react'
import { AppRouter } from '@/router'
import { useAuthStore, useCartStore, useWishlistStore } from '@/store'

export default function App() {
  const bootstrap = useAuthStore((s) => s.bootstrap)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    void bootstrap()
  }, [bootstrap])

  useEffect(() => {
    if (!user) return
    void useCartStore.getState().pullFromServer()
    void useWishlistStore.getState().pullFromServer()
  }, [user])

  return <AppRouter />
}
