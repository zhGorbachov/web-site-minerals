import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, Send } from 'lucide-react'
import { useOpenCatalog } from '@/hooks/useOpenCatalog'
import { SITE_NAME } from '@/config/Site'
import styles from './Footer.module.scss'

export function Footer() {
  const currentYear = new Date().getFullYear()
  const openCatalog = useOpenCatalog()

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          {/* Brand */}
          <div className={styles.brand}>
            <Link to="/" className={styles.logo}>
              <span className={styles.logoGem}>◆</span>
              <span className={styles.logoText}>{SITE_NAME}</span>
            </Link>
            <p className={styles.tagline}>
              Натуральні мінерали, нитки та браслети ручної роботи
            </p>
            <div className={styles.socials}>
              <a
                href="https://t.me/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Telegram"
              >
                <Send size={18} />
              </a>
            </div>
          </div>

          <div className={styles.linkColumns}>
            {/* Navigation */}
            <div className={styles.column}>
              <h4 className={styles.columnTitle}>Навігація</h4>
              <ul className={styles.linkList}>
                <li><Link to="/" className={styles.link}>Головна</Link></li>
                <li><Link to="/catalog" className={styles.link} onClick={openCatalog}>Каталог</Link></li>
                <li><Link to="/catalog/mineraly" className={styles.link}>Мінерали</Link></li>
                <li><Link to="/catalog/nytky" className={styles.link}>Нитки</Link></li>
                <li><Link to="/catalog/brаslety" className={styles.link}>Браслети</Link></li>
              </ul>
            </div>

            {/* Info */}
            <div className={styles.column}>
              <h4 className={styles.columnTitle}>Інформація</h4>
              <ul className={styles.linkList}>
                <li><Link to="/about" className={styles.link}>Про нас</Link></li>
                <li><Link to="/about#delivery" className={styles.link}>Доставка і оплата</Link></li>
                <li><Link to="/about#returns" className={styles.link}>Обмін і повернення</Link></li>
                <li><Link to="/contacts" className={styles.link}>Контакти</Link></li>
              </ul>
            </div>
          </div>

          {/* Contacts */}
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Контакти</h4>
            <ul className={styles.contactList}>
              <li className={styles.contactItem}>
                <Phone size={16} />
                <a href="tel:+380991234567" className={styles.link}>+38 (099) 123-45-67</a>
              </li>
              <li className={styles.contactItem}>
                <Mail size={16} />
                <a href="mailto:hello@crystal.ua" className={styles.link}>hello@crystal.ua</a>
              </li>
              <li className={styles.contactItem}>
                <MapPin size={16} />
                <span className={styles.contactText}>Україна</span>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {currentYear} {SITE_NAME}. Всі права захищено.
          </p>
          <p className={styles.made}>
            Натуральні мінерали та ручна робота з любов'ю 💎
          </p>
        </div>
      </div>
    </footer>
  )
}
