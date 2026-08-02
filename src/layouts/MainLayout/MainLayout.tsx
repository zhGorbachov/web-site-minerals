import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from '../Header'
import { CatalogDrawer } from '../CatalogDrawer'
import { Footer } from '../Footer'
import { ToastStack } from '@/components/ui'
import { useLanguageStore } from '@/store/languageStore'
import styles from './MainLayout.module.scss'

export function MainLayout() {
  const language = useLanguageStore((state) => state.language)

  useEffect(() => {
    document.documentElement.lang = language === 'uk' ? 'uk' : 'en'
  }, [language])

  return (
    <div className={styles.layout}>
      <Header />
      <CatalogDrawer />
      <main className={styles.main} id="main-content">
        <Outlet />
      </main>
      <Footer />
      <ToastStack />
    </div>
  )
}
