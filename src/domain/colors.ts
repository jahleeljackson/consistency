import type { ColorId } from './types.ts'

export interface ColorSwatch {
  id: ColorId
  label: string
  hex: string
  deep: string
}

export const COLOR_SWATCHES: ColorSwatch[] = [
  { id: 'clay', label: 'Clay', hex: '#b56b43', deep: '#8c4d2d' },
  { id: 'sand', label: 'Sand', hex: '#c4a574', deep: '#8f7548' },
  { id: 'moss', label: 'Moss', hex: '#6b7d55', deep: '#4d5c3c' },
  { id: 'slate', label: 'Slate', hex: '#7d746c', deep: '#534c47' },
  { id: 'terracotta', label: 'Terracotta', hex: '#c4785a', deep: '#8f4d35' },
]

export function getSwatch(color: ColorId): ColorSwatch {
  return COLOR_SWATCHES.find((swatch) => swatch.id === color) ?? COLOR_SWATCHES[0]
}
