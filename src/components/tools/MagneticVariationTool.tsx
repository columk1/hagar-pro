import { useMemo, useState } from 'react'

type ConversionMode = 'TRUE_TO_MAG' | 'MAG_TO_TRUE'
type VariationDirection = 'E' | 'W'

function normalizeHeading(value: number): number {
  return ((value % 360) + 360) % 360
}

export function MagneticVariationTool() {
  const [mode, setMode] = useState<ConversionMode>('TRUE_TO_MAG')
  const [variationDirection, setVariationDirection] = useState<VariationDirection>('W')
  const [variationDegrees, setVariationDegrees] = useState<number>(14)
  const [knownHeading, setKnownHeading] = useState<number>(90)
  const [headingInput, setHeadingInput] = useState<string>('90')

  const resultHeading = useMemo(() => {
    if (mode === 'TRUE_TO_MAG') {
      return normalizeHeading(
        variationDirection === 'E'
          ? knownHeading - variationDegrees
          : knownHeading + variationDegrees,
      )
    }

    return normalizeHeading(
      variationDirection === 'E'
        ? knownHeading + variationDegrees
        : knownHeading - variationDegrees,
    )
  }, [mode, variationDirection, variationDegrees, knownHeading])

  const variationLabel = `${variationDegrees}°${variationDirection}`
  const isEast = variationDirection === 'E'
  const knownLabel = mode === 'TRUE_TO_MAG' ? 'True Heading (TH)' : 'Magnetic Heading (MH)'
  const resultLabel = mode === 'TRUE_TO_MAG' ? 'Magnetic Heading (MH)' : 'True Heading (TH)'
  const resultShortLabel = mode === 'TRUE_TO_MAG' ? 'MH' : 'TH'

  const formula =
    mode === 'TRUE_TO_MAG'
      ? isEast
        ? 'MH = TH - Variation'
        : 'MH = TH + Variation'
      : isEast
        ? 'TH = MH + Variation'
        : 'TH = MH - Variation'

  const arithmeticSign = mode === 'TRUE_TO_MAG' ? (isEast ? '-' : '+') : isEast ? '+' : '-'

  const magneticNorthRotation = isEast ? variationDegrees : -variationDegrees
  const trueHeadingForVisual = mode === 'TRUE_TO_MAG' ? knownHeading : resultHeading
  const magneticHeadingForVisual = mode === 'TRUE_TO_MAG' ? resultHeading : knownHeading
  const modeTrueToMagClass = mode === 'TRUE_TO_MAG' ? 'btn-primary' : 'btn-secondary'
  const modeMagToTrueClass = mode === 'MAG_TO_TRUE' ? 'btn-primary' : 'btn-secondary'
  const variationWestClass = variationDirection === 'W' ? 'btn-primary' : 'btn-secondary'
  const variationEastClass = variationDirection === 'E' ? 'btn-primary' : 'btn-secondary'

  return (
    <div className="magnetic-variation-tool not-content">
      <h3 className="mvt-title">Magnetic Variation Tool</h3>

      {/* <p className="mvt-intro">
        Use this to interactive tool to practice converting between true headings and magnetic headings.
      </p> */}

      <div className="mvt-grid">
        <section className="mvt-panel" aria-label="Heading conversion controls">
          <div className="mvt-block">
            <p className="mvt-label">Conversion</p>
            <div className="mvt-toggle-row" role="group" aria-label="Conversion direction">
              <button
                type="button"
                className={`mvt-toggle ${modeTrueToMagClass}`}
                onClick={() => setMode('TRUE_TO_MAG')}
                aria-pressed={mode === 'TRUE_TO_MAG'}
              >
                {'True to Magnetic'}
              </button>
              <button
                type="button"
                className={`mvt-toggle ${modeMagToTrueClass}`}
                onClick={() => setMode('MAG_TO_TRUE')}
                aria-pressed={mode === 'MAG_TO_TRUE'}
              >
                {'Magnetic to True'}
              </button>
            </div>
          </div>

          <div className="mvt-block">
            <p className="mvt-label">Magnetic variation</p>
            <div className="mvt-toggle-row" role="group" aria-label="Variation direction">
              <button
                type="button"
                className={`mvt-toggle ${variationWestClass}`}
                onClick={() => setVariationDirection('W')}
                aria-pressed={variationDirection === 'W'}
              >
                West
              </button>
              <button
                type="button"
                className={`mvt-toggle ${variationEastClass}`}
                onClick={() => setVariationDirection('E')}
                aria-pressed={variationDirection === 'E'}
              >
                East
              </button>
            </div>

            <div className="mvt-slider-row">
              <input
                className="mvt-slider"
                type="range"
                min="0"
                max="30"
                step="1"
                value={variationDegrees}
                onChange={(event) => setVariationDegrees(Number(event.target.value))}
                aria-label="Variation in degrees"
              />
              <span className="mvt-value-pill">{variationLabel}</span>
            </div>
          </div>

          <div className="mvt-block">
            <label className="mvt-label" htmlFor="mvt-heading-input">
              {knownLabel}
            </label>
            <div className="mvt-input-row">
              <input
                id="mvt-heading-input"
                className="mvt-input"
                type="number"
                value={headingInput}
                onChange={(event) => {
                  setHeadingInput(event.target.value)
                  const parsed = parseInt(event.target.value, 10)
                  if (!Number.isNaN(parsed)) {
                    setKnownHeading(normalizeHeading(parsed))
                  }
                }}
                onBlur={(event) => {
                  const parsed = parseInt(event.target.value, 10)
                  const bounded = Number.isNaN(parsed) ? 0 : Math.min(359, Math.max(0, parsed))
                  setKnownHeading(bounded)
                  setHeadingInput(String(bounded))
                }}
                aria-describedby="mvt-heading-hint"
              />
              <span className="mvt-input-suffix">°</span>
            </div>
            <p id="mvt-heading-hint" className="mvt-help">
              Enter 0 to 359 degrees.
            </p>
          </div>

          <div className="mvt-result" aria-live="polite">
            <p className="mvt-label">Result</p>
            <p className="mvt-result-heading">
              {resultLabel}: <strong>{resultHeading}°</strong>
            </p>
            <p className="mvt-formula">{formula}</p>
            <p className="mvt-math">
              {resultShortLabel} = {knownHeading}° {arithmeticSign} {variationDegrees}° ={' '}
              {resultHeading}°
            </p>
          </div>
        </section>

        <section className="mvt-visual" aria-label="True north and magnetic north diagram">
          <div className="mvt-visual-main">
            <svg
              viewBox="0 0 220 220"
              className="mvt-compass"
              role="img"
              aria-label="Compass showing true north and magnetic north offset"
            >
              <circle
                cx="110"
                cy="110"
                r="96"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                opacity="0.35"
              />

              <text
                x="110"
                y="20"
                textAnchor="middle"
                fontSize="14"
                fontWeight="700"
                className="mvt-north-label"
              >
                N
              </text>

              <g transform={`rotate(${magneticNorthRotation}, 110, 110)`}>
                <line
                  x1="110"
                  y1="110"
                  x2="110"
                  y2="50"
                  stroke="var(--hp-tool-negative)"
                  strokeWidth="3"
                  markerEnd="url(#magArrow)"
                />
              </g>

              <g transform={`rotate(${trueHeadingForVisual}, 110, 110)`}>
                <line
                  x1="110"
                  y1="110"
                  x2="110"
                  y2="14"
                  stroke="var(--hp-tool-positive)"
                  strokeWidth="2"
                />
                <circle cx="110" cy="14" r="2.5" fill="var(--hp-tool-positive)" />
              </g>

              <g transform={`rotate(${magneticHeadingForVisual}, 110, 110)`}>
                <line
                  x1="110"
                  y1="110"
                  x2="110"
                  y2="14"
                  stroke="var(--hp-tool-heading)"
                  strokeWidth="2"
                  opacity="0.7"
                />
                <circle cx="110" cy="14" r="2.5" fill="var(--hp-tool-heading)" opacity="0.7" />
              </g>

              <defs>
                <marker
                  id="magArrow"
                  markerWidth="10"
                  markerHeight="10"
                  refX="0"
                  refY="3"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M0,0 L8,3 L0,6 z" fill="var(--hp-tool-negative)" />
                </marker>
              </defs>

              <circle
                cx="110"
                cy="110"
                r="6"
                fill="black"
                stroke="var(--sl-color-gray-4)"
                strokeWidth="1"
              />
            </svg>

            <ul className="mvt-legend">
              <li>
                <span className="mvt-dot magnetic" /> Magnetic North ({variationLabel})
              </li>
              <li>
                <span className="mvt-dot heading-solid" /> True Heading ({trueHeadingForVisual}°)
              </li>
              <li>
                <span className="mvt-dot heading" /> Magnetic Heading ({magneticHeadingForVisual}°)
              </li>
            </ul>
          </div>

          <div className="mvt-note">
            <p>
              <strong>Flight note:</strong> A compass is most reliable in steady, level flight.
              Turns and acceleration can cause errors.
            </p>
          </div>
        </section>
      </div>

      <style>{`
        .magnetic-variation-tool {
          --mvt-accent-border: color-mix(in srgb, var(--sl-color-accent) 45%, var(--sl-color-gray-5));
          --mvt-accent-surface: color-mix(in srgb, var(--sl-color-accent) 18%, var(--sl-color-bg));
          margin: 1rem 0;
          padding: 1.25rem;
          border-radius: 1rem;
          border: 1px solid var(--sl-color-gray-5);
          background: color-mix(in srgb, var(--sl-color-bg) 92%, var(--sl-color-gray-6));
          display: grid;
          gap: 0.8rem;
        }

        .mvt-title {
          margin: 0;
          font-size: 1.1rem;
          line-height: 1.2;
        }

        .mvt-intro {
          margin: 0;
          font-size: 0.92rem;
          color: var(--sl-color-gray-2);
        }

        .mvt-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
          gap: 1rem;
        }

        .mvt-panel,
        .mvt-visual {
          border: 1px solid var(--sl-color-gray-5);
          border-radius: 0.8rem;
          padding: 0.85rem;
          background: color-mix(in srgb, var(--sl-color-bg) 94%, transparent);
          display: grid;
          gap: 0.75rem;
        }

        .mvt-block {
          display: grid;
          gap: 0.4rem;
        }

        .mvt-label {
          margin: 0;
          font-size: var(--sl-text-xs);
          letter-spacing: 0.04em;
          text-transform: uppercase;
          font-weight: 700;
          color: var(--sl-color-gray-3);
        }

        .mvt-toggle-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.5rem;
        }

        .mvt-toggle {
          border-radius: 0.6rem;
          padding: 0.45rem 0.6rem;
          font-size: 0.84rem;
          font-weight: 600;
        }

        .mvt-slider-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .mvt-slider {
          width: 100%;
          accent-color: var(--sl-color-accent);
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          height: 1.15rem;
          background: transparent;
          cursor: pointer;
        }

        .mvt-slider::-webkit-slider-runnable-track {
          -webkit-appearance: none;
          height: 0.4rem;
          border-radius: 999px;
          background: var(--mvt-accent-surface);
        }

        .mvt-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 1rem;
          height: 1rem;
          margin-top: -0.3rem;
          border-radius: 999px;
          border: 1px solid var(--mvt-accent-border);
          background: var(--mvt-accent-surface) !important;
          background-color: var(--mvt-accent-surface) !important;
          box-shadow: 0 0 0 2px color-mix(in srgb, var(--sl-color-bg) 90%, transparent);
        }

        .mvt-slider::-moz-range-track {
          height: 0.4rem;
          border-radius: 999px;
          background: var(--mvt-accent-surface);
        }

        .mvt-slider::-moz-range-thumb {
          -moz-appearance: none;
          width: 1rem;
          height: 1rem;
          border-radius: 999px;
          border: 1px solid var(--mvt-accent-border);
          background: var(--mvt-accent-surface) !important;
          background-color: var(--mvt-accent-surface) !important;
        }

        .mvt-value-pill {
          min-width: 3.8rem;
          text-align: center;
          font-weight: 700;
          font-size: 0.9rem;
          border-radius: 999px;
          padding: 0.15rem 0.5rem;
          border: 1px solid var(--sl-color-gray-5);
          background: color-mix(in srgb, var(--sl-color-bg) 88%, transparent);
        }

        .mvt-input-row {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }

        .mvt-input {
          width: 100%;
          padding: 0.45rem 0.55rem;
          border-radius: 0.55rem;
          border: 1px solid var(--sl-color-gray-5);
          background: color-mix(in srgb, var(--sl-color-bg) 84%, transparent);
          color: var(--sl-color-white);
          font: inherit;
        }

        .mvt-input:focus {
          outline: none;
          border-color: var(--sl-color-accent);
        }

        .mvt-input-suffix {
          color: var(--sl-color-gray-3);
          font-size: 0.95rem;
        }

        .mvt-help {
          margin: 0;
          font-size: 0.78rem;
          color: var(--sl-color-gray-3);
        }

        .mvt-result {
          border: 1px solid var(--sl-color-gray-5);
          border-radius: 0.7rem;
          background: color-mix(in srgb, var(--sl-color-bg) 92%, transparent);
          padding: 0.65rem;
          display: grid;
          gap: 0.3rem;
        }

        .mvt-result-heading,
        .mvt-formula,
        .mvt-math {
          margin: 0;
        }

        .mvt-result-heading {
          font-size: 1rem;
        }

        .mvt-formula {
          font-size: 0.82rem;
          color: var(--sl-color-gray-2);
        }

        .mvt-math {
          font-size: 0.82rem;
          color: var(--sl-color-gray-3);
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        }

        .mvt-visual {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          height: 100%;
        }

        .mvt-visual-main {
          width: 100%;
          display: grid;
          justify-items: center;
          gap: 0.75rem;
        }

        .mvt-compass {
          width: 100%;
          max-width: 220px;
          color: var(--sl-color-gray-4);
        }

        .mvt-north-label {
          fill: var(--sl-color-white, #fff);
        }

        .mvt-legend {
          width: 100%;
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 0.35rem;
          font-size: 0.84rem;
          color: var(--sl-color-gray-2);
        }

        .mvt-legend li {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .mvt-dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          flex-shrink: 0;
        }

        .mvt-dot.true {
          background: var(--hp-tool-positive);
        }

        .mvt-dot.magnetic {
          background: var(--hp-tool-negative);
        }

        .mvt-dot.heading {
          background: var(--hp-tool-heading);
        }

        .mvt-dot.heading-solid {
          background: var(--hp-tool-positive);
        }

        .mvt-dot.heading-dotted {
          background: var(--hp-tool-heading);
          opacity: 0.7;
        }

        .mvt-note {
          width: 100%;
          border: 1px solid var(--sl-color-gray-5);
          border-radius: 0.65rem;
          padding: 0.55rem;
          display: grid;
          gap: 0.45rem;
          font-size: 0.78rem;
          color: var(--sl-color-gray-3);
        }

        .mvt-note p {
          margin: 0;
        }

        @media (max-width: 760px) {
          .mvt-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

export default MagneticVariationTool
