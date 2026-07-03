export type Language = 'uk' | 'en'

export type DeliveryItem = { title: string; text: string }
export type ReviewItem = { author: string; rating: number; text: string }
export type ValueItem = { title: string; text: string }
export type FaqItem = { q: string; a: string }

export type TranslationSchema = {
  nav: {
    home: string
    catalog: string
    about: string
    contacts: string
    delivery: string
    returns: string
    reviews: string
    values: string
    faq: string
    contactInfo: string
  }
  header: {
    openMenu: string
    closeMenu: string
    homeAria: string
    mainMenu: string
    mobileMenu: string
    search: string
    closeSearch: string
    searchPlaceholder: string
    searchPlaceholderMobile: string
    searchQuery: string
    clearSearch: string
    wishlist: string
    profile: string
    cart: string
    clientLogin: string
    orderCall: string
    switchToUk: string
    switchToEn: string
  }
  footer: {
    tagline: string
    navigation: string
    info: string
    contacts: string
    minerals: string
    threads: string
    bracelets: string
    country: string
    rights: string
    made: string
  }
  about: {
    breadcrumbHome: string
    breadcrumbAbout: string
    eyebrow: string
    heroTitle: string
    heroDesc: string
    storeAlt: string
    deliveryTitle: string
    returnsTitle: string
    returnsP1: string
    returnsP2: string
    reviewsTitle: string
    reviewRating: string
    valuesTitle: string
    faqTitle: string
    deliveryItems: DeliveryItem[]
    reviews: ReviewItem[]
    values: ValueItem[]
    faq: FaqItem[]
  }
  contacts: {
    subtitle: string
    phoneTitle: string
    phonesTitle: string
    messengerAction: string
    emailTitle: string
    emailNote: string
    scheduleTitle: string
    scheduleSectionLabel: string
    scheduleValue: string
    scheduleNote: string
    mapSoon: string
    mapSubtext: string
  }
}

