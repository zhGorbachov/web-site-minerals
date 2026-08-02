import { uiTranslationsEn, uiTranslationsUk, type UiTranslationSchema } from './UiTranslations'

export type Language = 'uk' | 'en'

export type DeliveryItem = { title: string; text: string }
export type ValueItem = { title: string; text: string }
export type FaqItem = { q: string; a: string }

export type TranslationSchema = UiTranslationSchema & {
  nav: {
    home: string
    catalog: string
    about: string
    contacts: string
    delivery: string
    returns: string
    discounts: string
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
    incense: string
    pendants: string
    city: string
    country: string
    rights: string
    made: string
  }
  about: {
    breadcrumbHome: string
    breadcrumbAbout: string
    eyebrow: string
    heroTitle: string
    heroParagraphs: string[]
    storeAlt: string
    deliveryTitle: string
    returnsTitle: string
    returnsIntro: string
    returnsConditionsTitle: string
    returnsConditions: string[]
    returnsContact: string
    discountsTitle: string
    discountsIntro: string
    discountsTiers: string[]
    discountsFreeDelivery: string
    discountsPersonal: string
    discountsStrands: string
    reviewsTitle: string
    reviewRating: string
    valuesTitle: string
    faqTitle: string
    deliveryItems: DeliveryItem[]
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
    locationTitle: string
    mapTitle: string
    scheduleTitle: string
    scheduleSectionLabel: string
    scheduleValue: string
    scheduleNote: string
    mapOpen: string
    mapSubtext: string
    instagramTitle: string
    instagramNote: string
  }
}

