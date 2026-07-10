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
    paginationAria: string
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
  auth: {
    tabsAria: string
    loginTab: string
    registerTab: string
    loginTitle: string
    registerTitle: string
    loginSubtitle: string
    registerSubtitle: string
    firstName: string
    lastName: string
    email: string
    phone: string
    phoneOptional: string
    password: string
    showPassword: string
    hidePassword: string
    loginSubmit: string
    registerSubmit: string
    continueGoogle: string
    continueApple: string
    orEmail: string
    continue: string
    cancel: string
    noAccount: string
    hasAccount: string
    backHome: string
    backToLogin: string
    oauthProcessing: string
    oauthErrorTitle: string
    errorEmailTaken: string
    errorInvalidCredentials: string
    errorWeakPassword: string
    errorRequired: string
    errorInvalidEmail: string
    errorNameRequired: string
    errorOauthNotConfigured: string
    errorOauthDenied: string
    errorOauthFailed: string
  }
  profile: {
    title: string
    memberSince: string
    role: string
    roleCustomer: string
    roleAdmin: string
    openAdmin: string
    signedInWith: string
    providerEmail: string
    providerGoogle: string
    providerApple: string
    logout: string
  }
  admin: {
    title: string
    subtitle: string
    tabProducts: string
    tabAddProduct: string
    tabSubcategories: string
    forbidden: string
    loading: string
    searchPlaceholder: string
    stock: string
    saveStock: string
    edit: string
    remove: string
    removeConfirm: string
    createProduct: string
    updateProduct: string
    cancelEdit: string
    name: string
    slug: string
    sku: string
    price: string
    discountPrice: string
    shortDescription: string
    description: string
    images: string
    imagesHint: string
    media: string
    mediaDropTitle: string
    mediaDropHint: string
    addImages: string
    addVideo: string
    video: string
    uploading: string
    uploadError: string
    removeMedia: string
    imagesRequired: string
    subcategory: string
    featured: string
    popular: string
    isNew: string
    createSubcategory: string
    category: string
    subName: string
    subSlug: string
    subImage: string
    successSaved: string
    successCreated: string
    successDeleted: string
    successSubCreated: string
    errorGeneric: string
    errorSlugTaken: string
    errorSkuTaken: string
    errorInOrders: string
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
    advantageNaturalText: 'Тільки справжні мінерали та натуральні низки без синтетики',
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
    paginationAria: 'Сторінки товарів',
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
    attrThreadColor: 'Колір низки',
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
  auth: {
    tabsAria: 'Вхід або реєстрація',
    loginTab: 'Вхід',
    registerTab: 'Реєстрація',
    loginTitle: 'Вхід до кабінету',
    registerTitle: 'Створити акаунт',
    loginSubtitle: 'Увійдіть, щоб переглядати профіль та зберігати замовлення',
    registerSubtitle: 'Зареєструйтесь, щоб швидше оформлювати покупки',
    firstName: "Ім'я",
    lastName: 'Прізвище',
    email: 'Email',
    phone: 'Телефон',
    phoneOptional: 'Необовʼязково',
    password: 'Пароль',
    showPassword: 'Показати пароль',
    hidePassword: 'Сховати пароль',
    loginSubmit: 'Увійти',
    registerSubmit: 'Зареєструватися',
    continueGoogle: 'Продовжити з Google',
    continueApple: 'Продовжити з Apple',
    orEmail: 'або email',
    continue: 'Продовжити',
    cancel: 'Скасувати',
    noAccount: 'Ще немає акаунту?',
    hasAccount: 'Вже є акаунт?',
    backHome: 'На головну',
    backToLogin: 'Повернутися до входу',
    oauthProcessing: 'Завершуємо вхід...',
    oauthErrorTitle: 'Не вдалося увійти',
    errorEmailTaken: 'Користувач з таким email вже існує',
    errorInvalidCredentials: 'Невірний email або пароль',
    errorWeakPassword: 'Пароль має містити щонайменше 6 символів',
    errorRequired: 'Заповніть усі обовʼязкові поля',
    errorInvalidEmail: 'Введіть коректний email',
    errorNameRequired: "Вкажіть ім'я та прізвище",
    errorOauthNotConfigured:
      'OAuth не налаштовано на сервері. Додайте GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET у server/.env',
    errorOauthDenied: 'Вхід скасовано. Спробуйте ще раз',
    errorOauthFailed: 'Не вдалося завершити вхід через провайдера. Спробуйте ще раз',
  },
  profile: {
    title: 'Профіль',
    memberSince: 'З нами з {date}',
    role: 'Роль',
    roleCustomer: 'Клієнт',
    roleAdmin: 'Адміністратор',
    openAdmin: 'Адмін-панель',
    signedInWith: 'Спосіб входу',
    providerEmail: 'Email і пароль',
    providerGoogle: 'Google',
    providerApple: 'Apple',
    logout: 'Вийти',
  },
  admin: {
    title: 'Адмін-панель',
    subtitle: 'Керування товарами, залишками та підкатегоріями',
    tabProducts: 'Товари',
    tabAddProduct: 'Новий товар',
    tabSubcategories: 'Підкатегорії',
    forbidden: 'Доступ лише для адміністратора',
    loading: 'Завантаження...',
    searchPlaceholder: 'Пошук за назвою або SKU...',
    stock: 'Залишок',
    saveStock: 'Зберегти',
    edit: 'Редагувати',
    remove: 'Видалити',
    removeConfirm: 'Видалити цей товар?',
    createProduct: 'Створити товар',
    updateProduct: 'Зберегти зміни',
    cancelEdit: 'Скасувати',
    name: 'Назва',
    slug: 'Slug',
    sku: 'SKU',
    price: 'Ціна',
    discountPrice: 'Ціна зі знижкою',
    shortDescription: 'Короткий опис',
    description: 'Опис',
    images: 'Зображення (URL через кому)',
    imagesHint: 'Наприклад: /media/BeadsAgate.jpg',
    media: 'Медіа',
    mediaDropTitle: 'Вставте, перетягніть або оберіть файли',
    mediaDropHint: 'Можна вставити одне чи кілька зображень з буфера (Ctrl+V / ⌘V), або завантажити фото та відео',
    addImages: 'Додати фото',
    addVideo: 'Додати відео',
    video: 'Відео',
    uploading: 'Завантаження...',
    uploadError: 'Не вдалося завантажити файл',
    removeMedia: 'Видалити',
    imagesRequired: 'Додайте хоча б одне зображення',
    subcategory: 'Підкатегорія',
    featured: 'Рекомендований',
    popular: 'Популярний',
    isNew: 'Новинка',
    createSubcategory: 'Додати підкатегорію',
    category: 'Категорія',
    subName: 'Назва підкатегорії',
    subSlug: 'Slug підкатегорії',
    subImage: 'Зображення (URL)',
    successSaved: 'Збережено',
    successCreated: 'Товар створено',
    successDeleted: 'Товар видалено',
    successSubCreated: 'Підкатегорію створено',
    errorGeneric: 'Щось пішло не так',
    errorSlugTaken: 'Такий slug уже зайнятий',
    errorSkuTaken: 'Такий SKU уже зайнятий',
    errorInOrders: 'Неможливо видалити: товар є в замовленнях',
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
    paginationAria: 'Product pages',
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
  auth: {
    tabsAria: 'Login or registration',
    loginTab: 'Login',
    registerTab: 'Register',
    loginTitle: 'Sign in',
    registerTitle: 'Create account',
    loginSubtitle: 'Sign in to view your profile and keep your orders',
    registerSubtitle: 'Register to check out faster next time',
    firstName: 'First name',
    lastName: 'Last name',
    email: 'Email',
    phone: 'Phone',
    phoneOptional: 'Optional',
    password: 'Password',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    loginSubmit: 'Sign in',
    registerSubmit: 'Create account',
    continueGoogle: 'Continue with Google',
    continueApple: 'Continue with Apple',
    orEmail: 'or email',
    continue: 'Continue',
    cancel: 'Cancel',
    noAccount: 'No account yet?',
    hasAccount: 'Already have an account?',
    backHome: 'Back to home',
    backToLogin: 'Back to login',
    oauthProcessing: 'Finishing sign-in...',
    oauthErrorTitle: 'Sign-in failed',
    errorEmailTaken: 'An account with this email already exists',
    errorInvalidCredentials: 'Invalid email or password',
    errorWeakPassword: 'Password must be at least 6 characters',
    errorRequired: 'Please fill in all required fields',
    errorInvalidEmail: 'Enter a valid email address',
    errorNameRequired: 'Enter your first and last name',
    errorOauthNotConfigured:
      'OAuth is not configured on the server. Add GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET to server/.env',
    errorOauthDenied: 'Sign-in was cancelled. Please try again',
    errorOauthFailed: 'Could not complete provider sign-in. Please try again',
  },
  profile: {
    title: 'Profile',
    memberSince: 'Member since {date}',
    role: 'Role',
    roleCustomer: 'Customer',
    roleAdmin: 'Administrator',
    openAdmin: 'Admin panel',
    signedInWith: 'Signed in with',
    providerEmail: 'Email & password',
    providerGoogle: 'Google',
    providerApple: 'Apple',
    logout: 'Log out',
  },
  admin: {
    title: 'Admin panel',
    subtitle: 'Manage products, stock and subcategories',
    tabProducts: 'Products',
    tabAddProduct: 'New product',
    tabSubcategories: 'Subcategories',
    forbidden: 'Admin access only',
    loading: 'Loading...',
    searchPlaceholder: 'Search by name or SKU...',
    stock: 'Stock',
    saveStock: 'Save',
    edit: 'Edit',
    remove: 'Delete',
    removeConfirm: 'Delete this product?',
    createProduct: 'Create product',
    updateProduct: 'Save changes',
    cancelEdit: 'Cancel',
    name: 'Name',
    slug: 'Slug',
    sku: 'SKU',
    price: 'Price',
    discountPrice: 'Discount price',
    shortDescription: 'Short description',
    description: 'Description',
    images: 'Images (comma-separated URLs)',
    imagesHint: 'Example: /media/BeadsAgate.jpg',
    media: 'Media',
    mediaDropTitle: 'Paste, drop or choose files',
    mediaDropHint: 'Paste one or more images from clipboard (Ctrl+V / ⌘V), or upload photos and a video',
    addImages: 'Add photos',
    addVideo: 'Add video',
    video: 'Video',
    uploading: 'Uploading...',
    uploadError: 'Could not upload file',
    removeMedia: 'Remove',
    imagesRequired: 'Add at least one image',
    subcategory: 'Subcategory',
    featured: 'Featured',
    popular: 'Popular',
    isNew: 'New',
    createSubcategory: 'Add subcategory',
    category: 'Category',
    subName: 'Subcategory name',
    subSlug: 'Subcategory slug',
    subImage: 'Image URL',
    successSaved: 'Saved',
    successCreated: 'Product created',
    successDeleted: 'Product deleted',
    successSubCreated: 'Subcategory created',
    errorGeneric: 'Something went wrong',
    errorSlugTaken: 'This slug is already taken',
    errorSkuTaken: 'This SKU is already taken',
    errorInOrders: 'Cannot delete: product is used in orders',
  },
}
