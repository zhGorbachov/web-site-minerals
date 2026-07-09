export type UiTranslationSchema = {
  common: {
    allProducts: string
    toCatalog: string
    loading: string
    quantity: string
    decreaseQty: string
    increaseQty: string
    productOne: string
    productFew: string
    productMany: string
    paginationPrev: string
    paginationNext: string
    paginationPage: string
    view: string
    breadcrumbsAria: string
  }
  home: {
    heroTitle: string
    heroDescription: string
    catalogTitle: string
    catalogSubtitle: string
    newTitle: string
    newPaginationAria: string
    popularTitle: string
    advantagesTitle: string
    advantageNaturalTitle: string
    advantageNaturalText: string
    advantageHandmadeTitle: string
    advantageHandmadeText: string
    advantageDeliveryTitle: string
    advantageDeliveryText: string
    advantageQualityTitle: string
    advantageQualityText: string
    aboutEyebrow: string
    aboutDescription1: string
    aboutDescription2: string
    aboutCta: string
  }
  category: {
    productCount: string
    aboutSection: string
    emptyTitle: string
    emptyDescription: string
  }
  product: {
    notFoundTitle: string
    notFoundDescription: string
    inStock: string
    outOfStock: string
    description: string
    related: string
    badgeNew: string
  }
  cart: {
    emptyTitle: string
    emptyDescription: string
    added: string
    addedShort: string
    maxInCart: string
    addToCart: string
    addToCartAria: string
    removeItem: string
    perUnit: string
    summary: string
    itemsLabel: string
    itemsCount: string
    delivery: string
    deliveryNote: string
    total: string
    checkout: string
    checkoutSoon: string
    checkoutShort: string
    continueShopping: string
  }
  wishlist: {
    emptyTitle: string
    emptyDescription: string
    clearAria: string
    clearAll: string
    add: string
    remove: string
  }
  notFound: {
    title: string
    description: string
    goHome: string
  }
  sort: {
    aria: string
    listAria: string
    default: string
    nameAsc: string
    nameDesc: string
    priceAsc: string
    priceDesc: string
    newest: string
    popular: string
  }
  catalog: {
    title: string
    close: string
    collapse: string
    expand: string
  }
  productCard: {
    selectOptionsHint: string
    goToProduct: string
    maxInCart: string
  }
  productOptions: {
    beadSize: string
    strandLength: string
    color: string
    wristSize: string
    availableWristSize: string
    characteristics: string
    mohsScale: string
    attrSize: string
    attrWeight: string
    attrColor: string
    attrOrigin: string
    attrHardness: string
    attrShape: string
    attrLength: string
    attrDiameter: string
    attrMaterial: string
    attrStones: string
    attrThreadColor: string
    beadSizeMm: string
    colors: {
      black: string
      white: string
      beige: string
      pink: string
      blue: string
      green: string
      burgundy: string
    }
  }
  productGallery: {
    photoAlt: string
    prev: string
    next: string
    tabsAria: string
    photo: string
    thumbnailAlt: string
  }
  subcategoryNav: {
    title: string
  }
  badge: {
    cartCount: string
  }
  price: {
    currency: string
    perUnit: string
  }
}