export const translations: Record<Language, TranslationSchema> = {
  uk: {
    ...uiTranslationsUk,
    nav: {
      home: 'Головна',
      catalog: 'Каталог',
      about: 'Про компанію',
      contacts: 'Контакти',
      delivery: 'Доставка і оплата',
      returns: 'Обмін та повернення',
      discounts: 'Знижки',
      reviews: 'Відгуки',
      values: 'Наші цінності',
      faq: 'Цікаво знати',
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
      tagline: 'Натуральні мінерали, прикраси та намистини з природного каменю',
      navigation: 'Навігація',
      info: 'Інформація',
      contacts: 'Контакти',
      minerals: 'Мінерали',
      threads: 'Низки',
      bracelets: 'Браслети',
      incense: 'Пахощі',
      pendants: 'Підвіски',
      city: 'Кропивницький',
      country: 'Україна',
      rights: 'Всі права захищено.',
      made: 'Відкрийте для себе красу, створену природою 💎',
    },
    about: {
      breadcrumbHome: 'Головна',
      breadcrumbAbout: 'Про компанію',
      eyebrow: 'Про компанію',
      heroTitle: 'Ласкаво просимо до нашого світу натурального каміння!',
      heroParagraphs: [
        'Ми — команда, яка щиро захоплюється красою мінералів і вже багато років допомагає людям знаходити саме ті камені, які надихають, прикрашають та дарують естетичне задоволення.',
        'У нашому асортименті ви знайдете натуральні мінерали, колекційні зразки, галтовку, намистини, браслети, підвіски, кулони та багато інших виробів із природного каменю. Ми ретельно відбираємо кожен екземпляр, адже цінуємо його природну красу, унікальний малюнок і якість.',
        'Для нас важливо, щоб кожен покупець залишився задоволений. Саме тому ми завжди готові допомогти з вибором, відповісти на запитання та зробити процес покупки максимально простим і комфортним.',
        'Щиро дякуємо кожному, хто обирає наш магазин. Ваша довіра надихає нас постійно розширювати асортимент, вдосконалювати сервіс і відкривати для вас нові дивовижні мінерали.',
        'Запрошуємо відкрити для себе красу, створену самою природою!',
      ],
      storeAlt: 'Наш магазин',
      deliveryTitle: 'Доставка і оплата',
      returnsTitle: 'Обмін та повернення',
      returnsIntro:
        'Ми прагнемо, щоб кожна покупка приносила вам лише позитивні емоції. Якщо з будь-якої причини товар вам не підійшов, ви можете оформити обмін або повернення.',
      returnsConditionsTitle: 'Повернення та обмін можливі за таких умов:',
      returnsConditions: [
        'Просимо повідомте нас про це якомога раніше після отримання замовлення.',
        'Товар не був у використанні та зберіг свій первісний вигляд.',
        'Повернення коштів здійснюється одразу після отримання та перевірки товару.',
      ],
      returnsContact:
        'Звʼязатися з нами ви можете через будь-який месенджер (Telegram, WhatsApp, Viber, Instagram) або за номером телефону.',
      discountsTitle: 'Знижки та програма лояльності',
      discountsIntro: 'Розмір знижки залежить від суми замовлення:',
      discountsTiers: [
        'від 1000 грн — 2%',
        'від 2000 грн — 3%',
        'від 3000 грн — 4%',
        '…і далі до 10%.',
      ],
      discountsFreeDelivery: 'Безкоштовна доставка діє на замовлення від 3000 грн.',
      discountsPersonal:
        'Для постійних клієнтів у нас працюють персональні знижки 5% або 10% на весь асортимент, окрім низок.',
      discountsStrands:
        'Низки завжди розраховуються окремо відповідно до системи знижок за сумою замовлення.',
      reviewsTitle: 'Відгуки',
      reviewRating: 'Оцінка {rating} з 5',
      valuesTitle: 'Наші цінності',
      faqTitle: 'Часті запитання',
      deliveryItems: [
        {
          title: 'Нова Пошта',
          text: 'Відправляємо з понеділка по пʼятницю. Доступна доставка у відділення, поштомат або курʼєром Нової пошти.',
        },
        {
          title: 'Укрпошта',
          text: 'Відправляємо з понеділка по пʼятницю по всій Україні.',
        },
        {
          title: 'Оплата',
          text: 'Оплата на рахунок, післяплатою, а також Apple Pay і Google Pay.',
        },
      ],
      values: [
        {
          title: 'Натуральність',
          text: 'У нашому асортименті — лише натуральні мінерали та вироби з природного каменю, створені самою природою.',
        },
        {
          title: 'Якість',
          text: 'Кожен товар проходить ретельний відбір перед тим, як потрапити до нашого асортименту.',
        },
        {
          title: 'Унікальність',
          text: 'Кожен камінь має неповторний природний малюнок, форму, відтінок та розмір.',
        },
        {
          title: 'Надійність',
          text: 'Дбайливе пакування та швидка доставка по всій Україні.',
        },
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
          a: 'Доставка — за тарифами перевізника. При замовленні від 3000 грн діє безкоштовна доставка.',
        },
        {
          q: 'Коли ви відправляєте замовлення?',
          a: 'Відправляємо з понеділка по пʼятницю Новою Поштою та Укрпоштою.',
        },
        {
          q: 'Чи є знижки для постійних клієнтів?',
          a: 'Так. Від суми замовлення діє автоматична знижка (від 1000 грн — 2% і далі до 10%). Постійним клієнтам можемо призначити 5% або 10% на все, крім низок — низки рахуються окремо за сумою.',
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
      locationTitle: 'Локація',
      mapTitle: 'Карта магазину',
      scheduleTitle: 'Графік роботи',
      scheduleSectionLabel: 'Коли ми працюємо',
      scheduleValue: 'Пн–Пт: 9:30 – 17:00',
      scheduleNote: 'Сб–Нд: вихідний',
      mapOpen: 'Відкрити в Google Maps',
      mapSubtext: 'Україна, доставляємо по всій країні',
      instagramTitle: 'Instagram',
      instagramNote: 'Слідкуйте за новинками та роботами',
    },
  },
  en: {
    ...uiTranslationsEn,
    nav: {
      home: 'Home',
      catalog: 'Catalog',
      about: 'About the company',
      contacts: 'Contacts',
      delivery: 'Delivery & payment',
      returns: 'Returns & exchanges',
      discounts: 'Discounts',
      reviews: 'Reviews',
      values: 'Our values',
      faq: 'Good to know',
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
      tagline: 'Natural minerals, jewelry and beads from natural stone',
      navigation: 'Navigation',
      info: 'Information',
      contacts: 'Contacts',
      minerals: 'Minerals',
      threads: 'Threads',
      bracelets: 'Bracelets',
      incense: 'Incense',
      pendants: 'Pendants',
      city: 'Kropyvnytskyi',
      country: 'Ukraine',
      rights: 'All rights reserved.',
      made: 'Discover beauty created by nature 💎',
    },
    about: {
      breadcrumbHome: 'Home',
      breadcrumbAbout: 'About the company',
      eyebrow: 'About the company',
      heroTitle: 'Welcome to our world of natural stones!',
      heroParagraphs: [
        'We are a team that truly loves the beauty of minerals and has helped people for many years find the stones that inspire, decorate, and bring aesthetic pleasure.',
        'In our assortment you will find natural minerals, collector specimens, tumbled stones, beads, bracelets, pendants, charms, and many other pieces made from natural stone. We carefully select every item because we value its natural beauty, unique pattern, and quality.',
        'It matters to us that every customer is satisfied. That is why we are always ready to help with the choice, answer questions, and make the shopping process as simple and comfortable as possible.',
        'Thank you to everyone who chooses our store. Your trust inspires us to keep expanding the assortment, improving our service, and discovering new wonderful minerals for you.',
        'We invite you to discover beauty created by nature itself!',
      ],
      storeAlt: 'Our store',
      deliveryTitle: 'Delivery & payment',
      returnsTitle: 'Returns & exchanges',
      returnsIntro:
        'We want every purchase to bring you only positive emotions. If for any reason an item does not suit you, you can arrange an exchange or return.',
      returnsConditionsTitle: 'Returns and exchanges are possible under these conditions:',
      returnsConditions: [
        'Please let us know as soon as possible after receiving your order.',
        'The item has not been used and has kept its original appearance.',
        'Refunds are processed right after we receive and inspect the item.',
      ],
      returnsContact:
        'You can contact us via any messenger (Telegram, WhatsApp, Viber, Instagram) or by phone.',
      discountsTitle: 'Discounts & loyalty program',
      discountsIntro: 'The discount depends on the order total:',
      discountsTiers: [
        'from 1000 UAH — 2%',
        'from 2000 UAH — 3%',
        'from 3000 UAH — 4%',
        '…and so on up to 10%.',
      ],
      discountsFreeDelivery: 'Free delivery applies to orders from 3000 UAH.',
      discountsPersonal:
        'Regular customers can get personal discounts of 5% or 10% on the entire assortment, except strands.',
      discountsStrands:
        'Strands are always calculated separately according to the volume discount system.',
      reviewsTitle: 'Reviews',
      reviewRating: 'Rating {rating} out of 5',
      valuesTitle: 'Our values',
      faqTitle: 'Frequently asked questions',
      deliveryItems: [
        {
          title: 'Nova Poshta',
          text: 'We ship Monday to Friday. Delivery to a branch, parcel locker, or by Nova Poshta courier is available.',
        },
        {
          title: 'Ukrposhta',
          text: 'We ship Monday to Friday across Ukraine.',
        },
        {
          title: 'Payment',
          text: 'Bank transfer, cash on delivery, as well as Apple Pay and Google Pay.',
        },
      ],
      values: [
        {
          title: 'Natural',
          text: 'Our assortment includes only natural minerals and pieces made from natural stone, created by nature itself.',
        },
        {
          title: 'Quality',
          text: 'Every item is carefully selected before it enters our assortment.',
        },
        {
          title: 'Uniqueness',
          text: 'Every stone has a one-of-a-kind natural pattern, shape, shade, and size.',
        },
        {
          title: 'Reliability',
          text: 'Careful packaging and fast delivery across Ukraine.',
        },
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
          a: 'Delivery follows carrier rates. Free delivery applies to orders from 3000 UAH.',
        },
        {
          q: 'When do you ship orders?',
          a: 'We ship Monday to Friday via Nova Poshta and Ukrposhta.',
        },
        {
          q: 'Are there discounts for regular customers?',
          a: 'Yes. Orders get an automatic volume discount (from 1000 UAH — 2%, up to 10%). Regular customers may get a personal 5% or 10% on everything except strands — strands use the volume system separately.',
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
      locationTitle: 'Location',
      mapTitle: 'Store map',
      scheduleTitle: 'Working hours',
      scheduleSectionLabel: 'When we\'re open',
      scheduleValue: 'Mon–Fri: 9:30 AM – 5:00 PM',
      scheduleNote: 'Sat–Sun: closed',
      mapOpen: 'Open in Google Maps',
      mapSubtext: 'Ukraine, we deliver nationwide',
      instagramTitle: 'Instagram',
      instagramNote: 'Follow us for new arrivals and handmade pieces',
    },
  },
}
