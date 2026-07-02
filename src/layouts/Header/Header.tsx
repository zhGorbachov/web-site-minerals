import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, Search, User, Heart, ShoppingCart, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore, useUIStore } from '@/store'
import { CartBadge } from '@/components/ui'
import { useScrollLock } from '@/hooks/useScrollLock'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { isHashNavLinkActive } from '@/utils/hashNav'
import { SITE_NAME } from '@/config/Site'
import styles from './Header.module.scss'

const NAV_LINKS = [
  { label: 'Головна', to: '/' },
  { label: 'Каталог', to: '/catalog' },
  { label: 'Про нас', to: '/about' },
  { label: 'Контакти', to: '/contacts' },
]

const MOBILE_NAV_LINKS = [
  { label: 'Про нас', to: '/about' },
  { label: 'Доставка і оплата', to: '/about#delivery' },
  { label: 'Обмін та повернення', to: '/about#returns' },
  { label: 'Відгуки', to: '/about#reviews' },
  { label: 'Контактна інформація', to: '/contacts' },
]

function getMenuEndpoint(to: string) {
  return to.split('#')[0]
}

const DESKTOP_SEARCH_WIDTH = 220
const SEARCH_TRANSITION = { duration: 0.22, ease: [0.4, 0, 0.2, 1] as const }
const MOBILE_HEADER_SPRING = { type: 'spring' as const, stiffness: 400, damping: 34, mass: 0.8 }
const MOBILE_SEARCH_SPRING = { type: 'spring' as const, stiffness: 340, damping: 30, mass: 0.85 }

const mobileSearchOverlayVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.055, delayChildren: 0.05 },
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.04, staggerDirection: -1, when: 'afterChildren' as const },
  },
}

const mobileSearchCloseVariants = {
  hidden: { opacity: 0, x: -18, rotate: -90, scale: 0.7 },
  visible: {
    opacity: 1,
    x: 0,
    rotate: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 500, damping: 28 },
  },
  exit: {
    opacity: 0,
    x: -14,
    rotate: -45,
    scale: 0.8,
    transition: { duration: 0.16, ease: [0.4, 0, 1, 1] as const },
  },
}

const mobileSearchFieldVariants = {
  hidden: { width: 0, opacity: 0 },
  visible: {
    width: '100%',
    opacity: 1,
    transition: {
      width: MOBILE_SEARCH_SPRING,
      opacity: { duration: 0.18, delay: 0.06 },
    },
  },
  exit: {
    width: 0,
    opacity: 0,
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const },
  },
}

const mobileSearchContentVariants = {
  hidden: { opacity: 0, x: 14 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { delay: 0.14, duration: 0.22, ease: [0, 0, 0.2, 1] as const },
  },
  exit: {
    opacity: 0,
    x: 10,
    transition: { duration: 0.1 },
  },
}

const MotionLink = motion.create(Link)

