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
    selectAll: string
    deselectAll: string
    removeSelected: string
    removeSelectedAria: string
    selectedCount: string
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
    subtotal: string
    discount: string
    discountVolume: string
    discountPersonal: string
    discountMixed: string
    delivery: string
    deliveryNote: string
    deliveryFree: string
    total: string
    checkout: string
    checkoutSoon: string
    checkoutShort: string
    continueShopping: string
    halfStrandsMergedOne: string
    halfStrandsMergedMany: string
    toastDismiss: string
  }
  checkout: {
    title: string
    breadcrumb: string
    stepContact: string
    stepLocation: string
    stepPayment: string
    required: string
    edit: string
    expand: string
    collapse: string
    continue: string
    firstName: string
    lastName: string
    phone: string
    email: string
    emailOptional: string
    deliveryMethod: string
    novaPoshta: string
    novaPoshtaHint: string
    novaPoshtaWarehouse: string
    novaPoshtaParcelLocker: string
    novaPoshtaCourier: string
    ukrposhta: string
    ukrposhtaHint: string
    ukrposhtaBasic: string
    ukrposhtaPriority: string
    ukrposhtaCityHint: string
    ukrposhtaCityOptional: string
    ukrposhtaIndexHint: string
    selfPickup: string
    selfPickupHint: string
    selfPickupAddress: string
    city: string
    cityPlaceholder: string
    cityHint: string
    citySimplePlaceholder: string
    branch: string
    branchPlaceholder: string
    branchHint: string
    branchSelectCityFirst: string
    branchAddressLabel: string
    address: string
    addressPlaceholder: string
    postalIndex: string
    postalIndexPlaceholder: string
    searchLoading: string
    searchEmpty: string
    paymentPickup: string
    paymentPickupHint: string
    paymentBank: string
    paymentBankHint: string
    paymentBankRecipientLabel: string
    paymentBankRecipient: string
    paymentBankIbanLabel: string
    paymentBankIban: string
    paymentBankTaxIdLabel: string
    paymentBankTaxId: string
    paymentBankPurposeLabel: string
    paymentBankPurpose: string
    paymentBankCopy: string
    paymentBankCopied: string
    paymentBankPayerFullName: string
    paymentBankPayerFullNameHint: string
    paymentBankPayerFullNamePlaceholder: string
    comment: string
    commentPlaceholder: string
    toPay: string
    placeOrder: string
    emptyCart: string
    loginRequired: string
    successTitle: string
    successDescription: string
    successGuestDescription: string
    goToOrders: string
    errorRequired: string
    errorPhone: string
    errorCity: string
    errorBranch: string
    errorAddress: string
    errorPostalIndex: string
    errorPayment: string
    errorPayerFullName: string
    errorSubmit: string
    contactSummary: string
    locationSummaryBranch: string
    locationSummaryCourier: string
    locationSummaryUkrposhta: string
    locationSummaryUkrposhtaIndex: string
    locationSummarySelfPickup: string
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
  error: {
    title: string
    description: string
    chunkTitle: string
    chunkDescription: string
    retry: string
    goHome: string
    details: string
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
    beadCount: string
    beadCountValue: string
    strandLength: string
    threadLength: string
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
    password: string
    showPassword: string
    hidePassword: string
    loginSubmit: string
    registerSubmit: string
    continueGoogle: string
    orPhone: string
    continue: string
    cancel: string
    noAccount: string
    hasAccount: string
    backHome: string
    backToLogin: string
    oauthProcessing: string
    oauthErrorTitle: string
    errorEmailTaken: string
    errorPhoneTaken: string
    errorInvalidCredentials: string
    errorWeakPassword: string
    errorRequired: string
    errorInvalidEmail: string
    errorInvalidPhone: string
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
    logout: string
    discountsTitle: string
    discountsEmpty: string
    discountPersonal: string
    ordersTitle: string
    ordersEmpty: string
    orderNumber: string
    orderItemsCount: string
    showOrderItems: string
    hideOrderItems: string
    orderItemQty: string
    orderStatus: {
      pending: string
      confirmed: string
      processing: string
      assembling: string
      ready: string
      shipped: string
      delivered: string
      cancelled: string
      refunded: string
    }
    favouritesTitle: string
    favouritesEmpty: string
    openWishlist: string
    checkoutCta: string
    reviewTitle: string
    reviewHint: string
    reviewPlaceholder: string
    reviewSubmit: string
    reviewSuccess: string
    reviewAlready: string
    reviewNeedPurchase: string
    reviewRatingLabel: string
    reviewError: string
  }
  storeReviews: {
    sortByDate: string
    sortByRating: string
    sortAria: string
    empty: string
    leaveReview: string
    anonymousAuthor: string
    guestHint: string
    guestFormTitle: string
    guestSuccess: string
  }
  admin: {
    title: string
    subtitle: string
    tabProducts: string
    tabAddProduct: string
    tabSubcategories: string
    tabUsers: string
    tabOrders: string
    forbidden: string
    loading: string
    usersSearch: string
    usersDiscount: string
    usersDiscountLabel: string
    usersSaveDiscount: string
    usersClearDiscount: string
    usersSaved: string
    usersEmpty: string
    usersContact: string
    searchPlaceholder: string
    ordersSearch: string
    ordersEmpty: string
    ordersCustomer: string
    ordersGuest: string
    ordersTotal: string
    ordersPayment: string
    ordersFulfillment: string
    ordersSaved: string
    ordersShowItems: string
    ordersHideItems: string
    ordersItemQty: string
    ordersItemPrice: string
    ordersDelivery: string
    ordersPaymentMethod: string
    ordersPayerFullName: string
    ordersCodHint: string
    ordersPaginationAria: string
    paymentStatus: {
      unpaid: string
      awaiting_payment: string
      paid: string
      failed: string
    }
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
    skuHint: string
    skuPlaceholder: string
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
    attributesTitle: string
    attributesMineralTitle: string
    attributesThreadTitle: string
    attributesBraceletTitle: string
    attributesGenericTitle: string
    attributesMineralHint: string
    attributesThreadHint: string
    attributesBraceletHint: string
    attributesGenericHint: string
    attributesBuyerOptionsTitle: string
    attributesBuyerOptionsMineralHint: string
    attrBeadSizes: string
    attrBeadSizesHint: string
    attrBeadCounts: string
    attrBeadCountsHint: string
    attrStrandLengths: string
    attrStrandLengthsHint: string
    attrStrandLabel: string
    attrStrandValue: string
    attrThreadLengths: string
    attrThreadLengthsHint: string
    attrWristSizes: string
    attrWristSizesHint: string
    attrWristRange: string
    attrDefaultLength: string
    attrAddCustom: string
    attrColor: string
    attrOrigin: string
    attrHardness: string
    attrShape: string
    attrDiameter: string
    attrMaterial: string
    attrThreadColor: string
    attrStones: string
    attrSize: string
    attrWeight: string
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
    selectAll: 'Обрати всі',
    deselectAll: 'Зняти вибір',
    removeSelected: 'Видалити',
    removeSelectedAria: 'Видалити обрані',
    selectedCount: 'Обрано {count}',
  },
  home: {
    heroTitle: 'Ласкаво просимо до',
    heroDescription: 'Справжній простір для поціновувачів природної краси та унікальних мінералів',
    catalogTitle: 'Каталог товарів',
    catalogSubtitle: 'Категорії для вашого натхнення',
    newTitle: 'Новинки',
    newPaginationAria: 'Сторінки новинок',
    popularTitle: 'Популярні товари',
    advantagesTitle: 'Наші переваги',
    advantageNaturalTitle: 'Натуральні матеріали',
    advantageNaturalText: 'Лише натуральні мінерали та вироби з природного каменю',
    advantageHandmadeTitle: 'Унікальність',
    advantageHandmadeText: 'Кожен камінь має неповторний природний малюнок, форму та відтінок',
    advantageDeliveryTitle: 'Швидка доставка',
    advantageDeliveryText: 'Відправляємо з понеділка по пʼятницю Новою Поштою та Укрпоштою',
    advantageQualityTitle: 'Гарантія якості',
    advantageQualityText: 'Ретельний відбір, обмін або повернення без зайвих питань',
    aboutEyebrow: 'Про компанію',
    aboutDescription1:
      'Ми — команда, яка щиро захоплюється красою мінералів і вже багато років допомагає людям знаходити саме ті камені, які надихають, прикрашають та дарують естетичне задоволення.',
    aboutDescription2:
      'У нашому асортименті — натуральні мінерали, колекційні зразки, галтовка, намистини, браслети, підвіски та інші вироби з природного каменю.',
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
    subtotal: 'Сума',
    discount: 'Знижка',
    discountVolume: 'знижка за суму {percent}%',
    discountPersonal: 'постійна знижка {percent}%',
    discountMixed: 'постійна {personal}% + низки {strands}%',
    delivery: 'Доставка',
    deliveryNote: 'за тарифами перевізника',
    deliveryFree: 'Безкоштовно',
    total: 'Разом',
    checkout: 'Оформити замовлення',
    checkoutSoon: 'Оформлення замовлення — незабаром',
    checkoutShort: 'Оформити',
    continueShopping: 'Продовжити покупки',
    halfStrandsMergedOne:
      'Дві однакові пів низки обʼєднано в одну цілу низку в кошику.',
    halfStrandsMergedMany:
      '{count} пари однакових пів низок обʼєднано в цілі низки в кошику.',
    toastDismiss: 'Закрити повідомлення',
  },
  checkout: {
    title: 'Оформлення замовлення',
    breadcrumb: 'Оформлення',
    stepContact: 'Контактні дані',
    stepLocation: 'Доставка',
    stepPayment: 'Оплата',
    required: '*',
    edit: 'Змінити',
    expand: 'Розгорнути',
    collapse: 'Згорнути',
    continue: 'Далі',
    firstName: 'Імʼя',
    lastName: 'Прізвище',
    phone: 'Телефон',
    email: 'Email',
    emailOptional: 'Email (необовʼязково)',
    deliveryMethod: 'Спосіб доставки',
    novaPoshta: 'Нова Пошта',
    novaPoshtaHint: 'Відділення, поштомат або курʼєр',
    novaPoshtaWarehouse: 'У відділення',
    novaPoshtaParcelLocker: 'У поштомат',
    novaPoshtaCourier: 'Курʼєром',
    ukrposhta: 'Укрпошта',
    ukrposhtaHint: 'Доставка за поштовим індексом',
    ukrposhtaBasic: 'Базовий',
    ukrposhtaPriority: 'Пріоритетний',
    ukrposhtaCityHint: 'Необовʼязково — оберіть зі списку або введіть назву вручну',
    ukrposhtaCityOptional: 'Місто (необовʼязково)',
    ukrposhtaIndexHint: '5-значний індекс відділення Укрпошти',
    selfPickup: 'Самовивіз',
    selfPickupHint: 'Забрати самостійно з магазину',
    selfPickupAddress: 'вул. Короленка, 32А, Кропивницький',
    city: 'Місто',
    cityPlaceholder: 'Почніть вводити назву міста або села',
    cityHint: 'Оберіть зі списку підказок',
    citySimplePlaceholder: 'Введіть назву міста',
    branch: 'Відділення',
    branchPlaceholder: 'Номер відділення, наприклад 137',
    branchHint: 'Оберіть відділення — адреса підставиться автоматично',
    branchSelectCityFirst: 'Спочатку оберіть місто',
    branchAddressLabel: 'Адреса відділення: {address}',
    address: 'Адреса доставки',
    addressPlaceholder: 'Вулиця, будинок, квартира',
    postalIndex: 'Поштовий індекс',
    postalIndexPlaceholder: 'Наприклад, 25000',
    searchLoading: 'Пошук…',
    searchEmpty: 'Нічого не знайдено',
    paymentPickup: 'Післяплата',
    paymentPickupHint: 'Готівкою або карткою при отриманні',
    paymentBank: 'Повна оплата на рахунок',
    paymentBankHint: 'Переказ на банківський рахунок',
    paymentBankRecipientLabel: 'Одержувач',
    paymentBankRecipient: 'ФОП Глущенко Ілля Володимирович',
    paymentBankIbanLabel: 'IBAN',
    paymentBankIban: 'UA743052990000026000005107086',
    paymentBankTaxIdLabel: 'ЄДРПОУ/ІПН',
    paymentBankTaxId: '3817313230',
    paymentBankPurposeLabel: 'Призначення',
    paymentBankPurpose: 'Оплата за товар',
    paymentBankCopy: 'Копіювати',
    paymentBankCopied: 'Скопійовано',
    paymentBankPayerFullName: 'ПІБ платника',
    paymentBankPayerFullNameHint:
      'Вкажіть ПІБ людини, яка здійснюватиме оплату. Може відрізнятися від даних отримувача.',
    paymentBankPayerFullNamePlaceholder: 'Прізвище Імʼя По батькові',
    comment: 'Коментар до замовлення',
    commentPlaceholder: 'Побажання до доставки або замовлення',
    toPay: 'До оплати',
    placeOrder: 'Оформити замовлення',
    emptyCart: 'Кошик порожній — додайте товари, щоб оформити замовлення',
    loginRequired: 'Увійдіть, щоб оформити замовлення',
    successTitle: 'Замовлення оформлено!',
    successDescription: 'Ми зберегли ваше замовлення. Статус можна переглянути в профілі.',
    successGuestDescription: 'Дякуємо за замовлення! Ми звʼяжемося з вами для підтвердження.',
    goToOrders: 'До замовлень',
    errorRequired: 'Заповніть обовʼязкові поля',
    errorPhone: 'Введіть коректний номер телефону',
    errorCity: 'Вкажіть місто',
    errorBranch: 'Оберіть відділення Нової Пошти зі списку',
    errorAddress: 'Вкажіть адресу доставки',
    errorPostalIndex: 'Вкажіть коректний 5-значний поштовий індекс',
    errorPayment: 'Оберіть спосіб оплати',
    errorPayerFullName: 'Вкажіть ПІБ платника як у банківській виписці',
    errorSubmit: 'Не вдалося оформити замовлення. Спробуйте ще раз',
    contactSummary: '{name}, {phone}',
    locationSummaryBranch: '{city}, відділення: {branch}',
    locationSummaryCourier: '{city}, {address}',
    locationSummaryUkrposhta: 'Укрпошта ({type}), індекс {index}',
    locationSummaryUkrposhtaIndex: 'Укрпошта ({type}), {city}, індекс {index}',
    locationSummarySelfPickup: 'Самовивіз: {address}',
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
  error: {
    title: 'Щось пішло не так',
    description: 'Сталася неочікувана помилка. Спробуйте оновити сторінку або повернутися на головну.',
    chunkTitle: 'Не вдалося завантажити сторінку',
    chunkDescription: 'Можливо, сайт щойно оновився. Оновіть сторінку, щоб завантажити нову версію.',
    retry: 'Оновити сторінку',
    goHome: 'На головну',
    details: 'Деталі помилки',
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
    beadCount: 'Кількість бусин',
    beadCountValue: '{value} шт.',
    strandLength: 'Довжина низки',
    threadLength: 'Довжина низки',
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
    loginSubtitle: 'Увійдіть за номером телефону або через Google',
    registerSubtitle: 'Зареєструйтесь за телефоном або увійдіть через Google',
    firstName: "Ім'я",
    lastName: 'Прізвище',
    email: 'Email',
    phone: 'Телефон',
    password: 'Пароль',
    showPassword: 'Показати пароль',
    hidePassword: 'Сховати пароль',
    loginSubmit: 'Увійти',
    registerSubmit: 'Зареєструватися',
    continueGoogle: 'Увійти через Google',
    orPhone: 'або за телефоном',
    continue: 'Продовжити',
    cancel: 'Скасувати',
    noAccount: 'Ще немає акаунту?',
    hasAccount: 'Вже є акаунт?',
    backHome: 'На головну',
    backToLogin: 'Повернутися до входу',
    oauthProcessing: 'Завершуємо вхід...',
    oauthErrorTitle: 'Не вдалося увійти',
    errorEmailTaken: 'Користувач з таким email вже існує',
    errorPhoneTaken: 'Користувач з таким телефоном вже існує',
    errorInvalidCredentials: 'Невірний телефон або пароль',
    errorWeakPassword: 'Пароль має містити щонайменше 6 символів',
    errorRequired: 'Заповніть усі обовʼязкові поля',
    errorInvalidEmail: 'Введіть коректний email',
    errorInvalidPhone: 'Введіть коректний номер телефону',
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
    logout: 'Вийти',
    discountsTitle: 'Ваші знижки',
    discountsEmpty: 'Персональних знижок поки немає. Власник магазину може призначити їх окремим клієнтам.',
    discountPersonal: 'Персональна знижка (на все, крім низок)',
    ordersTitle: 'Історія замовлень',
    ordersEmpty: 'Замовлень ще немає',
    orderNumber: 'Замовлення #{id}',
    orderItemsCount: '{count} поз.',
    showOrderItems: 'Показати товари',
    hideOrderItems: 'Сховати товари',
    orderItemQty: '{count} шт.',
    orderStatus: {
      pending: 'Очікує',
      confirmed: 'Підтверджено',
      processing: 'В обробці',
      assembling: 'Збирається',
      ready: 'Готово',
      shipped: 'Відправлено',
      delivered: 'Доставлено',
      cancelled: 'Скасовано',
      refunded: 'Повернено',
    },
    favouritesTitle: 'Обрані товари',
    favouritesEmpty: 'У обраному поки порожньо',
    openWishlist: 'Відкрити обране',
    checkoutCta: 'Оформити замовлення',
    reviewTitle: 'Відгук про магазин',
    reviewHint: 'Поділіться враженням про сервіс, доставку та якість обслуговування.',
    reviewPlaceholder: 'Напишіть ваш відгук (мінімум 10 символів)',
    reviewSubmit: 'Надіслати відгук',
    reviewSuccess: 'Дякуємо! Ваш відгук опубліковано.',
    reviewAlready: 'Ви вже залишили відгук про магазин.',
    reviewNeedPurchase: 'Відгук можна залишити після першого замовлення.',
    reviewRatingLabel: 'Ваша оцінка',
    reviewError: 'Не вдалося надіслати відгук. Спробуйте ще раз.',
  },
  storeReviews: {
    sortByDate: 'За датою',
    sortByRating: 'За оцінкою',
    sortAria: 'Сортування відгуків',
    empty: 'Відгуків поки немає',
    leaveReview: 'Залишити відгук',
    anonymousAuthor: 'Анонім',
    guestHint: 'Відгук буде опубліковано анонімно — без імені та контактів.',
    guestFormTitle: 'Залишити відгук',
    guestSuccess: 'Дякуємо! Ваш анонімний відгук опубліковано.',
  },
  admin: {
    title: 'Адмін-панель',
    subtitle: 'Керування товарами, замовленнями, залишками та знижками клієнтів',
    tabProducts: 'Товари',
    tabAddProduct: 'Новий товар',
    tabSubcategories: 'Підкатегорії',
    tabUsers: 'Клієнти',
    tabOrders: 'Замовлення',
    forbidden: 'Доступ лише для адміністратора',
    loading: 'Завантаження...',
    usersSearch: 'Пошук за телефоном, email або імʼям',
    usersDiscount: 'Знижка %',
    usersDiscountLabel: 'Назва знижки',
    usersSaveDiscount: 'Зберегти',
    usersClearDiscount: 'Зняти',
    usersSaved: 'Знижку збережено',
    usersEmpty: 'Клієнтів не знайдено',
    usersContact: 'Контакти',
    searchPlaceholder: 'Пошук за назвою або SKU...',
    ordersSearch: 'Пошук за ID замовлення (порожньо — всі)',
    ordersEmpty: 'Замовлень не знайдено',
    ordersCustomer: 'Клієнт',
    ordersGuest: 'Гість',
    ordersTotal: 'Сума',
    ordersPayment: 'Оплата',
    ordersFulfillment: 'Статус',
    ordersSaved: 'Статус замовлення оновлено',
    ordersShowItems: 'Показати товари',
    ordersHideItems: 'Сховати товари',
    ordersItemQty: '{count} шт.',
    ordersItemPrice: 'ціна',
    ordersDelivery: 'Доставка',
    ordersPaymentMethod: 'Спосіб оплати',
    ordersPayerFullName: 'ПІБ платника',
    ordersCodHint:
      'Післяплата — оформіть відправлення з наложеним платежем на пошті',
    ordersPaginationAria: 'Сторінки замовлень',
    paymentStatus: {
      unpaid: 'Не оплачено',
      awaiting_payment: 'Очікує оплату',
      paid: 'Оплачено',
      failed: 'Помилка оплати',
    },
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
    skuHint: 'Заповнюється автоматично з категорії, підкатегорії та назви. Можна змінити вручну.',
    skuPlaceholder: 'З’явиться після назви',
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
    attributesTitle: 'Параметри товару',
    attributesMineralTitle: 'Параметри мінералу',
    attributesThreadTitle: 'Параметри низки',
    attributesBraceletTitle: 'Параметри браслета',
    attributesGenericTitle: 'Характеристики',
    attributesMineralHint:
      'Для звичайного мінералу достатньо характеристик нижче. Вибірка на сайті з’явиться лише якщо заповнити блок варіантів.',
    attributesThreadHint:
      'У низок свої параметри: оберіть доступні довжини. Колір покупець обере на сторінці товару.',
    attributesBraceletHint:
      "У браслетів свої параметри: оберіть доступні розміри зап'ястка для цього товару.",
    attributesGenericHint: 'Лише характеристики — без вибірки на сторінці товару.',
    attributesBuyerOptionsTitle: 'Варіанти для вибору покупця (необовʼязково)',
    attributesBuyerOptionsMineralHint:
      'Залиште порожнім, якщо вибору немає. Для низок намистин завжди є ціла та пів низки (стандарт: 39 см / 19.5 см).',
    attrBeadSizes: 'Розмір намистини (мм)',
    attrBeadSizesHint: 'Покупець зможе обрати один із позначених розмірів.',
    attrBeadCounts: 'Кількість бусин',
    attrBeadCountsHint: 'Покупець зможе обрати кількість бусин.',
    attrStrandLengths: 'Довжина низки каміння',
    attrStrandLengthsHint:
      'Ціла та пів низки. Якщо порожньо — для низок підставляються 39 см і 19.5 см.',
    attrStrandLabel: 'Підпис (напр. Низка 39 см)',
    attrStrandValue: 'Значення (напр. 39 см)',
    attrThreadLengths: 'Довжина низки',
    attrThreadLengthsHint: 'Покупець зможе обрати одну з довжин. Можна залишити порожнім.',
    attrWristSizes: "Розмір зап'ястка",
    attrWristSizesHint: "Якщо нічого не обрати — на сайті будуть стандартні розміри 14–21 см.",
    attrWristRange: "Діапазон розміру (підказка)",
    attrDefaultLength: 'Довжина за замовчуванням',
    attrAddCustom: 'Додати свій варіант',
    attrColor: 'Колір',
    attrOrigin: 'Походження',
    attrHardness: 'Твердість',
    attrShape: 'Форма',
    attrDiameter: 'Товщина / діаметр',
    attrMaterial: 'Матеріал',
    attrThreadColor: 'Колір нитки',
    attrStones: 'Каміння (через кому)',
    attrSize: 'Розмір',
    attrWeight: 'Вага',
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
    selectAll: 'Select all',
    deselectAll: 'Deselect all',
    removeSelected: 'Delete',
    removeSelectedAria: 'Remove selected',
    selectedCount: 'Selected {count}',
  },
  home: {
    heroTitle: 'Welcome to',
    heroDescription: 'A genuine space for lovers of natural beauty and unique minerals',
    catalogTitle: 'Product catalog',
    catalogSubtitle: 'Categories for your inspiration',
    newTitle: 'New arrivals',
    newPaginationAria: 'New arrivals pages',
    popularTitle: 'Popular products',
    advantagesTitle: 'Our advantages',
    advantageNaturalTitle: 'Natural materials',
    advantageNaturalText: 'Only natural minerals and pieces made from natural stone',
    advantageHandmadeTitle: 'Uniqueness',
    advantageHandmadeText: 'Every stone has a one-of-a-kind natural pattern, shape, and shade',
    advantageDeliveryTitle: 'Fast delivery',
    advantageDeliveryText: 'We ship Monday to Friday via Nova Poshta and Ukrposhta',
    advantageQualityTitle: 'Quality guarantee',
    advantageQualityText: 'Careful selection, plus exchange or return without hassle',
    aboutEyebrow: 'About the company',
    aboutDescription1:
      'We are a team that truly loves the beauty of minerals and has helped people for many years find the stones that inspire, decorate, and bring aesthetic pleasure.',
    aboutDescription2:
      'Our assortment includes natural minerals, collector specimens, tumbled stones, beads, bracelets, pendants, charms, and other pieces made from natural stone.',
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
    subtotal: 'Subtotal',
    discount: 'Discount',
    discountVolume: 'volume discount {percent}%',
    discountPersonal: 'loyalty discount {percent}%',
    discountMixed: 'loyalty {personal}% + strands {strands}%',
    delivery: 'Delivery',
    deliveryNote: 'carrier rates apply',
    deliveryFree: 'Free',
    total: 'Total',
    checkout: 'Checkout',
    checkoutSoon: 'Checkout — coming soon',
    checkoutShort: 'Checkout',
    continueShopping: 'Continue shopping',
    halfStrandsMergedOne:
      'Two matching half strands were combined into one full strand in your cart.',
    halfStrandsMergedMany:
      '{count} pairs of matching half strands were combined into full strands in your cart.',
    toastDismiss: 'Dismiss notification',
  },
  checkout: {
    title: 'Checkout',
    breadcrumb: 'Checkout',
    stepContact: 'Contact details',
    stepLocation: 'Delivery',
    stepPayment: 'Payment',
    required: '*',
    edit: 'Edit',
    expand: 'Expand',
    collapse: 'Collapse',
    continue: 'Continue',
    firstName: 'First name',
    lastName: 'Last name',
    phone: 'Phone',
    email: 'Email',
    emailOptional: 'Email (optional)',
    deliveryMethod: 'Delivery method',
    novaPoshta: 'Nova Poshta',
    novaPoshtaHint: 'Branch, parcel locker or courier',
    novaPoshtaWarehouse: 'To branch',
    novaPoshtaParcelLocker: 'To parcel locker',
    novaPoshtaCourier: 'By courier',
    ukrposhta: 'Ukrposhta',
    ukrposhtaHint: 'Delivery by postal index',
    ukrposhtaBasic: 'Basic',
    ukrposhtaPriority: 'Priority',
    ukrposhtaCityHint: 'Optional — pick a suggestion or type the city name yourself',
    ukrposhtaCityOptional: 'City (optional)',
    ukrposhtaIndexHint: '5-digit Ukrposhta branch index',
    selfPickup: 'Self-pickup',
    selfPickupHint: 'Pick up from the store',
    selfPickupAddress: 'Korolenka St., 32A, Kropyvnytskyi',
    city: 'City',
    cityPlaceholder: 'Start typing a city or village',
    cityHint: 'Pick a suggestion from the list',
    citySimplePlaceholder: 'Enter the city name',
    branch: 'Branch',
    branchPlaceholder: 'Branch number, e.g. 137',
    branchHint: 'Select a branch — the address fills in automatically',
    branchSelectCityFirst: 'Select a city first',
    branchAddressLabel: 'Branch address: {address}',
    address: 'Delivery address',
    addressPlaceholder: 'Street, building, apartment',
    postalIndex: 'Postal index',
    postalIndexPlaceholder: 'e.g. 25000',
    searchLoading: 'Searching…',
    searchEmpty: 'No results',
    paymentPickup: 'Cash on delivery',
    paymentPickupHint: 'Cash or card on receipt',
    paymentBank: 'Full payment to account',
    paymentBankHint: 'Bank transfer to our account',
    paymentBankRecipientLabel: 'Recipient',
    paymentBankRecipient: 'FOP Hlushchenko Illia Volodymyrovych',
    paymentBankIbanLabel: 'IBAN',
    paymentBankIban: 'UA743052990000026000005107086',
    paymentBankTaxIdLabel: 'EDRPOU / Tax ID',
    paymentBankTaxId: '3817313230',
    paymentBankPurposeLabel: 'Payment purpose',
    paymentBankPurpose: 'Payment for goods',
    paymentBankCopy: 'Copy',
    paymentBankCopied: 'Copied',
    paymentBankPayerFullName: 'Payer full name',
    paymentBankPayerFullNameHint:
      'Enter the full name of the person who will make the payment. It may differ from the recipient details.',
    paymentBankPayerFullNamePlaceholder: 'Surname First name Patronymic',
    comment: 'Order comment',
    commentPlaceholder: 'Delivery or order notes',
    toPay: 'To pay',
    placeOrder: 'Place order',
    emptyCart: 'Your cart is empty — add products to place an order',
    loginRequired: 'Sign in to place an order',
    successTitle: 'Order placed!',
    successDescription: 'Your order has been saved. You can track its status in your profile.',
    successGuestDescription: 'Thank you for your order! We will contact you to confirm.',
    goToOrders: 'View orders',
    errorRequired: 'Please fill in the required fields',
    errorPhone: 'Enter a valid phone number',
    errorCity: 'Enter the city',
    errorBranch: 'Select a Nova Poshta branch from the list',
    errorAddress: 'Enter a delivery address',
    errorPostalIndex: 'Enter a valid 5-digit postal index',
    errorPayment: 'Select a payment method',
    errorPayerFullName: 'Enter the payer full name as on the bank statement',
    errorSubmit: 'Could not place the order. Please try again',
    contactSummary: '{name}, {phone}',
    locationSummaryBranch: '{city}, branch: {branch}',
    locationSummaryCourier: '{city}, {address}',
    locationSummaryUkrposhta: 'Ukrposhta ({type}), index {index}',
    locationSummaryUkrposhtaIndex: 'Ukrposhta ({type}), {city}, index {index}',
    locationSummarySelfPickup: 'Self-pickup: {address}',
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
  error: {
    title: 'Something went wrong',
    description: 'An unexpected error occurred. Try refreshing the page or go back home.',
    chunkTitle: 'Failed to load the page',
    chunkDescription: 'The site may have just been updated. Refresh the page to load the new version.',
    retry: 'Refresh page',
    goHome: 'Go home',
    details: 'Error details',
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
    beadCount: 'Bead count',
    beadCountValue: '{value} pcs',
    strandLength: 'Strand length',
    threadLength: 'Cord length',
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
    loginSubtitle: 'Sign in with your phone number or Google',
    registerSubtitle: 'Register with your phone or sign in with Google',
    firstName: 'First name',
    lastName: 'Last name',
    email: 'Email',
    phone: 'Phone',
    password: 'Password',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    loginSubmit: 'Sign in',
    registerSubmit: 'Create account',
    continueGoogle: 'Sign in with Google',
    orPhone: 'or with phone',
    continue: 'Continue',
    cancel: 'Cancel',
    noAccount: 'No account yet?',
    hasAccount: 'Already have an account?',
    backHome: 'Back to home',
    backToLogin: 'Back to login',
    oauthProcessing: 'Finishing sign-in...',
    oauthErrorTitle: 'Sign-in failed',
    errorEmailTaken: 'An account with this email already exists',
    errorPhoneTaken: 'An account with this phone already exists',
    errorInvalidCredentials: 'Invalid phone or password',
    errorWeakPassword: 'Password must be at least 6 characters',
    errorRequired: 'Please fill in all required fields',
    errorInvalidEmail: 'Enter a valid email address',
    errorInvalidPhone: 'Enter a valid phone number',
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
    logout: 'Log out',
    discountsTitle: 'Your discounts',
    discountsEmpty: 'No personal discounts yet. The store owner can assign them to selected customers.',
    discountPersonal: 'Personal discount (everything except strands)',
    ordersTitle: 'Order history',
    ordersEmpty: 'No orders yet',
    orderNumber: 'Order #{id}',
    orderItemsCount: '{count} items',
    showOrderItems: 'Show products',
    hideOrderItems: 'Hide products',
    orderItemQty: '× {count}',
    orderStatus: {
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      assembling: 'Assembling',
      ready: 'Ready',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      refunded: 'Refunded',
    },
    favouritesTitle: 'Favourite products',
    favouritesEmpty: 'Your favourites list is empty',
    openWishlist: 'Open wishlist',
    checkoutCta: 'Place an order',
    reviewTitle: 'Store review',
    reviewHint: 'Share your experience with our service, delivery and support.',
    reviewPlaceholder: 'Write your review (at least 10 characters)',
    reviewSubmit: 'Submit review',
    reviewSuccess: 'Thank you! Your review has been published.',
    reviewAlready: 'You have already left a store review.',
    reviewNeedPurchase: 'You can leave a review after your first order.',
    reviewRatingLabel: 'Your rating',
    reviewError: 'Could not submit the review. Please try again.',
  },
  storeReviews: {
    sortByDate: 'By date',
    sortByRating: 'By rating',
    sortAria: 'Sort reviews',
    empty: 'No reviews yet',
    leaveReview: 'Leave a review',
    anonymousAuthor: 'Anonymous',
    guestHint: 'Your review will be published anonymously — without your name or contacts.',
    guestFormTitle: 'Leave a review',
    guestSuccess: 'Thank you! Your anonymous review has been published.',
  },
  admin: {
    title: 'Admin panel',
    subtitle: 'Manage products, orders, stock and customer discounts',
    tabProducts: 'Products',
    tabAddProduct: 'New product',
    tabSubcategories: 'Subcategories',
    tabUsers: 'Customers',
    tabOrders: 'Orders',
    forbidden: 'Admin access only',
    loading: 'Loading...',
    usersSearch: 'Search by phone, email or name',
    usersDiscount: 'Discount %',
    usersDiscountLabel: 'Discount label',
    usersSaveDiscount: 'Save',
    usersClearDiscount: 'Clear',
    usersSaved: 'Discount saved',
    usersEmpty: 'No customers found',
    usersContact: 'Contacts',
    searchPlaceholder: 'Search by name or SKU...',
    ordersSearch: 'Search by order ID (empty — all)',
    ordersEmpty: 'No orders found',
    ordersCustomer: 'Customer',
    ordersGuest: 'Guest',
    ordersTotal: 'Total',
    ordersPayment: 'Payment',
    ordersFulfillment: 'Status',
    ordersSaved: 'Order status updated',
    ordersShowItems: 'Show products',
    ordersHideItems: 'Hide products',
    ordersItemQty: '{count} pcs',
    ordersItemPrice: 'price',
    ordersDelivery: 'Delivery',
    ordersPaymentMethod: 'Payment method',
    ordersPayerFullName: 'Payer full name',
    ordersCodHint:
      'Cash on delivery — create the shipment with COD at the post office',
    ordersPaginationAria: 'Order pages',
    paymentStatus: {
      unpaid: 'Unpaid',
      awaiting_payment: 'Awaiting payment',
      paid: 'Paid',
      failed: 'Payment failed',
    },
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
    skuHint: 'Filled automatically from category, subcategory and name. You can edit it.',
    skuPlaceholder: 'Appears after you enter a name',
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
    attributesTitle: 'Product options',
    attributesMineralTitle: 'Mineral details',
    attributesThreadTitle: 'Cord / strand options',
    attributesBraceletTitle: 'Bracelet options',
    attributesGenericTitle: 'Specifications',
    attributesMineralHint:
      'Most minerals only need the specs below. Buyer selection appears only if you fill the optional variants block.',
    attributesThreadHint:
      'Cords have their own options: choose available lengths. Color is selected on the product page.',
    attributesBraceletHint:
      'Bracelets have their own options: choose available wrist sizes for this product.',
    attributesGenericHint: 'Specs only — no buyer selection on the product page.',
    attributesBuyerOptionsTitle: 'Buyer selection options (optional)',
    attributesBuyerOptionsMineralHint:
      'Leave empty if there is no choice. Strand products always offer whole or half (defaults: 39 cm / 19.5 cm).',
    attrBeadSizes: 'Bead size (mm)',
    attrBeadSizesHint: 'The buyer can pick one of the selected sizes.',
    attrBeadCounts: 'Bead count',
    attrBeadCountsHint: 'The buyer can pick a bead count.',
    attrStrandLengths: 'Stone strand length',
    attrStrandLengthsHint:
      'Whole and half strand. If empty, strand products get 39 cm and 19.5 cm by default.',
    attrStrandLabel: 'Label (e.g. Strand 39 cm)',
    attrStrandValue: 'Value (e.g. 39 cm)',
    attrThreadLengths: 'Cord length',
    attrThreadLengthsHint: 'The buyer can pick one of these lengths. Can be left empty.',
    attrWristSizes: 'Wrist size',
    attrWristSizesHint: 'If none selected, the storefront shows default sizes 14–21 cm.',
    attrWristRange: 'Size range hint',
    attrDefaultLength: 'Default length',
    attrAddCustom: 'Add custom option',
    attrColor: 'Color',
    attrOrigin: 'Origin',
    attrHardness: 'Hardness',
    attrShape: 'Shape',
    attrDiameter: 'Diameter / thickness',
    attrMaterial: 'Material',
    attrThreadColor: 'Thread color',
    attrStones: 'Stones (comma-separated)',
    attrSize: 'Size',
    attrWeight: 'Weight',
    errorSlugTaken: 'This slug is already taken',
    errorSkuTaken: 'This SKU is already taken',
    errorInOrders: 'Cannot delete: product is used in orders',
  },
}
