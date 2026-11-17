import { uiTranslationsEn, uiTranslationsUk, type UiTranslationSchema } from './UiTranslations'

export type Language = 'uk' | 'en'

export type DeliveryItem = { title: string; text: string }
export type ValueItem = { title: string; text: string }
export type FaqItem = {
  q: string
  paragraphs: string[]
  list?: string[]
  after?: string[]
}

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
    returnsParagraphs: string[]
    discountsTitle: string
    discountsIntro: string
    discountsTiers: string[]
    discountsFreeDelivery: string
    discountsPersonal: string
    discountsStrands: string
    discountsPaloSanto: string
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
      returns: 'Повернення та обмін',
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
        'У нашому асортименті ви знайдете натуральні мінерали, колекційні зразки, галтовку, намистини, браслети, підвіски та багато інших виробів із природного каменю. Ми ретельно відбираємо кожен екземпляр, адже цінуємо його природну красу, унікальний малюнок і якість.',
        'Для нас важливо, щоб кожен покупець залишився задоволений. Саме тому ми завжди готові допомогти з вибором, відповісти на запитання та зробити процес покупки максимально простим і комфортним.',
        'Щиро дякуємо кожному, хто обирає наш магазин. Ваша довіра надихає нас постійно розширювати асортимент, вдосконалювати сервіс і відкривати для вас нові дивовижні мінерали.',
        'Запрошуємо відкрити для себе красу, створену самою природою!',
      ],
      storeAlt: 'Наш магазин',
      deliveryTitle: 'Доставка і оплата',
      returnsTitle: 'Повернення та обмін',
      returnsParagraphs: [
        'Повернення та обмін товарів здійснюються відповідно до чинного законодавства України.',
        'Товар має зберігати товарний вигляд, комплектацію та споживчі властивості.',
        'Звертаємо увагу, що натуральне каміння має природні особливості: відмінності у відтінках, малюнку, прозорості та наявність природних включень. Такі особливості є характерними для мінералів і не вважаються дефектом.',
        'У разі отримання пошкодженого товару або невідповідності замовленню просимо звʼязатися з нами та надати фото або відео.',
        'У разі необхідності повернення або обміну товару, будь ласка, звʼяжіться з нами за контактною інформацією, зазначеною на сайті.',
      ],
      discountsTitle: 'Знижки та програма лояльності',
      discountsIntro: 'Знижка залежить від суми товарів (мінерали, браслети, пахощі та підвіски рахуються разом):',
      discountsTiers: [
        'від 1000 грн — 2%',
        'від 2000 грн — 3%',
        'від 3000 грн — 4%',
        '…і далі за тією ж шкалою до 10%.',
      ],
      discountsFreeDelivery: 'Безкоштовна доставка діє на замовлення від 3000 грн.',
      discountsPersonal:
        'Для постійних клієнтів діють персональні знижки 5% або 10% на весь асортимент, окрім низок та Пало Санто на вагу. Персональні знижки не сумуються зі знижкою від суми замовлення: діє та, що більша.',
      discountsStrands:
        'Низки рахуються окремо: знижка на них залежить лише від загальної суми низок у замовленні за тією ж шкалою, а їхня вартість не додається до суми інших товарів.',
      discountsPaloSanto:
        'На Пало Санто, яке продається на вагу, знижки від суми замовлення та персональні знижки не поширюються.',
      reviewsTitle: 'Відгуки',
      reviewRating: 'Оцінка {rating} з 5',
      valuesTitle: 'Наші цінності',
      faqTitle: 'Цікаво знати',
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
          title: 'Самовивіз',
          text: 'Забирайте замовлення самостійно з нашого магазину за адресою: вул. Шульгиних, 10, Кропивницький.',
        },
        {
          title: 'Оплата',
          text: 'Оплата на рахунок або післяплатою.',
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
          q: 'Скільки коштує доставка?',
          paragraphs: ['Доставка — за тарифами перевізника. При замовленні від 3000 грн діє безкоштовна доставка.'],
        },
        {
          q: 'Коли ви відправляєте замовлення?',
          paragraphs: ['Відправляємо з понеділка по пʼятницю Новою Поштою та Укрпоштою.'],
        },
        {
          q: 'Чи є знижки для постійних клієнтів?',
          paragraphs: ['Так. У нас діє автоматична система знижок залежно від суми замовлення:'],
          list: [
            'від 1000 грн — 2%',
            'від 2000 грн — 3%',
            'від 3000 грн — 4%',
            'далі за тією ж шкалою до 10%.',
          ],
          after: [
            'Знижка на мінерали, браслети, пахощі та підвіски розраховується разом, а на низки — окремо, залежно від їхньої загальної суми.',
            'Для постійних клієнтів також можемо призначити персональну знижку 5% або 10% на асортимент магазину. Вона не поширюється на низки та Пало Санто, яке продається на вагу.',
            'Знижки не сумуються: діє та, що більша. На Пало Санто на вагу знижки не поширюються.',
          ],
        },
        {
          q: 'Як доглядати за натуральним камінням?',
          paragraphs: [
            'Натуральне каміння потребує дбайливого догляду. Уникайте тривалого контакту з водою, парфумами, косметикою та побутовою хімією. Не допускайте падіння виробів і сильних ударів. Зберігайте прикраси окремо одна від одної, бажано в мʼяких мішечках або коробочках. Для очищення використовуйте мʼяку суху тканину.',
            'Важливо: різні мінерали мають різну твердість і чутливість до вологи, сонячного світла та температури, тому догляд варто підбирати з урахуванням особливостей конкретного каменю.',
          ],
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
      scheduleValue: 'Пн–Пт: 9:00 – 17:00',
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
      returns: 'Returns and exchanges',
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
      returnsTitle: 'Returns and exchanges',
      returnsParagraphs: [
        'Returns and exchanges of goods are carried out in accordance with the current legislation of Ukraine.',
        'The item must retain its commercial appearance, completeness, and consumer properties.',
        'Please note that natural stone has natural features: differences in shade, pattern, and transparency, and the presence of natural inclusions. Such features are characteristic of minerals and are not considered a defect.',
        'If you receive a damaged item or the order does not match what was ordered, please contact us and provide a photo or video.',
        'If you need to return or exchange an item, please contact us using the contact information listed on the website.',
      ],
      discountsTitle: 'Discounts & loyalty program',
      discountsIntro: 'The discount depends on the total of the items (minerals, bracelets, incense, and pendants are counted together):',
      discountsTiers: [
        'from 1000 UAH — 2%',
        'from 2000 UAH — 3%',
        'from 3000 UAH — 4%',
        '…and further on the same scale up to 10%.',
      ],
      discountsFreeDelivery: 'Free delivery applies to orders from 3000 UAH.',
      discountsPersonal:
        'Regular customers receive personal discounts of 5% or 10% on the entire assortment, except strands and Palo Santo sold by weight. Personal discounts are not combined with the order-amount discount: the higher one applies.',
      discountsStrands:
        'Strands are counted separately: the discount on them depends only on the total amount of strands in the order, on the same scale, and their cost is not added to the total of the other items.',
      discountsPaloSanto:
        'Order-amount discounts and personal discounts do not apply to Palo Santo sold by weight.',
      reviewsTitle: 'Reviews',
      reviewRating: 'Rating {rating} out of 5',
      valuesTitle: 'Our values',
      faqTitle: 'Good to know',
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
          title: 'Self-pickup',
          text: 'Pick up your order from our store at Shulhynykh St., 10, Kropyvnytskyi.',
        },
        {
          title: 'Payment',
          text: 'Bank transfer or cash on delivery.',
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
          q: 'How much does delivery cost?',
          paragraphs: ['Delivery follows carrier rates. Free delivery applies to orders from 3000 UAH.'],
        },
        {
          q: 'When do you ship orders?',
          paragraphs: ['We ship Monday to Friday via Nova Poshta and Ukrposhta.'],
        },
        {
          q: 'Are there discounts for regular customers?',
          paragraphs: ['Yes. We have an automatic discount system based on the order amount:'],
          list: [
            'from 1000 UAH — 2%',
            'from 2000 UAH — 3%',
            'from 3000 UAH — 4%',
            'and further on the same scale up to 10%.',
          ],
          after: [
            'The discount on minerals, bracelets, incense, and pendants is calculated together, while strands are calculated separately, based on their total amount.',
            'We can also assign regular customers a personal discount of 5% or 10% on the store assortment. It does not apply to strands or to Palo Santo sold by weight.',
            'Discounts are not combined: the higher one applies. Discounts do not apply to Palo Santo sold by weight.',
          ],
        },
        {
          q: 'How do I care for natural stone?',
          paragraphs: [
            'Natural stone needs careful care. Avoid prolonged contact with water, perfume, cosmetics, and household chemicals. Do not drop the pieces or expose them to strong impacts. Store jewelry separately, preferably in soft pouches or boxes. Clean with a soft dry cloth.',
            'Important: different minerals vary in hardness and in sensitivity to moisture, sunlight, and temperature, so care should be chosen with the characteristics of the specific stone in mind.',
          ],
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
      scheduleValue: 'Mon–Fri: 9:00 AM – 5:00 PM',
      scheduleNote: 'Sat–Sun: closed',
      mapOpen: 'Open in Google Maps',
      mapSubtext: 'Ukraine, we deliver nationwide',
      instagramTitle: 'Instagram',
      instagramNote: 'Follow us for new arrivals and handmade pieces',
    },
  },
}