export const translations: Record<Language, TranslationSchema> = {
  uk: {
    nav: {
      home: 'Головна',
      catalog: 'Каталог',
      about: 'Про Компанію',
      contacts: 'Контакти',
      delivery: 'Доставка і оплата',
      returns: 'Обмін та повернення',
      reviews: 'Відгуки',
      values: 'Наші цінності',
      faq: 'Часті запитання',
      contactInfo: 'Контактна інформація',
    },
    header: {
      openMenu: 'Відкрити меню',
      closeMenu: 'Закрити меню',
      homeAria: 'Головна',
      mainMenu: 'Головне меню',
      mobileMenu: 'Мобільне меню',
      search: 'Пошук',
      closeSearch: 'Закрити пошук',
      searchPlaceholder: 'Пошук...',
      searchPlaceholderMobile: 'Пошук товарів...',
      searchQuery: 'Пошуковий запит',
      clearSearch: 'Очистити пошук',
      wishlist: 'Обране',
      profile: 'Профіль',
      cart: 'Кошик',
      clientLogin: 'Вхід для клієнтів',
      orderCall: 'Замовити дзвінок',
      switchToUk: 'Українська',
      switchToEn: 'English',
    },
    footer: {
      tagline: 'Натуральні мінерали, нитки та браслети ручної роботи',
      navigation: 'Навігація',
      info: 'Інформація',
      contacts: 'Контакти',
      minerals: 'Мінерали',
      threads: 'Нитки',
      bracelets: 'Браслети',
      country: 'Україна',
      rights: 'Всі права захищено.',
      made: 'Натуральні мінерали та ручна робота з любов\'ю 💎',
    },
    about: {
      breadcrumbHome: 'Головна',
      breadcrumbAbout: 'Про Компанію',
      eyebrow: 'Наша історія',
      heroTitle: 'Ми любимо мінерали так само, як і ви',
      heroDesc:
        '{siteName} — невеликий сімейний магазин натуральних мінералів, ниток та браслетів ручної роботи. Ми починали як хобі і перетворилися на справжній магазин з великою кількістю задоволених клієнтів.',
      storeAlt: 'Наш магазин',
      deliveryTitle: 'Доставка і оплата',
      returnsTitle: 'Обмін і повернення',
      returnsP1: 'Ми приймаємо повернення та обміни протягом 14 днів з моменту отримання замовлення.',
      returnsP2:
        'Товар повинен бути у незміненому стані, у оригінальній упаковці. Для повернення зв\'яжіться з нами за телефоном або у Telegram.',
      reviewsTitle: 'Відгуки',
      reviewRating: 'Оцінка {rating} з 5',
      valuesTitle: 'Наші цінності',
      faqTitle: 'Часті запитання',
      deliveryItems: [
        { title: 'Нова Пошта', text: 'Відправляємо щодня (крім неділі). Доставка 1–2 дні.' },
        { title: 'Укрпошта', text: 'Доставка 2–5 днів. Підходить для великих замовлень.' },
        { title: 'Кур\'єр', text: 'Доступно в Києві та найближчих містах.' },
        { title: 'Оплата', text: 'Оплата на картку ПриватБанк/Монобанк або накладеним платежем.' },
      ],
      reviews: [
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
      ],
      values: [
        { title: 'Натуральність', text: 'Тільки справжні природні матеріали без підробок' },
        { title: 'Ручна робота', text: 'Кожен виріб унікальний і зроблений вручну' },
        { title: 'Якість', text: 'Гарантуємо якість кожного товару' },
        { title: 'Надійність', text: 'Швидка та безпечна доставка по всій Україні' },
      ],
      faq: [
        {
          q: 'Як перевірити справжність мінералу?',
          a: 'Ми гарантуємо справжність кожного мінералу. Усі камені мають сертифікати або документи від постачальників.',
        },
        {
          q: 'Чи можна замовити індивідуальний браслет?',
          a: 'Так! Напишіть нам у Telegram і ми виготовимо браслет під ваші параметри та побажання.',
        },
        {
          q: 'Скільки коштує доставка?',
          a: 'Доставка Новою Поштою — за тарифами перевізника (зазвичай 60–80 грн). При замовленні від 500 грн — безкоштовна доставка.',
        },
        {
          q: 'Чи є знижки для постійних клієнтів?',
          a: 'Так, ми маємо програму лояльності. Після 3 замовлень ви отримуєте знижку 10% на всі наступні покупки.',
        },
        {
          q: 'Як правильно доглядати за браслетом?',
          a: 'Знімайте браслет перед купанням та фізичними навантаженнями. Протирайте м\'якою сухою тканиною.',
        },
      ],
    },
    contacts: {
      subtitle: 'Будемо раді відповісти на всі ваші питання',
      phoneTitle: 'Телефон',
      phonesTitle: 'Телефони та месенджери',
      messengerAction: 'Написати нам',
      emailTitle: 'Email',
      emailNote: 'Відповідаємо протягом 24 годин',
      scheduleTitle: 'Графік роботи',
      scheduleSectionLabel: 'Коли ми працюємо',
      scheduleValue: 'Пн–Пт: 9:00 – 19:00',
      scheduleNote: 'Сб: 10:00 – 16:00 | Нд: вихідний',
      mapSoon: 'Інтерактивна карта — незабаром',
      mapSubtext: 'Україна, доставляємо по всій країні',
    },
  },
  en: {
    nav: {
      home: 'Home',
      catalog: 'Catalog',
      about: 'About Company',
      contacts: 'Contacts',
      delivery: 'Delivery & payment',
      returns: 'Returns & exchanges',
      reviews: 'Reviews',
      values: 'Our values',
      faq: 'FAQ',
      contactInfo: 'Contact information',
    },
    header: {
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      homeAria: 'Home',
      mainMenu: 'Main menu',
      mobileMenu: 'Mobile menu',
      search: 'Search',
      closeSearch: 'Close search',
      searchPlaceholder: 'Search...',
      searchPlaceholderMobile: 'Search products...',
      searchQuery: 'Search query',
      clearSearch: 'Clear search',
      wishlist: 'Wishlist',
      profile: 'Profile',
      cart: 'Cart',
      clientLogin: 'Client login',
      orderCall: 'Request a call',
      switchToUk: 'Ukrainian',
      switchToEn: 'English',
    },
    footer: {
      tagline: 'Natural minerals, threads and handmade bracelets',
      navigation: 'Navigation',
      info: 'Information',
      contacts: 'Contacts',
      minerals: 'Minerals',
      threads: 'Threads',
      bracelets: 'Bracelets',
      country: 'Ukraine',
      rights: 'All rights reserved.',
      made: 'Natural minerals and handmade with love 💎',
    },
    about: {
      breadcrumbHome: 'Home',
      breadcrumbAbout: 'About Company',
      eyebrow: 'Our story',
      heroTitle: 'We love minerals just as much as you do',
      heroDesc:
        '{siteName} is a small family store of natural minerals, threads and handmade bracelets. We started as a hobby and grew into a real shop with many happy customers.',
      storeAlt: 'Our store',
      deliveryTitle: 'Delivery & payment',
      returnsTitle: 'Returns & exchanges',
      returnsP1: 'We accept returns and exchanges within 14 days of receiving your order.',
      returnsP2:
        'Items must be unused and in original packaging. To return an item, contact us by phone or Telegram.',
      reviewsTitle: 'Reviews',
      reviewRating: 'Rating {rating} out of 5',
      valuesTitle: 'Our values',
      faqTitle: 'Frequently asked questions',
      deliveryItems: [
        { title: 'Nova Poshta', text: 'We ship daily (except Sunday). Delivery in 1–2 days.' },
        { title: 'Ukrposhta', text: 'Delivery in 2–5 days. Suitable for large orders.' },
        { title: 'Courier', text: 'Available in Kyiv and nearby cities.' },
        { title: 'Payment', text: 'Payment by PrivatBank/Monobank card or cash on delivery.' },
      ],
      reviews: [
        {
          author: 'Olena K.',
          rating: 5,
          text: 'Wonderful handmade bracelets! Genuine stones, neat packaging. I have ordered twice already.',
        },
        {
          author: 'Maria S.',
          rating: 5,
          text: 'Very fast delivery and pleasant communication. The amethyst looks even better than in the photo.',
        },
        {
          author: 'Iryna V.',
          rating: 4,
          text: 'Great selection of threads for weaving. Top quality — I will definitely order again.',
        },
      ],
      values: [
        { title: 'Natural', text: 'Only genuine natural materials, no fakes' },
        { title: 'Handmade', text: 'Every piece is unique and made by hand' },
        { title: 'Quality', text: 'We guarantee the quality of every product' },
        { title: 'Reliability', text: 'Fast and secure delivery across Ukraine' },
      ],
      faq: [
        {
          q: 'How can I verify a mineral is genuine?',
          a: 'We guarantee the authenticity of every mineral. All stones come with certificates or supplier documents.',
        },
        {
          q: 'Can I order a custom bracelet?',
          a: 'Yes! Message us on Telegram and we will make a bracelet to your size and preferences.',
        },
        {
          q: 'How much does delivery cost?',
          a: 'Nova Poshta delivery follows carrier rates (usually 60–80 UAH). Free delivery on orders over 500 UAH.',
        },
        {
          q: 'Are there discounts for regular customers?',
          a: 'Yes, we have a loyalty program. After 3 orders you get 10% off all future purchases.',
        },
        {
          q: 'How should I care for my bracelet?',
          a: 'Remove your bracelet before bathing or physical activity. Wipe with a soft dry cloth.',
        },
      ],
    },
    contacts: {
      subtitle: 'We are happy to answer all your questions',
      phoneTitle: 'Phone',
      phonesTitle: 'Phones & messengers',
      messengerAction: 'Message us',
      emailTitle: 'Email',
      emailNote: 'We reply within 24 hours',
      scheduleTitle: 'Working hours',
      scheduleSectionLabel: 'When we\'re open',
      scheduleValue: 'Mon–Fri: 9:00 AM – 7:00 PM',
      scheduleNote: 'Sat: 10:00 AM – 4:00 PM | Sun: closed',
      mapSoon: 'Interactive map — coming soon',
      mapSubtext: 'Ukraine, we deliver nationwide',
    },
  },
}
