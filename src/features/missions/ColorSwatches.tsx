import { COLOR_SWATCHES } from '../../domain/colors.ts'
import type { ColorId } from '../../domain/types.ts'

export function ColorSwatches({
  value,
  onChange,
}: {
  value: ColorId
  onChange: (color: ColorId) => void
}) {
  return (
    <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Stone color">
      {COLOR_SWATCHES.map((swatch) => {
        const selected = swatch.id === value
        return (
          <button
            key={swatch.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(swatch.id)}
            className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm ${
              selected
                ? 'border-[var(--ink)] bg-[var(--surface-strong)]'
                : 'border-[var(--line)] bg-[var(--surface)]'
            }`}
          >
            <span
              aria-hidden="true"
              className="h-4 w-4 rounded-full"
              style={{ background: swatch.hex }}
            />
            {swatch.label}
          </button>
        )
      })}
    </div>
  )
}
