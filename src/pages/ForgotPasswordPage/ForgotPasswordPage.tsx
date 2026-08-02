import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Breadcrumbs, Input, PhoneInput } from '@/components/ui'
import { useAuthStore, type AuthError } from '@/store'
import styles from '@/pages/AuthPage/AuthPage.module.scss'

function errorText(error: AuthError) {
  switch (error) {
    case 'invalid_phone':
      return 'Введіть коректний номер телефону.'
    case 'invalid_code':
      return 'Невірний код із SMS.'
    case 'code_expired':
      return 'Термін дії коду завершився. Запросіть новий код.'
    case 'too_many_attempts':
      return 'Забагато невдалих спроб. Запросіть новий код.'
    case 'code_send_too_soon':
      return 'Новий код можна надіслати через хвилину.'
    case 'weak_password':
      return 'Пароль має містити щонайменше 6 символів.'
    default:
      return 'Не вдалося виконати дію. Спробуйте ще раз.'
  }
}

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const forgotPassword = useAuthStore((s) => s.forgotPassword)
  const resetPassword = useAuthStore((s) => s.resetPassword)
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [step, setStep] = useState<'phone' | 'reset'>('phone')
  const [error, setError] = useState<AuthError | null>(null)
  const [loading, setLoading] = useState(false)

  const sendCode = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    const result = await forgotPassword(phone)
    setLoading(false)
    if (result) {
      setError(result)
      return
    }
    setStep('reset')
  }

  const reset = async (event: FormEvent) => {
    event.preventDefault()
    if (password !== passwordConfirmation) {
      setError('required')
      return
    }
    setLoading(true)
    setError(null)
    const result = await resetPassword(phone, code, password)
    setLoading(false)
    if (result) {
      setError(result)
      return
    }
    navigate('/login?passwordReset=1', { replace: true })
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <Breadcrumbs items={[{ label: 'Головна', href: '/' }, { label: 'Відновлення пароля' }]} />
        <div className={styles.card}>
          <h1 className={styles.title}>{step === 'phone' ? 'Відновлення пароля' : 'Новий пароль'}</h1>
          <p className={styles.subtitle}>
            {step === 'phone'
              ? 'Вкажіть номер телефону — ми надішлемо 4-значний код.'
              : `Введіть код із SMS для номера ${phone} та встановіть новий пароль.`}
          </p>
          <form className={styles.form} onSubmit={step === 'phone' ? sendCode : reset} noValidate>
            {step === 'phone' ? (
              <PhoneInput label="Телефон" name="phone" value={phone} onChange={setPhone} required />
            ) : (
              <>
                <Input
                  label="Код із SMS"
                  name="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={4}
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 4))}
                  required
                />
                <Input
                  label="Новий пароль"
                  name="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <Input
                  label="Підтвердіть новий пароль"
                  name="new-password-confirmation"
                  type="password"
                  autoComplete="new-password"
                  value={passwordConfirmation}
                  onChange={(event) => setPasswordConfirmation(event.target.value)}
                  required
                />
              </>
            )}
            {error && (
              <p className={styles.error} role="alert">
                {error === 'required' && step === 'reset' ? 'Паролі не збігаються.' : errorText(error)}
              </p>
            )}
            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              disabled={step === 'reset' && (code.length !== 4 || !password || !passwordConfirmation)}
            >
              {step === 'phone' ? 'Надіслати код' : 'Зберегти новий пароль'}
            </Button>
          </form>
          <p className={styles.backHome}>
            <Link to="/login">Повернутися до входу</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
