import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { isAxiosError } from 'axios'
import { Pencil, Trash2, Plus, Layers } from 'lucide-react'
import { AdminApi, CatalogApi } from '@/api'
import type { AdminProductPayload, AdminUser } from '@/api'
import { useAuthStore } from '@/store'
import { useTranslation, type TranslationKey } from '@/i18n/useTranslation'
import { Button, Input, Breadcrumbs } from '@/components/ui'
import { MediaUploader } from '@/components/MediaUploader'
import type { Category, Product, SubCategory } from '@/types'
import styles from './AdminPage.module.scss'

type Tab = 'products' | 'create' | 'subcategories' | 'users'

const emptyForm: AdminProductPayload = {
  name: '',
  slug: '',
  sku: '',
  shortDescription: '',
  description: '',
  price: 0,
  discountPrice: null,
  stock: 0,
  images: [],
  video: null,
  subCategoryId: '',
  featured: false,
  popular: false,
  isNew: true,
  attributes: {},
}

function mapError(error: unknown): TranslationKey {
  if (isAxiosError(error)) {
    const code = error.response?.data?.error
    if (code === 'slug_taken') return 'admin.errorSlugTaken'
    if (code === 'sku_taken') return 'admin.errorSkuTaken'
    if (code === 'product_in_orders') return 'admin.errorInOrders'
    if (error.response?.status === 403) return 'admin.forbidden'
  }
  return 'admin.errorGeneric'
}

