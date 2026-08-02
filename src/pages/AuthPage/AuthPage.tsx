import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, User, Eye, EyeOff } from 'lucide-react'
import { useAuthStore, type AuthError } from '@/store'
import { useCartStore, useWishlistStore } from '@/store'
import { useTranslation, type TranslationKey } from '@/i18n/useTranslation'
import { Button, Input, PhoneInput, Breadcrumbs } from '@/components/ui'
import styles from './AuthPage.module.scss'

type AuthMode = 'login' | 'register'

const ERROR_KEYS: Record<AuthError, TranslationKey> = {
  email_taken: 'auth.errorEmailTaken',
  phone_taken: 'auth.errorPhoneTaken',
  invalid_credentials: 'auth.errorInvalidCredentials',
  weak_password: 'auth.errorWeakPassword',
  required: 'auth.errorRequired',
  invalid_email: 'auth.errorInvalidEmail',
  invalid_phone: 'auth.errorInvalidPhone',
  name_required: 'auth.errorNameRequired',
  oauth_not_configured: 'auth.errorOauthNotConfigured',
  oauth_denied: 'auth.errorOauthDenied',
  oauth_failed: 'auth.errorOauthFailed',
  invalid_code: 'auth.errorOauthFailed',
  code_expired: 'auth.errorOauthFailed',
  too_many_attempts: 'auth.errorOauthFailed',
  code_send_too_soon: 'auth.errorOauthFailed',
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58Z"
      />
    </svg>
  )
}

async function syncUserData() {
  await Promise.all([
    useCartStore.getState().mergeGuestCartToServer(),
    useWishlistStore.getState().mergeGuestWishlistToServer(),
  ])
}

