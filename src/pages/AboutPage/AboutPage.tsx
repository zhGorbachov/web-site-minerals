import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Gem, Heart, Truck, RefreshCw, HelpCircle, Shield, Star } from 'lucide-react'
import { Breadcrumbs } from '@/components/ui'
import { mockImages } from '@/assets/mock/Images'
import { scrollToHashTarget } from '@/utils/hashNav'
import { SITE_NAME } from '@/config/Site'
import styles from './AboutPage.module.scss'

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
}

export function AboutPage() {
  const location = useLocation()

  useEffect(() => {
    if (location.pathname !== '/about') return

    const timer = window.setTimeout(() => {
      scrollToHashTarget(location.hash)
    }, 200)

    return () => window.clearTimeout(timer)
  }, [location.pathname, location.hash])

  return (
    <div className={styles.page}>
      <div className="container">
        <Breadcrumbs items={[{ label: 'Головна', href: '/' }, { label: 'Про нас' }]} />

        {/* Hero */}
        <motion.section {...fadeIn} className={styles.hero}>
          <div className={styles.heroText}>
            <span className={styles.eyebrow}>Наша історія</span>
            <h1 className={styles.heroTitle}>Ми любимо мінерали так само, як і ви</h1>
            <p className={styles.heroDesc}>
              {SITE_NAME} — невеликий сімейний магазин натуральних мінералів, ниток та браслетів ручної роботи.
              Ми починали як хобі і перетворилися на справжній магазин з великою кількістю задоволених клієнтів.
            </p>
          </div>
          <div className={styles.heroImage}>
            <img
              src={mockImages.aboutStore}
              alt="Наш магазин"
            />
          </div>
        </motion.section>

        {/* Philosophy */}
        <motion.section {...fadeIn} className={styles.section} id="philosophy">
          <div className={styles.sectionHeader}>
            <Gem className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>Наша філософія</h2>
          </div>
          <div className={styles.textContent}>
            <p>
              Ми вважаємо, що кожна людина заслуговує на справжнє та натуральне.
              Тому ми ретельно відбираємо кожен камінь, кожну нитку та кожен матеріал.
            </p>
            <p>
              Наші браслети — це не просто прикраси. Це маленькі твори мистецтва, виготовлені вручну
              з увагою до кожної деталі та з любов'ю до природи.
            </p>
          </div>
        </motion.section>

        {/* Delivery */}
        <motion.section {...fadeIn} className={[styles.section, styles.sectionGray].join(' ')} id="delivery">
          <div className={styles.sectionHeader}>
            <Truck className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>Доставка і оплата</h2>
          </div>
          <div className={styles.infoGrid}>
            {DELIVERY_INFO.map((item) => (
              <div key={item.title} className={styles.infoCard}>
                <h4 className={styles.infoCardTitle}>{item.title}</h4>
                <p className={styles.infoCardText}>{item.text}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Returns */}
        <motion.section {...fadeIn} className={styles.section} id="returns">
          <div className={styles.sectionHeader}>
            <RefreshCw className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>Обмін і повернення</h2>
          </div>
          <div className={styles.textContent}>
            <p>
              Ми приймаємо повернення та обміни протягом <strong>14 днів</strong> з моменту отримання замовлення.
            </p>
            <p>
              Товар повинен бути у незміненому стані, у оригінальній упаковці.
              Для повернення зв'яжіться з нами за телефоном або у Telegram.
            </p>
          </div>
        </motion.section>

        {/* Reviews */}
        <motion.section {...fadeIn} className={[styles.section, styles.sectionGray].join(' ')} id="reviews">
          <div className={styles.sectionHeader}>
            <Star className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>Відгуки</h2>
          </div>
          <div className={styles.reviewsList}>
            {REVIEWS.map((review) => (
              <article key={review.author} className={styles.reviewCard}>
                <div className={styles.reviewStars} aria-label={`Оцінка ${review.rating} з 5`}>
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className={styles.reviewText}>{review.text}</p>
                <p className={styles.reviewAuthor}>{review.author}</p>
              </article>
            ))}
          </div>
        </motion.section>

        {/* Values */}
        <motion.section {...fadeIn} className={styles.section}>
          <div className={styles.sectionHeader}>
            <Heart className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>Наші цінності</h2>
          </div>
          <div className={styles.valuesGrid}>
            {VALUES.map((v) => (
              <div key={v.title} className={styles.valueCard}>
                <div className={styles.valueIcon}>{v.icon}</div>
                <h4 className={styles.valueTitle}>{v.title}</h4>
                <p className={styles.valueText}>{v.text}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* FAQ */}
        <motion.section {...fadeIn} className={styles.section} id="faq">
          <div className={styles.sectionHeader}>
            <HelpCircle className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>Часті запитання</h2>
          </div>
          <div className={styles.faqList}>
            {FAQ.map((item) => (
              <details key={item.q} className={styles.faqItem}>
                <summary className={styles.faqQuestion}>{item.q}</summary>
                <p className={styles.faqAnswer}>{item.a}</p>
              </details>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  )
}

const DELIVERY_INFO = [
  { title: 'Нова Пошта', text: 'Відправляємо щодня (крім неділі). Доставка 1–2 дні.' },
  { title: 'Укрпошта', text: 'Доставка 2–5 днів. Підходить для великих замовлень.' },
  { title: 'Кур\'єр', text: 'Доступно в Києві та найближчих містах.' },
  { title: 'Оплата', text: 'Оплата на картку ПриватБанк/Монобанк або накладеним платежем.' },
]

const REVIEWS = [
  {
    author: 'Олена К.',
    rating: 5,
    text: 'Чудові браслети ручної роботи! Камінці справжні, упаковка акуратна. Замовляла вже двічі.',
  },
  {
    author: 'Марія С.',
    rating: 5,
    text: 'Дуже швидка доставка і приємне спілкування. Аметист виглядає ще краще, ніж на фото.',
  },
  {
    author: 'Ірина В.',
    rating: 4,
    text: 'Гарний вибір ниток для плетіння. Якість на висоті, обов\'язково замовлю ще.',
  },
]

const VALUES = [
  { icon: <Gem size={24} />, title: 'Натуральність', text: 'Тільки справжні природні матеріали без підробок' },
  { icon: <Heart size={24} />, title: 'Ручна робота', text: 'Кожен виріб унікальний і зроблений вручну' },
  { icon: <Shield size={24} />, title: 'Якість', text: 'Гарантуємо якість кожного товару' },
  { icon: <Truck size={24} />, title: 'Надійність', text: 'Швидка та безпечна доставка по всій Україні' },
]

const FAQ = [
  { q: 'Як перевірити справжність мінералу?', a: 'Ми гарантуємо справжність кожного мінералу. Усі камені мають сертифікати або документи від постачальників.' },
  { q: 'Чи можна замовити індивідуальний браслет?', a: 'Так! Напишіть нам у Telegram і ми виготовимо браслет під ваші параметри та побажання.' },
  { q: 'Скільки коштує доставка?', a: 'Доставка Новою Поштою — за тарифами перевізника (зазвичай 60–80 грн). При замовленні від 500 грн — безкоштовна доставка.' },
  { q: 'Чи є знижки для постійних клієнтів?', a: 'Так, ми маємо програму лояльності. Після 3 замовлень ви отримуєте знижку 10% на всі наступні покупки.' },
  { q: 'Як правильно доглядати за браслетом?', a: 'Знімайте браслет перед купанням та фізичними навантаженнями. Протирайте м\'якою сухою тканиною.' },
]
