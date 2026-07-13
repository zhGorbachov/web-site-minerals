import type { Category } from '@/types'
import { mockImages } from '@/assets/mock/Images'

export const categories: Category[] = [
  {
    id: 'cat-1',
    name: 'Мінерали',
    slug: 'mineraly',
    image: mockImages.mineralsCategory,
    description: 'Натуральні мінерали та кристали для медитації, декору та створення прикрас',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-2',
    name: 'Низки',
    slug: 'nytky',
    image: mockImages.threads,
    description: 'Низки для плетіння браслетів: вощені, еластичні, бавовняні та шовкові',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-3',
    name: 'Браслети',
    slug: 'brаslety',
    image: mockImages.bracelets,
    description: 'Браслети ручної роботи з натуральних мінералів для чоловіків, жінок та дітей',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-5',
    name: 'Пахощі',
    slug: 'pahoshchi',
    image: mockImages.amethyst,
    description: 'Натуральні пахощі для медитації, релаксу та створення затишної атмосфери',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-4',
    name: 'Підвіски',
    slug: 'pidvisky',
    image: mockImages.moonstone,
    description: 'Підвіски та кулони з натуральних мінералів ручної роботи',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
]
