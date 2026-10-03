import { useEffect, useId, useRef, useState } from 'react'
import type { ColorId, Completion } from '../../domain/types.ts'
import { layoutCairn, type ViewBox } from './layout.ts'

function lerp(from: number, to: number, amount: number): number {
  return from + (to - from) * amount
}

function useAnimatedViewBox(target: ViewBox, enabled: boolean): ViewBox {
  const [current, setCurrent] = useState(target)
  const currentRef = useRef(target)
  currentRef.current = current

  useEffect(() => {
    if (!enabled) {
      currentRef.current = target
      setCurrent(target)
      return
    }

    const start = currentRef.current
    const started = performance.now()
    const duration = 520
    let frame = 0

    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / duration)
      const eased = 1 - (1 - progress) ** 3
      const next = {
        x: lerp(start.x, target.x, eased),
        y: lerp(start.y, target.y, eased),
        width: lerp(start.width, target.width, eased),
        height: lerp(start.height, target.height, eased),
      }
      currentRef.current = next
      setCurrent(next)
      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [enabled, target.height, target.width, target.x, target.y])

  return current
}

export function CairnView({
  completions,
  color,
  size = 'large',
  reducedMotion = false,
}: {
  completions: Completion[]
  color: ColorId
  size?: 'mini' | 'large'
  reducedMotion?: boolean
}) {
  const layout = layoutCairn(completions, color)
  const viewBox = useAnimatedViewBox(layout.viewBox, !reducedMotion && size === 'large')
  const newest = layout.stones.find((stone) => stone.newest)
  const skyId = useId().replace(/:/g, '')

  return (
    <figure className={`relative m-0 overflow-hidden ${size === 'large' ? 'cairn-stage' : ''}`}>
      <svg
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        role="img"
        aria-label={
          completions.length === 0
            ? 'An empty well ready for the first stone'
            : `A mountain of ${completions.length} stone${completions.length === 1 ? '' : 's'}`
        }
        className={size === 'mini' ? 'mx-auto h-40 w-full' : 'mx-auto h-80 w-full sm:h-[28rem]'}
        preserveAspectRatio="xMidYMax meet"
      >
        <defs>
          <linearGradient id={`${skyId}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.02" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.07" />
          </linearGradient>
        </defs>
        <rect
          x={viewBox.x}
          y={viewBox.y}
          width={viewBox.width}
          height={viewBox.height}
          fill={`url(#${skyId}-sky)`}
        />
        <ellipse
          cx="0"
          cy="8"
          rx={layout.ground.width / 2}
          ry={Math.max(6, layout.ground.width * 0.045)}
          fill="currentColor"
          opacity="0.1"
        />
        {layout.massPath ? (
          <path d={layout.massPath} fill={layout.massFill} opacity="0.92" />
        ) : null}
        {layout.stones.map((stone) => (
          <g key={stone.id} transform="translate(0 0)">
            {!reducedMotion && stone.newest ? (
              <animateTransform
                attributeName="transform"
                type="translate"
                from={`0 ${layout.dropFrom - stone.y}`}
                to="0 0"
                dur="0.62s"
                fill="freeze"
                calcMode="spline"
                keyTimes="0;1"
                keySplines="0.22 1 0.28 1"
              />
            ) : null}
            <ellipse
              cx={stone.x}
              cy={stone.y + 1.6}
              rx={stone.width / 2}
              ry={stone.height / 2.3}
              fill="currentColor"
              opacity="0.12"
              transform={`rotate(${stone.rotation} ${stone.x} ${stone.y})`}
            />
            <ellipse
              cx={stone.x}
              cy={stone.y}
              rx={stone.width / 2}
              ry={stone.height / 2}
              fill={stone.fill}
              transform={`rotate(${stone.rotation} ${stone.x} ${stone.y})`}
            />
            <ellipse
              cx={stone.x - stone.width * 0.16}
              cy={stone.y - stone.height * 0.2}
              rx={stone.width / 6}
              ry={stone.height / 7}
              fill="#fff8ee"
              opacity="0.3"
              transform={`rotate(${stone.rotation} ${stone.x} ${stone.y})`}
            />
          </g>
        ))}
      </svg>
      {newest && size === 'large' ? (
        <figcaption className="sr-only">The newest stone dropped onto the mountain.</figcaption>
      ) : null}
    </figure>
  )
}
