import type { Category } from '@/types'
import { mockImages } from '@/assets/mock/Images'

export const categories: Category[] = [
  {
    id: 'cat-1',
    name: 'Мінерали',
    slug: 'mineraly',
    image: mockImages.mineralsCategory,
    description: 'Натуральні мінерали та камені з різних куточків світу',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-2',
    name: 'Низки',
    slug: 'nytky',
    image: mockImages.threads,
    description: 'Намистини з натуральних каменів',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-3',
    name: 'Браслети',
    slug: 'brаslety',
    image: mockImages.bracelets,
    description: 'Браслети з натуральних каменів — особливі деталі вашого образу',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-5',
    name: 'Пахощі',
    slug: 'pahoshchi',
    image: mockImages.incense,
    description: 'Натуральні пахощі для медитації, очищення, релаксу та створення затишної атмосфери',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-4',
    name: 'Підвіски',
    slug: 'pidvisky',
    image: mockImages.pendants,
    description: 'Підвіски з натурального каменю — особлива деталь образу',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
]