export const uiTranslationsUk: UiTranslationSchema = {
  common: {
    allProducts: 'Всі товари',
    toCatalog: 'До каталогу',
    loading: 'Завантаження...',
    quantity: 'Кількість',
    decreaseQty: 'Зменшити кількість',
    increaseQty: 'Збільшити кількість',
    productOne: '{count} товар',
    productFew: '{count} товари',
    productMany: '{count} товарів',
    paginationPrev: 'Попередня сторінка',
    paginationNext: 'Наступна сторінка',
    paginationPage: 'Сторінка {page}',
    view: 'Переглянути',
    breadcrumbsAria: 'Навігаційний ланцюжок',
  },
  home: {
    heroTitle: 'Ласкаво просимо до «{siteName}»',
    heroDescription: 'Справжній простір для поціновувачів природної краси та унікальних мінералів',
    catalogTitle: 'Каталог товарів',
    catalogSubtitle: 'Категорії для вашого натхнення',
    newTitle: 'Новинки',
    newPaginationAria: 'Сторінки новинок',
    popularTitle: 'Популярні товари',
    advantagesTitle: 'Наші переваги',
    advantageNaturalTitle: 'Натуральні матеріали',
    advantageNaturalText: 'Тільки справжні мінерали та натуральні нитки без синтетики',
    advantageHandmadeTitle: 'Ручна робота',
    advantageHandmadeText: 'Кожен браслет виготовляється вручну з увагою до деталей',
    advantageDeliveryTitle: 'Швидка доставка',
    advantageDeliveryText: 'Відправляємо Новою Поштою та Укрпоштою по всій Україні',
    advantageQualityTitle: 'Гарантія якості',
    advantageQualityText: 'Обмін або повернення протягом 14 днів без зайвих питань',
    aboutEyebrow: 'Про магазин',
    aboutDescription1:
      '{siteName} — це невеликий сімейний магазин натуральних мінералів, ниток та браслетів ручної роботи. Ми ретельно відбираємо кожен камінь та матеріал, щоб ви отримали тільки справжнє та якісне.',
    aboutDescription2:
      'Кожен браслет — унікальний. Кожен мінерал — справжній. Кожна нитка — перевірена.',
    aboutCta: 'Дізнатись більше',
  },
  category: {
    productCount: '{count} товарів',
    aboutSection: 'Про категорію',
    emptyTitle: 'Товарів не знайдено',
    emptyDescription: 'У цій підкатегорії поки немає товарів',
  },
  product: {
    notFoundTitle: 'Товар не знайдено',
    notFoundDescription: 'Можливо, товар було видалено або посилання застаріле',
    inStock: 'в наявності',
    outOfStock: 'немає в наявності',
    description: 'Опис',
    related: 'Схожі товари',
    badgeNew: 'Новинка',
  },
  cart: {
    emptyTitle: 'Кошик порожній',
    emptyDescription: 'Додайте товари з каталогу, щоб почати покупки',
    added: 'Додано!',
    addedShort: 'Додано',
    maxInCart: 'Максимум у кошику',
    addToCart: 'В кошик',
    addToCartAria: 'Додати в кошик',
    removeItem: 'Видалити товар',
    perUnit: '/ шт.',
    summary: 'Підсумок',
    itemsLabel: 'Товарів',
    itemsCount: '{count} шт.',
    delivery: 'Доставка',
    deliveryNote: 'за тарифами перевізника',
    total: 'Разом',
    checkout: 'Оформити замовлення',
    checkoutSoon: 'Оформлення замовлення — незабаром',
    checkoutShort: 'Оформити',
    continueShopping: 'Продовжити покупки',
  },
  wishlist: {
    emptyTitle: 'Обране порожнє',
    emptyDescription: 'Натисніть на серце біля товару, щоб зберегти його тут',
    clearAria: 'Очистити обране',
    clearAll: 'Очистити все',
    add: 'Додати до обраних',
    remove: 'Видалити з обраних',
  },
  notFound: {
    title: 'Сторінку не знайдено',
    description: 'На жаль, сторінка, яку ви шукаєте, не існує або була переміщена.',
    goHome: 'На головну',
  },
  sort: {
    aria: 'Сортування',
    listAria: 'Сортування товарів',
    default: 'За замовчуванням',
    nameAsc: 'Назва А → Я',
    nameDesc: 'Назва Я → А',
    priceAsc: 'Ціна: від низької',
    priceDesc: 'Ціна: від високої',
    newest: 'Спочатку новинки',
    popular: 'Спочатку популярні',
  },
  catalog: {
    title: 'Каталог товарів',
    close: 'Закрити каталог',
    collapse: 'Згорнути {name}',
    expand: 'Розгорнути {name}',
  },
  productCard: {
    selectOptionsHint: 'Оберіть параметри товару перед додаванням у кошик',
    goToProduct: 'До товару',
    maxInCart: 'Максимальна кількість уже в кошику',
  },
  productOptions: {
    beadSize: 'Розмір намистини',
    strandLength: 'Довжина низки',
    color: 'Колір',
    wristSize: "Розмір зап'ястка",
    availableWristSize: 'Доступний розмір: {size}',
    characteristics: 'Характеристики',
    mohsScale: ' (за Моосом)',
    attrSize: 'Розмір',
    attrWeight: 'Вага',
    attrColor: 'Колір',
    attrOrigin: 'Походження',
    attrHardness: 'Твердість',
    attrShape: 'Форма',
    attrLength: 'Довжина',
    attrDiameter: 'Товщина',
    attrMaterial: 'Матеріал',
    attrStones: 'Каміння',
    attrThreadColor: 'Колір нитки',
    beadSizeMm: '{value} мм',
    colors: {
      black: 'Чорний',
      white: 'Білий',
      beige: 'Бежевий',
      pink: 'Рожевий',
      blue: 'Синій',
      green: 'Зелений',
      burgundy: 'Бордовий',
    },
  },
  productGallery: {
    photoAlt: '{name} — фото {n}',
    prev: 'Попереднє фото',
    next: 'Наступне фото',
    tabsAria: 'Фото товару',
    photo: 'Фото {n}',
    thumbnailAlt: '{name} мініатюра {n}',
  },
  subcategoryNav: {
    title: 'Підкатегорії',
  },
  badge: {
    cartCount: '{count} товарів у кошику',
  },
  price: {
    currency: 'грн',
    perUnit: 'шт.',
  },
}

