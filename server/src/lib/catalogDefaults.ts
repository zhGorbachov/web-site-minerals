export type StrandLengthOption = {
  label: string
  value: string
}

/** Низки — the only category sold as whole or half strands. */
export const STRANDS_CATEGORY_SLUG = 'nytky'

/** Wrist sizes offered for bracelets, 14–22 cm. */
export const DEFAULT_WRIST_SIZES = Array.from({ length: 9 }, (_, i) => `${i + 14} см`)

/** Bead diameters in mm offered for bracelets and strands. */
export const DEFAULT_BEAD_SIZES = ['2', '3', '4', '6', '8', '10', '12']

/** Whole or half strand. */
export const DEFAULT_STRAND_LENGTHS: StrandLengthOption[] = [
  { label: 'Низка 39 см', value: '39 см' },
  { label: 'Пів низки 19.5 см', value: '19.5 см' },
]

/** Incense sold by weight. */
export const DEFAULT_PACK_WEIGHTS = ['1 кг', '100 г', '50 г']

/** Incense sold as separate pieces (palo santo sticks). */
export const DEFAULT_PIECE_WEIGHTS = ['5-6 г', '7-8 г', '9-10 г', '11-12 г', '13-14 г']