export function AuthPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const user = useAuthStore((s) => s.user)
  const login = useAuthStore((s) => s.login)
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle)
  const register = useAuthStore((s) => s.register)
  const verifyRegistration = useAuthStore((s) => s.verifyRegistration)

  const modeParam = searchParams.get('mode')
  const mode: AuthMode = modeParam === 'register' ? 'register' : 'login'
  const oauthError = searchParams.get('error') as AuthError | null

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<AuthError | null>(oauthError)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [registrationVerification, setRegistrationVerification] = useState(false)
  const [code, setCode] = useState('')

  useEffect(() => {
    if (user) {
      const returnTo = searchParams.get('returnTo')
      const safeReturn =
        returnTo && returnTo.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/profile'
      navigate(safeReturn, { replace: true })
    }
  }, [user, navigate, searchParams])

  const setMode = (next: AuthMode) => {
    setError(null)
    setRegistrationVerification(false)
    setCode('')
    const returnTo = searchParams.get('returnTo')
    const nextParams = new URLSearchParams()
    if (next === 'register') nextParams.set('mode', 'register')
    if (returnTo) nextParams.set('returnTo', returnTo)
    setSearchParams(nextParams, { replace: true })
  }

  const redirectAfterAuth = async () => {
    await syncUserData()
    const returnTo = searchParams.get('returnTo')
    const safeReturn =
      returnTo && returnTo.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/profile'
    navigate(safeReturn, { replace: true })
  }

  const handleGoogle = async () => {
    setError(null)
    setGoogleLoading(true)
    const result = await loginWithGoogle()
    setGoogleLoading(false)
    if (result) {
      setError(result)
      return
    }
    // Live mode redirects away; mock mode stays here and sets user
    if (useAuthStore.getState().user) {
      await redirectAfterAuth()
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result =
      mode === 'login' ? await login(phone, password) : await register({ firstName, lastName, phone, password })

    setLoading(false)
    if (result) {
      setError(result)
      return
    }

    if (mode === 'register') {
      setRegistrationVerification(true)
      return
    }
    await redirectAfterAuth()
  }

  const handleVerifyRegistration = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await verifyRegistration(phone, code)
    setLoading(false)
    if (result) {
      setError(result)
      return
    }
    await redirectAfterAuth()
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <Breadcrumbs
          items={[
            { label: t('about.breadcrumbHome'), href: '/' },
            { label: mode === 'login' ? t('auth.loginTitle') : t('auth.registerTitle') },
          ]}
        />

        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className={styles.tabs} role="tablist" aria-label={t('auth.tabsAria')}>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              className={[styles.tab, mode === 'login' ? styles.tabActive : ''].filter(Boolean).join(' ')}
              onClick={() => setMode('login')}
            >
              {t('auth.loginTab')}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              className={[styles.tab, mode === 'register' ? styles.tabActive : ''].filter(Boolean).join(' ')}
              onClick={() => setMode('register')}
            >
              {t('auth.registerTab')}
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: mode === 'login' ? -12 : 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === 'login' ? 12 : -12 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className={styles.title}>
                {registrationVerification ? 'Підтвердіть номер телефону' : mode === 'login' ? t('auth.loginTitle') : t('auth.registerTitle')}
              </h1>
              <p className={styles.subtitle}>
                {registrationVerification
                  ? `Ми надіслали 4-значний код на номер ${phone}.`
                  : mode === 'login'
                    ? t('auth.loginSubtitle')
                    : t('auth.registerSubtitle')}
              </p>

              {registrationVerification ? (
                <form className={styles.form} onSubmit={handleVerifyRegistration} noValidate>
                  <Input
                    label="Код із SMS"
                    name="code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={4}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    required
                  />
                  {error && (
                    <p className={styles.error} role="alert">
                      {error === 'invalid_code'
                        ? 'Невірний код. Спробуйте ще раз.'
                        : error === 'code_expired'
                          ? 'Термін дії коду завершився. Зареєструйтесь ще раз.'
                          : error === 'too_many_attempts'
                            ? 'Забагато спроб. Зареєструйтесь ще раз.'
                            : t(ERROR_KEYS[error] ?? 'auth.errorOauthFailed')}
                    </p>
                  )}
                  <Button type="submit" fullWidth size="lg" loading={loading} disabled={code.length !== 4}>
                    Підтвердити номер
                  </Button>
                  <button type="button" className={styles.switchLink} onClick={() => setRegistrationVerification(false)}>
                    Змінити дані
                  </button>
                </form>
              ) : (
                <>
              <div className={styles.socialBlock}>
                <button
                  type="button"
                  className={styles.socialBtn}
                  onClick={() => void handleGoogle()}
                  disabled={googleLoading}
                >
                  <GoogleIcon />
                  <span>{t('auth.continueGoogle')}</span>
                </button>
              </div>

              <div className={styles.divider} role="separator">
                <span>{t('auth.orPhone')}</span>
              </div>

              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                {mode === 'register' && (
                  <div className={styles.nameRow}>
                    <Input
                      label={t('auth.firstName')}
                      name="firstName"
                      autoComplete="given-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      leftIcon={<User />}
                      required
                    />
                    <Input
                      label={t('auth.lastName')}
                      name="lastName"
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      leftIcon={<User />}
                      required
                    />
                  </div>
                )}

                <PhoneInput
                  label={t('auth.phone')}
                  name="phone"
                  value={phone}
                  onChange={setPhone}
                  required
                />

                <Input
                  label={t('auth.password')}
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock />}
                  rightIcon={
                    <button
                      type="button"
                      className={styles.eyeBtn}
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                  required
                />

                {error && (
                  <p className={styles.error} role="alert">
                    {t(ERROR_KEYS[error] ?? 'auth.errorOauthFailed')}
                  </p>
                )}

                <Button type="submit" fullWidth size="lg" loading={loading}>
                  {mode === 'login' ? t('auth.loginSubmit') : t('auth.registerSubmit')}
                </Button>
              </form>

              <p className={styles.switchHint}>
                {mode === 'login' ? (
                  <>
                    {t('auth.noAccount')}{' '}
                    <button type="button" className={styles.switchLink} onClick={() => setMode('register')}>
                      {t('auth.registerTab')}
                    </button>
                    <br />
                    <Link className={styles.switchLink} to="/forgot-password">
                      Забули пароль?
                    </Link>
                  </>
                ) : (
                  <>
                    {t('auth.hasAccount')}{' '}
                    <button type="button" className={styles.switchLink} onClick={() => setMode('login')}>
                      {t('auth.loginTab')}
                    </button>
                  </>
                )}
              </p>
                </>
              )}

              <p className={styles.backHome}>
                <Link to="/">{t('auth.backHome')}</Link>
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