export function AdminPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const [tab, setTab] = useState<Tab>('products')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<SubCategory[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [discountDrafts, setDiscountDrafts] = useState<
    Record<string, { percent: string; label: string }>
  >({})
  const [stockDrafts, setStockDrafts] = useState<Record<string, number>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<AdminProductPayload>(emptyForm)
  const [saving, setSaving] = useState(false)

  const [subForm, setSubForm] = useState({
    name: '',
    slug: '',
    categoryId: '',
    image: '',
  })

  const isAdmin = user?.role === 'admin' || user?.role === 'manager'

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true })
      return
    }
    if (!isAdmin) return
  }, [user, isAdmin, navigate])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [prods, cats, subs, adminUsers] = await Promise.all([
        AdminApi.getProducts(),
        CatalogApi.getCategories(),
        CatalogApi.getSubcategories(),
        AdminApi.getUsers(),
      ])
      setProducts(prods)
      setCategories(cats)
      setSubcategories(subs)
      setUsers(adminUsers)
      setStockDrafts(Object.fromEntries(prods.map((p) => [p.id, p.stock])))
      setDiscountDrafts(
        Object.fromEntries(
          adminUsers.map((u) => [
            u.id,
            {
              percent: u.discountPercent != null ? String(u.discountPercent) : '',
              label: u.discountLabel ?? '',
            },
          ]),
        ),
      )
      if (!subForm.categoryId && cats[0]) {
        setSubForm((s) => ({ ...s, categoryId: cats[0].id }))
      }
      if (!form.subCategoryId && subs[0]) {
        setForm((f) => ({ ...f, subCategoryId: subs[0].id }))
      }
    } catch (err) {
      setError(t(mapError(err)))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
    )
  }, [products, search])

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) => {
      const hay = [u.firstName, u.lastName, u.phone, u.email].filter(Boolean).join(' ').toLowerCase()
      return hay.includes(q)
    })
  }, [users, userSearch])

  const flash = (text: string) => {
    setMessage(text)
    setError(null)
    window.setTimeout(() => setMessage(null), 2500)
  }

  const saveUserDiscount = async (userId: string, clear = false) => {
    const draft = discountDrafts[userId] ?? { percent: '', label: '' }
    const percent = clear ? null : draft.percent.trim() === '' ? null : Number(draft.percent)
    if (!clear && (percent == null || Number.isNaN(percent) || percent < 0 || percent > 100)) {
      setError(t('admin.errorGeneric'))
      return
    }
    setSaving(true)
    setError(null)
    try {
      const updated = await AdminApi.setUserDiscount(userId, {
        discountPercent: percent,
        discountLabel: clear ? null : draft.label.trim() || null,
      })
      setUsers((list) => list.map((u) => (u.id === userId ? updated : u)))
      setDiscountDrafts((d) => ({
        ...d,
        [userId]: {
          percent: updated.discountPercent != null ? String(updated.discountPercent) : '',
          label: updated.discountLabel ?? '',
        },
      }))
      flash(t('admin.usersSaved'))
    } catch (err) {
      setError(t(mapError(err)))
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  if (!isAdmin) {
    return (
      <div className={styles.page}>
        <div className="container">
          <p className={styles.error}>{t('admin.forbidden')}</p>
          <Button as={Link} to="/">
            {t('auth.backHome')}
          </Button>
        </div>
      </div>
    )
  }

  const startEdit = (product: Product) => {
    setEditingId(product.id)
    setTab('create')
    setForm({
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      shortDescription: product.shortDescription,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice ?? null,
      stock: product.stock,
      images: product.images,
      video: product.video ?? null,
      subCategoryId: product.subCategoryId,
      featured: product.featured,
      popular: product.popular,
      isNew: product.isNew,
      attributes: (product.attributes as Record<string, unknown>) ?? {},
    })
  }

  const resetForm = () => {
    setEditingId(null)
    setForm({
      ...emptyForm,
      subCategoryId: subcategories[0]?.id ?? '',
    })
  }

  const handleSaveProduct = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.images.length) {
      setError(t('admin.imagesRequired'))
      return
    }
    setSaving(true)
    setError(null)
    const payload: AdminProductPayload = {
      ...form,
      discountPrice: form.discountPrice || null,
      video: form.video || null,
      slug: form.slug || undefined,
    }

    try {
      if (editingId) {
        await AdminApi.updateProduct(editingId, payload)
        flash(t('admin.successSaved'))
      } else {
        await AdminApi.createProduct(payload)
        flash(t('admin.successCreated'))
      }
      resetForm()
      setTab('products')
      await load()
    } catch (err) {
      setError(t(mapError(err)))
    } finally {
      setSaving(false)
    }
  }

  const handleStockSave = async (id: string) => {
    const stock = stockDrafts[id]
    if (stock == null || stock < 0) return
    try {
      const updated = await AdminApi.updateStock(id, stock)
      setProducts((list) => list.map((p) => (p.id === id ? updated : p)))
      flash(t('admin.successSaved'))
    } catch (err) {
      setError(t(mapError(err)))
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('admin.removeConfirm'))) return
    try {
      await AdminApi.deleteProduct(id)
      flash(t('admin.successDeleted'))
      await load()
    } catch (err) {
      setError(t(mapError(err)))
    }
  }

  const handleCreateSub = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await AdminApi.createSubcategory({
        name: subForm.name,
        slug: subForm.slug || undefined,
        categoryId: subForm.categoryId,
        image: subForm.image || undefined,
      })
      flash(t('admin.successSubCreated'))
      setSubForm((s) => ({ ...s, name: '', slug: '', image: '' }))
      await load()
    } catch (err) {
      setError(t(mapError(err)))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <Breadcrumbs
          items={[
            { label: t('about.breadcrumbHome'), href: '/' },
            { label: t('profile.title'), href: '/profile' },
            { label: t('admin.title') },
          ]}
        />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className={styles.title}>{t('admin.title')}</h1>
          <p className={styles.subtitle}>{t('admin.subtitle')}</p>

          <div className={styles.tabs} role="tablist">
            {(
              [
                ['products', t('admin.tabProducts')],
                ['create', t('admin.tabAddProduct')],
                ['subcategories', t('admin.tabSubcategories')],
                ['users', t('admin.tabUsers')],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                className={[styles.tab, tab === id ? styles.tabActive : ''].filter(Boolean).join(' ')}
                onClick={() => {
                  if (id === 'create' && !editingId) resetForm()
                  setTab(id)
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {message && <p className={styles.success}>{message}</p>}
          {error && <p className={styles.error}>{error}</p>}

          {loading ? (
            <p className={styles.muted}>{t('admin.loading')}</p>
          ) : tab === 'products' ? (
            <div className={styles.panel}>
              <Input
                label={t('admin.tabProducts')}
                placeholder={t('admin.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <ul className={styles.productList}>
                {filtered.map((product) => (
                  <li key={product.id} className={styles.productCard}>
                    <div className={styles.productTop}>
                      <img src={product.images[0]} alt="" className={styles.thumb} />
                      <div className={styles.productMeta}>
                        <h3 className={styles.productName}>{product.name}</h3>
                        <p className={styles.productSku}>{product.sku}</p>
                        <p className={styles.productPrice}>
                          {product.price}
                          {product.discountPrice != null && (
                            <span className={styles.discount}> / {product.discountPrice}</span>
                          )}
                        </p>
                      </div>
                      <div className={styles.rowActions}>
                        <button
                          type="button"
                          className={styles.iconAction}
                          aria-label={t('admin.edit')}
                          onClick={() => startEdit(product)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          className={styles.iconActionDanger}
                          aria-label={t('admin.remove')}
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className={styles.stockBlock}>
                      <label className={styles.stockLabel} htmlFor={`stock-${product.id}`}>
                        {t('admin.stock')}
                      </label>
                      <div className={styles.stockRow}>
                        <input
                          id={`stock-${product.id}`}
                          type="number"
                          min={0}
                          inputMode="numeric"
                          className={styles.stockInput}
                          value={stockDrafts[product.id] ?? product.stock}
                          onChange={(e) =>
                            setStockDrafts((d) => ({
                              ...d,
                              [product.id]: Number(e.target.value),
                            }))
                          }
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          fullWidth
                          className={styles.stockSaveBtn}
                          onClick={() => handleStockSave(product.id)}
                        >
                          {t('admin.saveStock')}
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : tab === 'create' ? (
            <form className={styles.panel} onSubmit={handleSaveProduct}>
              <div className={styles.formGrid}>
                <Input
                  label={t('admin.name')}
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
                <Input
                  label={t('admin.sku')}
                  value={form.sku}
                  onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                  required
                />
                <Input
                  label={t('admin.slug')}
                  value={form.slug ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                />
                <Input
                  label={t('admin.price')}
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                  required
                />
                <Input
                  label={t('admin.discountPrice')}
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.discountPrice ?? ''}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      discountPrice: e.target.value === '' ? null : Number(e.target.value),
                    }))
                  }
                />
                <Input
                  label={t('admin.stock')}
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))}
                  required
                />
              </div>

              <label className={styles.selectLabel}>
                {t('admin.subcategory')}
                <select
                  className={styles.select}
                  value={form.subCategoryId}
                  onChange={(e) => setForm((f) => ({ ...f, subCategoryId: e.target.value }))}
                  required
                >
                  {subcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.categorySlug} / {sub.name}
                    </option>
                  ))}
                </select>
              </label>

              <Input
                label={t('admin.shortDescription')}
                value={form.shortDescription}
                onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
                required
              />
              <label className={styles.selectLabel}>
                {t('admin.description')}
                <textarea
                  className={styles.textarea}
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  required
                />
              </label>

              <div className={styles.mediaSection}>
                <span className={styles.mediaLabel}>{t('admin.media')}</span>
                <MediaUploader
                  images={form.images}
                  video={form.video}
                  onImagesChange={(images) => setForm((f) => ({ ...f, images }))}
                  onVideoChange={(video) => setForm((f) => ({ ...f, video }))}
                />
              </div>

              <div className={styles.checks}>
                <label>
                  <input
                    type="checkbox"
                    checked={Boolean(form.featured)}
                    onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                  />
                  {t('admin.featured')}
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={Boolean(form.popular)}
                    onChange={(e) => setForm((f) => ({ ...f, popular: e.target.checked }))}
                  />
                  {t('admin.popular')}
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={Boolean(form.isNew)}
                    onChange={(e) => setForm((f) => ({ ...f, isNew: e.target.checked }))}
                  />
                  {t('admin.isNew')}
                </label>
              </div>

              <div className={styles.formActions}>
                <Button type="submit" loading={saving} leftIcon={<Plus size={16} />}>
                  {editingId ? t('admin.updateProduct') : t('admin.createProduct')}
                </Button>
                {editingId && (
                  <Button type="button" variant="ghost" onClick={resetForm}>
                    {t('admin.cancelEdit')}
                  </Button>
                )}
              </div>
            </form>
          ) : tab === 'subcategories' ? (
            <form className={styles.panel} onSubmit={handleCreateSub}>
              <label className={styles.selectLabel}>
                {t('admin.category')}
                <select
                  className={styles.select}
                  value={subForm.categoryId}
                  onChange={(e) => setSubForm((s) => ({ ...s, categoryId: e.target.value }))}
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className={styles.formGrid}>
                <Input
                  label={t('admin.subName')}
                  value={subForm.name}
                  onChange={(e) => setSubForm((s) => ({ ...s, name: e.target.value }))}
                  required
                />
                <Input
                  label={t('admin.subSlug')}
                  value={subForm.slug}
                  onChange={(e) => setSubForm((s) => ({ ...s, slug: e.target.value }))}
                />
              </div>
              <Input
                label={t('admin.subImage')}
                value={subForm.image}
                onChange={(e) => setSubForm((s) => ({ ...s, image: e.target.value }))}
                placeholder="/media/Amethyst.jpg"
              />
              <Button type="submit" loading={saving} leftIcon={<Layers size={16} />}>
                {t('admin.createSubcategory')}
              </Button>
            </form>
          ) : (
            <div className={styles.panel}>
              <Input
                label={t('admin.tabUsers')}
                placeholder={t('admin.usersSearch')}
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
              {filteredUsers.length === 0 ? (
                <p className={styles.muted}>{t('admin.usersEmpty')}</p>
              ) : (
                <ul className={styles.productList}>
                  {filteredUsers.map((adminUser) => {
                    const draft = discountDrafts[adminUser.id] ?? { percent: '', label: '' }
                    return (
                      <li key={adminUser.id} className={styles.productCard}>
                        <div className={styles.productMeta}>
                          <h3 className={styles.productName}>
                            {adminUser.firstName} {adminUser.lastName}
                          </h3>
                          <p className={styles.productSku}>
                            {t('admin.usersContact')}:{' '}
                            {[adminUser.phone, adminUser.email].filter(Boolean).join(' · ') || '—'}
                          </p>
                        </div>
                        <div className={styles.formGrid}>
                          <Input
                            label={t('admin.usersDiscount')}
                            type="number"
                            min={0}
                            max={100}
                            value={draft.percent}
                            onChange={(e) =>
                              setDiscountDrafts((d) => ({
                                ...d,
                                [adminUser.id]: { ...draft, percent: e.target.value },
                              }))
                            }
                          />
                          <Input
                            label={t('admin.usersDiscountLabel')}
                            value={draft.label}
                            onChange={(e) =>
                              setDiscountDrafts((d) => ({
                                ...d,
                                [adminUser.id]: { ...draft, label: e.target.value },
                              }))
                            }
                          />
                        </div>
                        <div className={styles.formActions}>
                          <Button
                            size="sm"
                            loading={saving}
                            onClick={() => void saveUserDiscount(adminUser.id)}
                          >
                            {t('admin.usersSaveDiscount')}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => void saveUserDiscount(adminUser.id, true)}
                          >
                            {t('admin.usersClearDiscount')}
                          </Button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
