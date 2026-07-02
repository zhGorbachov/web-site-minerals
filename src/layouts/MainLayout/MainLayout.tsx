import { Outlet } from 'react-router-dom'
import { Header } from '../Header'
import { CatalogDrawer } from '../CatalogDrawer'
import { Footer } from '../Footer'
import styles from './MainLayout.module.scss'

export function MainLayout() {
  return (
    <div className={styles.layout}>
      <Header />
      <CatalogDrawer />
      <main className={styles.main} id="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