export function Header() {
  const { isBurgerOpen, toggleBurger, closeBurger, isSearchOpen, toggleSearch, closeSearch, openCatalog } = useUIStore()
  const totalItems = useCartStore((s) => s.totalItems())
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const mobileSearchInputRef = useRef<HTMLInputElement>(null)
  const desktopSearchInputRef = useRef<HTMLInputElement>(null)
  const isMobile = useIsMobile()
  const mobileSearchActive = isMobile && isSearchOpen

  useScrollLock(isBurgerOpen)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    closeSearch()
    setSearchQuery('')
  }, [location.pathname, closeSearch])

  useEffect(() => {
    if (!isSearchOpen) return

    const timer = window.setTimeout(() => {
      const isDesktop = window.matchMedia('(min-width: 768px)').matches
      const input = isDesktop ? desktopSearchInputRef.current : mobileSearchInputRef.current
      input?.focus()
    }, 300)

    return () => window.clearTimeout(timer)
  }, [isSearchOpen])

  const handleCloseSearch = () => {
    closeSearch()
    setSearchQuery('')
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleCloseSearch()
    }
  }

  return (
    <>
      <header className={[styles.header, scrolled ? styles.scrolled : ''].filter(Boolean).join(' ')}>
        <div className={styles.inner}>
          <AnimatePresence>
            {isSearchOpen && isMobile && (
              <motion.div
                key="mobile-search"
                className={styles.mobileSearch}
                variants={mobileSearchOverlayVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <motion.button
                  type="button"
                  className={`${styles.iconBtn} ${styles.mobileSearchClose}`}
                  onClick={handleCloseSearch}
                  aria-label="Закрити пошук"
                  variants={mobileSearchCloseVariants}
                >
                  <X size={22} />
                </motion.button>

                <motion.div
                  className={styles.mobileSearchField}
                  variants={mobileSearchFieldVariants}
                >
                  <motion.div
                    className={styles.mobileSearchFieldInner}
                    variants={mobileSearchContentVariants}
                  >
                    <Search size={18} className={styles.searchFieldIcon} aria-hidden="true" />
                    <input
                      ref={mobileSearchInputRef}
                      type="search"
                      placeholder="Пошук товарів..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={styles.searchInput}
                      onKeyDown={handleSearchKeyDown}
                      aria-label="Пошуковий запит"
                    />
                    <AnimatePresence>
                      {searchQuery && (
                        <motion.button
                          type="button"
                          className={styles.clearSearch}
                          onClick={() => setSearchQuery('')}
                          aria-label="Очистити пошук"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.15 }}
                        >
                          <X size={16} />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={styles.headerMain}>
            <motion.button
              className={styles.burgerBtn}
              onClick={toggleBurger}
              aria-label={isBurgerOpen ? 'Закрити меню' : 'Відкрити меню'}
              aria-expanded={isBurgerOpen}
              animate={
                mobileSearchActive
                  ? { opacity: 0, x: -20, scale: 0.86, filter: 'blur(4px)' }
                  : { opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }
              }
              transition={MOBILE_HEADER_SPRING}
              style={{ pointerEvents: mobileSearchActive ? 'none' : 'auto' }}
            >
              <Menu size={24} />
            </motion.button>

            <MotionLink
              to="/"
              className={styles.logo}
              onClick={closeBurger}
              aria-label={`${SITE_NAME} — Головна`}
              animate={
                mobileSearchActive
                  ? { opacity: 0, y: -8, scale: 0.9, filter: 'blur(4px)' }
                  : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }
              }
              transition={MOBILE_HEADER_SPRING}
              style={{ pointerEvents: mobileSearchActive ? 'none' : 'auto' }}
            >
              <span className={styles.logoGem}>◆</span>
              <span className={styles.logoText}>{SITE_NAME}</span>
            </MotionLink>

            <nav className={styles.desktopNav} aria-label="Головне меню">
              {NAV_LINKS.map((link) =>
                link.to === '/catalog' ? (
                  <button
                    key={link.to}
                    type="button"
                    className={styles.navLink}
                    onClick={openCatalog}
                  >
                    {link.label}
                  </button>
                ) : (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) =>
                      [styles.navLink, isActive ? styles.navLinkActive : ''].filter(Boolean).join(' ')
                    }
                  >
                    {link.label}
                  </NavLink>
                ),
              )}
            </nav>

            <motion.div
              className={styles.actions}
              animate={
                mobileSearchActive
                  ? { opacity: 0, x: 20, scale: 0.9, filter: 'blur(4px)' }
                  : { opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }
              }
              transition={MOBILE_HEADER_SPRING}
              style={{ pointerEvents: mobileSearchActive ? 'none' : 'auto' }}
            >
              <div className={styles.desktopSearch}>
                <AnimatePresence>
                  {isSearchOpen && (
                    <motion.div
                      key="desktop-search"
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: DESKTOP_SEARCH_WIDTH, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={SEARCH_TRANSITION}
                      className={styles.desktopSearchField}
                    >
                      <Search size={16} className={styles.searchFieldIcon} aria-hidden="true" />
                      <input
                        ref={desktopSearchInputRef}
                        type="search"
                        placeholder="Пошук..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                        onKeyDown={handleSearchKeyDown}
                        aria-label="Пошуковий запит"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          className={styles.clearSearch}
                          onClick={() => setSearchQuery('')}
                          aria-label="Очистити пошук"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  className={styles.iconBtn}
                  onClick={toggleSearch}
                  aria-label={isSearchOpen ? 'Закрити пошук' : 'Пошук'}
                  aria-expanded={isSearchOpen}
                >
                  {isSearchOpen ? <X size={22} /> : <Search size={22} />}
                </button>
              </div>

              <button
                className={`${styles.iconBtn} ${styles.mobileSearchBtn}`}
                onClick={toggleSearch}
                aria-label={isSearchOpen ? 'Закрити пошук' : 'Пошук'}
                aria-expanded={isSearchOpen}
              >
                <Search size={22} />
              </button>

              <button className={`${styles.iconBtn} ${styles.wishlistBtn}`} aria-label="Обране" disabled>
                <Heart size={22} />
              </button>

              <button className={`${styles.iconBtn} ${styles.profileBtn}`} aria-label="Профіль" disabled>
                <User size={22} />
              </button>

              <Link to="/cart" className={styles.cartBtn} aria-label="Кошик">
                <ShoppingCart size={22} />
                <CartBadge count={totalItems} />
              </Link>
            </motion.div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isBurgerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={styles.backdrop}
              onClick={closeBurger}
              aria-hidden="true"
            />
            <motion.nav
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
              className={styles.mobileDrawer}
              aria-label="Мобільне меню"
            >
              <div className={styles.mobileDrawerHeader}>
                <button
                  className={styles.burgerBtn}
                  onClick={closeBurger}
                  aria-label="Закрити меню"
                >
                  <Menu size={24} />
                </button>
              </div>

              <ul className={styles.mobileMenu}>
                {MOBILE_NAV_LINKS.map((link, index) => {
                  const nextEndpoint =
                    index < MOBILE_NAV_LINKS.length - 1
                      ? getMenuEndpoint(MOBILE_NAV_LINKS[index + 1].to)
                      : '__account__'
                  const showDivider = getMenuEndpoint(link.to) !== nextEndpoint

                  return (
                    <li
                      key={link.to}
                      className={showDivider ? styles.mobileMenuItemDivided : undefined}
                    >
                      <Link
                        to={link.to}
                        className={
                          isHashNavLinkActive(link.to, location.pathname, location.hash)
                            ? `${styles.mobileMenuLink} ${styles.mobileMenuLinkActive}`
                            : styles.mobileMenuLink
                        }
                        onClick={closeBurger}
                      >
                        {link.label}
                      </Link>
                    </li>
                  )
                })}
                <li>
                  <button type="button" className={styles.mobileMenuLink} disabled>
                    Вхід для клієнтів
                  </button>
                </li>
              </ul>

              <div className={styles.mobileDrawerFooter}>
                <a href="tel:+380668344322" className={styles.mobileCallBtn} onClick={closeBurger}>
                  Замовити дзвінок
                </a>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
