import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, Search, User, Heart, ShoppingCart, X, Building2, Truck, RefreshCw, Percent, Star, HelpCircle, Phone, Clock, type LucideIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore, useUIStore, useWishlistStore } from '@/store'
import { CartBadge } from '@/components/ui'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { ContactDetails } from '@/components/ContactDetails'
import { useScrollLock } from '@/hooks/useScrollLock'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { useTranslation } from '@/i18n/useTranslation'
import { isHashNavLinkActive } from '@/utils/hashNav'
import { SITE_NAME } from '@/config/Site'
import { SiteLogo } from '@/components/SiteLogo'
import styles from './Header.module.scss'

const NAV_LINK_KEYS = [
  { labelKey: 'nav.home' as const, to: '/' },
  { labelKey: 'nav.catalog' as const, to: '/catalog' },
  { labelKey: 'nav.about' as const, to: '/about' },
  { labelKey: 'nav.contacts' as const, to: '/contacts' },
]

const MOBILE_ICON_SIZE = 22

const MOBILE_NAV_LINK_KEYS = [
  { labelKey: 'nav.about' as const, to: '/about', icon: Building2 },
  { labelKey: 'nav.delivery' as const, to: '/about#delivery', icon: Truck },
  { labelKey: 'nav.returns' as const, to: '/about#returns', icon: RefreshCw },
  { labelKey: 'nav.discounts' as const, to: '/about#discounts', icon: Percent },
  { labelKey: 'nav.reviews' as const, to: '/about#reviews', icon: Star },
  { labelKey: 'nav.values' as const, to: '/about#values', icon: Heart },
  { labelKey: 'nav.faq' as const, to: '/about#faq', icon: HelpCircle },
]

