import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin } from 'lucide-react'
import { useOpenCatalog } from '@/hooks/useOpenCatalog'
import { useTranslation } from '@/i18n/useTranslation'
import { SocialLinks } from '@/components/ContactDetails'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { PHONE_CONTACTS, EMAIL_CONTACTS, LOCATION_LINK } from '@/config/ContactInfo'
import { SITE_NAME } from '@/config/Site'
import { SiteLogo } from '@/components/SiteLogo'
import styles from './Footer.module.scss'

export function Footer() {
  const currentYear = new Date().getFullYear()
  const openCatalog = useOpenCatalog()
  const { t } = useTranslation()

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <Link to="/" className={styles.logo}>
              <SiteLogo />
            </Link>
            <p className={styles.tagline}>{t('footer.tagline')}</p>
          </div>

          <div className={styles.linkColumns}>
            <div className={styles.column}>
              <h4 className={styles.columnTitle}>{t('footer.navigation')}</h4>
              <ul className={styles.linkList}>
                <li><Link to="/" className={styles.link}>{t('nav.home')}</Link></li>
                <li><Link to="/catalog" className={styles.link} onClick={openCatalog}>{t('nav.catalog')}</Link></li>
                <li><Link to="/catalog/mineraly" className={styles.link}>{t('footer.minerals')}</Link></li>
                <li><Link to="/catalog/nytky" className={styles.link}>{t('footer.threads')}</Link></li>
                <li><Link to="/catalog/brаslety" className={styles.link}>{t('footer.bracelets')}</Link></li>
                <li><Link to="/catalog/pidvisky" className={styles.link}>{t('footer.pendants')}</Link></li>
              </ul>
            </div>

            <div className={styles.column}>
              <h4 className={styles.columnTitle}>{t('footer.info')}</h4>
              <ul className={styles.linkList}>
                <li><Link to="/about" className={styles.link}>{t('nav.about')}</Link></li>
                <li><Link to="/about#delivery" className={styles.link}>{t('nav.delivery')}</Link></li>
                <li><Link to="/about#returns" className={styles.link}>{t('nav.returns')}</Link></li>
                <li><Link to="/about#discounts" className={styles.link}>{t('nav.discounts')}</Link></li>
                <li><Link to="/about#reviews" className={styles.link}>{t('nav.reviews')}</Link></li>
                <li><Link to="/about#values" className={styles.link}>{t('nav.values')}</Link></li>
                <li><Link to="/about#faq" className={styles.link}>{t('nav.faq')}</Link></li>
                <li><Link to="/contacts" className={styles.link}>{t('nav.contactInfo')}</Link></li>
              </ul>
            </div>
          </div>

          <div className={styles.column}>
            <h4 className={styles.columnTitle}>{t('footer.contacts')}</h4>
            <ul className={styles.contactList}>
              {PHONE_CONTACTS.map((phone) => (
                <li key={phone.href} className={styles.contactItem}>
                  <Phone size={16} />
                  <a href={phone.href} className={styles.link}>{phone.display}</a>
                </li>
              ))}
              {EMAIL_CONTACTS.map((email) => (
                <li key={email.href} className={styles.contactItem}>
                  <Mail size={16} />
                  <a href={email.href} className={styles.link}>{email.display}</a>
                </li>
              ))}
              <li className={styles.contactItem}>
                <MapPin size={16} />
                <a
                  href={LOCATION_LINK}
                  className={styles.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('footer.city')}, {t('footer.country')}
                </a>
              </li>
            </ul>
            <div className={styles.contactSocials}>
              <SocialLinks variant="footer" />
            </div>
          </div>
        </div>

        <ThemeSwitcher />

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {currentYear} {SITE_NAME}. {t('footer.rights')}
          </p>
          <p className={styles.made}>{t('footer.made')}</p>
        </div>
      </div>
    </footer>
  )
}