export const uiTranslationsEn: UiTranslationSchema = {
  common: {
    allProducts: 'All products',
    toCatalog: 'Go to catalog',
    loading: 'Loading...',
    quantity: 'Quantity',
    decreaseQty: 'Decrease quantity',
    increaseQty: 'Increase quantity',
    productOne: '{count} item',
    productFew: '{count} items',
    productMany: '{count} items',
    paginationPrev: 'Previous page',
    paginationNext: 'Next page',
    paginationPage: 'Page {page}',
    view: 'View',
    breadcrumbsAria: 'Breadcrumb',
  },
  home: {
    heroTitle: 'Welcome to "{siteName}"',
    heroDescription: 'A genuine space for lovers of natural beauty and unique minerals',
    catalogTitle: 'Product catalog',
    catalogSubtitle: 'Categories for your inspiration',
    newTitle: 'New arrivals',
    newPaginationAria: 'New arrivals pages',
    popularTitle: 'Popular products',
    advantagesTitle: 'Our advantages',
    advantageNaturalTitle: 'Natural materials',
    advantageNaturalText: 'Only genuine minerals and natural threads — no synthetics',
    advantageHandmadeTitle: 'Handmade',
    advantageHandmadeText: 'Every bracelet is crafted by hand with attention to detail',
    advantageDeliveryTitle: 'Fast delivery',
    advantageDeliveryText: 'We ship via Nova Poshta and Ukrposhta across Ukraine',
    advantageQualityTitle: 'Quality guarantee',
    advantageQualityText: 'Exchange or return within 14 days, no hassle',
    aboutEyebrow: 'About the store',
    aboutDescription1:
      '{siteName} is a small family store of natural minerals, threads and handmade bracelets. We carefully select every stone and material so you receive only genuine, quality goods.',
    aboutDescription2:
      'Every bracelet is unique. Every mineral is genuine. Every thread is verified.',
    aboutCta: 'Learn more',
  },
  category: {
    productCount: '{count} products',
    aboutSection: 'About category',
    emptyTitle: 'No products found',
    emptyDescription: 'There are no products in this subcategory yet',
  },
  product: {
    notFoundTitle: 'Product not found',
    notFoundDescription: 'The product may have been removed or the link is outdated',
    inStock: 'in stock',
    outOfStock: 'out of stock',
    description: 'Description',
    related: 'Related products',
    badgeNew: 'New',
  },
  cart: {
    emptyTitle: 'Your cart is empty',
    emptyDescription: 'Add products from the catalog to start shopping',
    added: 'Added!',
    addedShort: 'Added',
    maxInCart: 'Maximum in cart',
    addToCart: 'Add to cart',
    addToCartAria: 'Add to cart',
    removeItem: 'Remove item',
    perUnit: '/ pc.',
    summary: 'Summary',
    itemsLabel: 'Items',
    itemsCount: '{count} pcs.',
    delivery: 'Delivery',
    deliveryNote: 'carrier rates apply',
    total: 'Total',
    checkout: 'Checkout',
    checkoutSoon: 'Checkout — coming soon',
    checkoutShort: 'Checkout',
    continueShopping: 'Continue shopping',
  },
  wishlist: {
    emptyTitle: 'Wishlist is empty',
    emptyDescription: 'Tap the heart on a product to save it here',
    clearAria: 'Clear wishlist',
    clearAll: 'Clear all',
    add: 'Add to wishlist',
    remove: 'Remove from wishlist',
  },
  notFound: {
    title: 'Page not found',
    description: 'Sorry, the page you are looking for does not exist or has been moved.',
    goHome: 'Go home',
  },
  sort: {
    aria: 'Sort',
    listAria: 'Product sorting',
    default: 'Default',
    nameAsc: 'Name A → Z',
    nameDesc: 'Name Z → A',
    priceAsc: 'Price: low to high',
    priceDesc: 'Price: high to low',
    newest: 'Newest first',
    popular: 'Popular first',
  },
  catalog: {
    title: 'Product catalog',
    close: 'Close catalog',
    collapse: 'Collapse {name}',
    expand: 'Expand {name}',
  },
  productCard: {
    selectOptionsHint: 'Select product options before adding to cart',
    goToProduct: 'View product',
    maxInCart: 'Maximum quantity already in cart',
  },
  productOptions: {
    beadSize: 'Bead size',
    strandLength: 'Strand length',
    color: 'Color',
    wristSize: 'Wrist size',
    availableWristSize: 'Available size: {size}',
    characteristics: 'Specifications',
    mohsScale: ' (Mohs scale)',
    attrSize: 'Size',
    attrWeight: 'Weight',
    attrColor: 'Color',
    attrOrigin: 'Origin',
    attrHardness: 'Hardness',
    attrShape: 'Shape',
    attrLength: 'Length',
    attrDiameter: 'Diameter',
    attrMaterial: 'Material',
    attrStones: 'Stones',
    attrThreadColor: 'Thread color',
    beadSizeMm: '{value} mm',
    colors: {
      black: 'Black',
      white: 'White',
      beige: 'Beige',
      pink: 'Pink',
      blue: 'Blue',
      green: 'Green',
      burgundy: 'Burgundy',
    },
  },
  productGallery: {
    photoAlt: '{name} — photo {n}',
    prev: 'Previous photo',
    next: 'Next photo',
    tabsAria: 'Product photos',
    photo: 'Photo {n}',
    thumbnailAlt: '{name} thumbnail {n}',
  },
  subcategoryNav: {
    title: 'Subcategories',
  },
  badge: {
    cartCount: '{count} items in cart',
  },
  price: {
    currency: 'UAH',
    perUnit: 'pc.',
  },
}