function MobileMenuLinkLabel({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <>
      <Icon size={MOBILE_ICON_SIZE} className={styles.mobileMenuLinkIcon} aria-hidden="true" />
      <span>{label}</span>
    </>
  )
}

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
  const { t } = useTranslation()
  const { isBurgerOpen, toggleBurger, closeBurger, isSearchOpen, toggleSearch, closeSearch, openCatalog } = useUIStore()
  const totalItems = useCartStore((s) => s.totalItems())
  const wishlistCount = useWishlistStore((s) => s.productIds.length)
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
                  aria-label={t('header.closeSearch')}
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
                      placeholder={t('header.searchPlaceholderMobile')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={styles.searchInput}
                      onKeyDown={handleSearchKeyDown}
                      aria-label={t('header.searchQuery')}
                    />
                    <AnimatePresence>
                      {searchQuery && (
                        <motion.button
                          type="button"
                          className={styles.clearSearch}
                          onClick={() => setSearchQuery('')}
                          aria-label={t('header.clearSearch')}
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
            <div className={styles.headerLeft}>
            <motion.button
              className={styles.burgerBtn}
              onClick={toggleBurger}
              aria-label={isBurgerOpen ? t('header.closeMenu') : t('header.openMenu')}
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
            </div>

            <MotionLink
              to="/"
              className={styles.logo}
              onClick={closeBurger}
              aria-label={`${SITE_NAME} — ${t('header.homeAria')}`}
              animate={
                mobileSearchActive
                  ? { opacity: 0, y: -8, scale: 0.9, filter: 'blur(4px)' }
                  : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }
              }
              transition={MOBILE_HEADER_SPRING}
              style={{ pointerEvents: mobileSearchActive ? 'none' : 'auto' }}
            >
              <SiteLogo compact />
            </MotionLink>

            <nav className={styles.desktopNav} aria-label={t('header.mainMenu')}>
              {NAV_LINK_KEYS.map((link) =>
                link.to === '/catalog' ? (
                  <button
                    key={link.to}
                    type="button"
                    className={styles.navLink}
                    onClick={openCatalog}
                  >
                    {t(link.labelKey)}
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
                    {t(link.labelKey)}
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
              <LanguageSwitcher className={styles.desktopLanguageSwitcher} />

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
                        placeholder={t('header.searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                        onKeyDown={handleSearchKeyDown}
                        aria-label={t('header.searchQuery')}
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          className={styles.clearSearch}
                          onClick={() => setSearchQuery('')}
                          aria-label={t('header.clearSearch')}
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
                  aria-label={isSearchOpen ? t('header.closeSearch') : t('header.search')}
                  aria-expanded={isSearchOpen}
                >
                  {isSearchOpen ? <X size={22} /> : <Search size={22} />}
                </button>
              </div>

              <button
                className={`${styles.iconBtn} ${styles.mobileSearchBtn}`}
                onClick={toggleSearch}
                aria-label={isSearchOpen ? t('header.closeSearch') : t('header.search')}
                aria-expanded={isSearchOpen}
              >
                <Search size={22} />
              </button>

              <Link to="/wishlist" className={`${styles.iconBtn} ${styles.wishlistBtn}`} aria-label={t('header.wishlist')}>
                <Heart size={22} />
                <CartBadge count={wishlistCount} />
              </Link>

              <button className={`${styles.iconBtn} ${styles.profileBtn}`} aria-label={t('header.profile')} disabled>
                <User size={22} />
              </button>

              <Link to="/cart" className={styles.cartBtn} aria-label={t('header.cart')}>
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
              aria-label={t('header.mobileMenu')}
            >
              <div className={styles.mobileDrawerHeader}>
                <button
                  className={styles.burgerBtn}
                  onClick={closeBurger}
                  aria-label={t('header.closeMenu')}
                >
                  <Menu size={24} />
                </button>
                <LanguageSwitcher />
              </div>

              <ul className={styles.mobileMenu}>
                {MOBILE_NAV_LINK_KEYS.map((link, index) => {
                  const nextEndpoint =
                    index < MOBILE_NAV_LINK_KEYS.length - 1
                      ? getMenuEndpoint(MOBILE_NAV_LINK_KEYS[index + 1].to)
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
                        <MobileMenuLinkLabel icon={link.icon} label={t(link.labelKey)} />
                      </Link>
                    </li>
                  )
                })}
                <li className={styles.mobileMenuLoginWrap}>
                  <button type="button" className={styles.mobileMenuLogin} disabled>
                    <User size={MOBILE_ICON_SIZE} className={styles.mobileMenuLinkIcon} aria-hidden="true" />
                    {t('header.clientLogin')}
                  </button>
                </li>
                <li className={styles.mobileMenuContactBlock}>
                  <Link
                    to="/contacts"
                    className={
                      isHashNavLinkActive('/contacts', location.pathname, location.hash)
                        ? `${styles.mobileMenuLink} ${styles.mobileMenuLinkActive}`
                        : styles.mobileMenuLink
                    }
                    onClick={closeBurger}
                  >
                    <MobileMenuLinkLabel icon={Phone} label={t('nav.contactInfo')} />
                  </Link>
                  <Link
                    to="/contacts#schedule"
                    className={
                      isHashNavLinkActive('/contacts#schedule', location.pathname, location.hash)
                        ? `${styles.mobileMenuLink} ${styles.mobileMenuLinkActive} ${styles.mobileMenuScheduleLink}`
                        : `${styles.mobileMenuLink} ${styles.mobileMenuScheduleLink}`
                    }
                    onClick={closeBurger}
                  >
                    <MobileMenuLinkLabel icon={Clock} label={t('contacts.scheduleTitle')} />
                  </Link>
                  <ContactDetails variant="menu" onLinkClick={closeBurger} />
                </li>
              </ul>

              <div className={styles.mobileDrawerFooter}>
                <a href="tel:+380668344322" className={styles.mobileCallBtn} onClick={closeBurger}>
                  {t('header.orderCall')}
                </a>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
