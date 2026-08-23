import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Layers } from 'lucide-react'
import { AdminApi, CatalogApi } from '@/api'
import { useAuthStore } from '@/store'
import { useTranslation } from '@/i18n/useTranslation'
import { Button, Input } from '@/components/ui'
import { MediaUploader } from '@/components/MediaUploader'
import type { Category } from '@/types'
import { AdminShell } from './AdminShell'
import { adminTabPath, mapAdminError } from './adminShared'
import styles from './AdminPage.module.scss'

const emptySubForm = {
  name: '',
  slug: '',
  categoryId: '',
  image: '',
}

export function AdminSubcategoryFormPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const preselectedCategoryId = searchParams.get('categoryId') ?? ''
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'admin' || user?.role === 'manager'
  const isEdit = Boolean(id)

  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState(emptySubForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  const goToList = (flash?: string) => {
    navigate(adminTabPath('subcategories'), { state: flash ? { flash } : undefined })
  }

  useEffect(() => {
    if (!isAdmin) return

    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)
      setNotFound(false)
      try {
        const cats = await CatalogApi.getCategories()
        if (cancelled) return
        setCategories(cats)

        if (!id) {
          const fromQuery =
            preselectedCategoryId && cats.some((cat) => cat.id === preselectedCategoryId)
              ? preselectedCategoryId
              : ''
          setForm({
            ...emptySubForm,
            categoryId: fromQuery || cats[0]?.id || '',
          })
          return
        }

        const subs = await CatalogApi.getSubcategories()
        if (cancelled) return
        const sub = subs.find((item) => item.id === id)
        if (!sub) {
          setNotFound(true)
          return
        }

        setForm({
          name: sub.name,
          slug: sub.slug,
          categoryId: sub.categoryId,
          image: sub.image,
        })
      } catch (err) {
        if (!cancelled) setError(t(mapAdminError(err)))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
    // t is recreated every render — do not put it in deps or the page will flicker.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isAdmin, preselectedCategoryId])

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      if (isEdit && id) {
        await AdminApi.updateSubcategory(id, {
          name: form.name,
          slug: form.slug || undefined,
          categoryId: form.categoryId,
          image: form.image,
        })
        goToList(t('admin.successSubSaved'))
      } else {
        await AdminApi.createSubcategory({
          name: form.name,
          slug: form.slug || undefined,
          categoryId: form.categoryId,
          image: form.image || undefined,
        })
        goToList(t('admin.successSubCreated'))
      }
    } catch (err) {
      setError(t(mapAdminError(err)))
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminShell
      activeTab="subcategories"
      onTabChange={(tab) => navigate(adminTabPath(tab))}
      extraCrumbs={[
        { label: t('admin.tabSubcategories'), href: adminTabPath('subcategories') },
        { label: isEdit ? t('admin.tabEditSubcategory') : t('admin.tabAddSubcategory') },
      ]}
      title={isEdit ? t('admin.tabEditSubcategory') : t('admin.tabAddSubcategory')}
      subtitle={isEdit ? form.name || null : null}
      error={error}
    >
      {loading ? (
        <p className={styles.muted}>{t('admin.loading')}</p>
      ) : notFound ? (
        <div className={styles.panel}>
          <p className={styles.muted}>{t('admin.subNotFound')}</p>
          <Button type="button" variant="ghost" onClick={() => goToList()}>
            {t('admin.cancelEdit')}
          </Button>
        </div>
      ) : (
        <form className={styles.panel} onSubmit={handleSave}>
          <label className={styles.selectLabel}>
            {t('admin.category')}
            <select
              className={styles.select}
              value={form.categoryId}
              onChange={(e) => setForm((s) => ({ ...s, categoryId: e.target.value }))}
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
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              required
            />
            <Input
              label={t('admin.subSlug')}
              value={form.slug}
              onChange={(e) => setForm((s) => ({ ...s, slug: e.target.value }))}
            />
          </div>
          <div className={styles.mediaSection}>
            <span className={styles.mediaLabel}>{t('admin.subImage')}</span>
            <MediaUploader
              images={form.image ? [form.image] : []}
              onImagesChange={(next) => setForm((s) => ({ ...s, image: next[0] ?? '' }))}
              maxImages={1}
              allowVideo={false}
            />
          </div>
          <div className={styles.formActions}>
            <Button type="submit" loading={saving} leftIcon={<Layers size={16} />}>
              {isEdit ? t('admin.updateSubcategory') : t('admin.createSubcategory')}
            </Button>
            <Button type="button" variant="ghost" onClick={() => goToList()}>
              {t('admin.cancelEdit')}
            </Button>
          </div>
        </form>
      )}
    </AdminShell>
  )
}
