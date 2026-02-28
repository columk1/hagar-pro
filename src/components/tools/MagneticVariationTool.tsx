import { useMemo, useState } from 'react';

type ConversionMode = 'TRUE_TO_MAG' | 'MAG_TO_TRUE';
type VariationDirection = 'E' | 'W';

function normalizeHeading(value: number): number {
  return ((value % 360) + 360) % 360;
}

export function MagneticVariationTool() {
  const [mode, setMode] = useState<ConversionMode>('TRUE_TO_MAG');
  const [variationDirection, setVariationDirection] = useState<VariationDirection>('W');
  const [variationDegrees, setVariationDegrees] = useState<number>(14);
  const [knownHeading, setKnownHeading] = useState<number>(90);
  const [headingInput, setHeadingInput] = useState<string>('90');

  const resultHeading = useMemo(() => {
    if (mode === 'TRUE_TO_MAG') {
      return normalizeHeading(
        variationDirection === 'E'
          ? knownHeading - variationDegrees
          : knownHeading + variationDegrees
      );
    }

    return normalizeHeading(
      variationDirection === 'E'
        ? knownHeading + variationDegrees
        : knownHeading - variationDegrees
    );
  }, [mode, variationDirection, variationDegrees, knownHeading]);

  const variationLabel = `${variationDegrees}°${variationDirection}`;
  const isEast = variationDirection === 'E';
  const knownLabel = mode === 'TRUE_TO_MAG' ? 'True Heading (TH)' : 'Magnetic Heading (MH)';
  const resultLabel = mode === 'TRUE_TO_MAG' ? 'Magnetic Heading (MH)' : 'True Heading (TH)';
  const resultShortLabel = mode === 'TRUE_TO_MAG' ? 'MH' : 'TH';

  const formula =
    mode === 'TRUE_TO_MAG'
      ? isEast
        ? 'MH = TH - Variation'
        : 'MH = TH + Variation'
      : isEast
        ? 'TH = MH + Variation'
        : 'TH = MH - Variation';

  const arithmeticSign =
    mode === 'TRUE_TO_MAG'
      ? isEast
        ? '-'
        : '+'
      : isEast
        ? '+'
        : '-';

  const magneticNorthRotation = isEast ? variationDegrees : -variationDegrees;
  const trueHeadingForVisual = mode === 'TRUE_TO_MAG' ? knownHeading : resultHeading;

  return (
    <div className="magnetic-variation-tool not-content">
      <h3 className="mvt-title">Magnetic Variation Practice Tool</h3>

      <p className="mvt-intro">
        Use this to convert headings quickly. Set your local variation, choose conversion direction,
        and apply: <strong>East is Least, West is Best</strong>.
      </p>

      <div className="mvt-grid">
        <section className="mvt-panel" aria-label="Heading conversion controls">
          <div className="mvt-block">
            <p className="mvt-label">Conversion</p>
            <div className="mvt-toggle-row" role="group" aria-label="Conversion direction">
              <button
                type="button"
                className={`mvt-toggle ${mode === 'TRUE_TO_MAG' ? 'active' : ''}`}
                onClick={() => setMode('TRUE_TO_MAG')}
                aria-pressed={mode === 'TRUE_TO_MAG'}
              >
                {'True to Magnetic'}
              </button>
              <button
                type="button"
                className={`mvt-toggle ${mode === 'MAG_TO_TRUE' ? 'active' : ''}`}
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
                className={`mvt-toggle ${variationDirection === 'W' ? 'active' : ''}`}
                onClick={() => setVariationDirection('W')}
                aria-pressed={variationDirection === 'W'}
              >
                West
              </button>
              <button
                type="button"
                className={`mvt-toggle ${variationDirection === 'E' ? 'active' : ''}`}
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
                  setHeadingInput(event.target.value);
                  const parsed = parseInt(event.target.value, 10);
                  if (!Number.isNaN(parsed)) {
                    setKnownHeading(normalizeHeading(parsed));
                  }
                }}
                onBlur={(event) => {
                  const parsed = parseInt(event.target.value, 10);
                  const bounded = Number.isNaN(parsed) ? 0 : Math.min(359, Math.max(0, parsed));
                  setKnownHeading(bounded);
                  setHeadingInput(String(bounded));
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
              {resultShortLabel} = {knownHeading}° {arithmeticSign} {variationDegrees}° = {resultHeading}°
            </p>
          </div>
        </section>

        <section className="mvt-visual" aria-label="True north and magnetic north diagram">
          <div className="mvt-visual-main">
            <svg viewBox="0 0 220 220" className="mvt-compass" role="img" aria-label="Compass showing true north and magnetic north offset">
              <circle cx="110" cy="110" r="96" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.35" />

              <text x="110" y="20" textAnchor="middle" fontSize="14" fontWeight="700" className="mvt-north-label">N</text>
              <text x="202" y="114" textAnchor="middle" fontSize="12">E</text>
              <text x="110" y="210" textAnchor="middle" fontSize="12">S</text>
              <text x="18" y="114" textAnchor="middle" fontSize="12">W</text>

              <line x1="110" y1="110" x2="110" y2="34" stroke="#22c55e" strokeWidth="3" markerEnd="url(#trueArrow)" />

              <g transform={`rotate(${magneticNorthRotation}, 110, 110)`}>
                <line x1="110" y1="110" x2="110" y2="34" stroke="#ef4444" strokeWidth="3" markerEnd="url(#magArrow)" />
              </g>

              <g transform={`rotate(${trueHeadingForVisual}, 110, 110)`}>
                <line
                  x1="110"
                  y1="110"
                  x2="110"
                  y2="48"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />
                <circle cx="110" cy="44" r="4" fill="#3b82f6" />
              </g>

              <defs>
                <marker id="trueArrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L0,6 L8,3 z" fill="#22c55e" />
                </marker>
                <marker id="magArrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L0,6 L8,3 z" fill="#ef4444" />
                </marker>
              </defs>
            </svg>

            <ul className="mvt-legend">
              <li><span className="mvt-dot true" /> True North</li>
              <li><span className="mvt-dot magnetic" /> Magnetic North ({variationLabel})</li>
              <li><span className="mvt-dot heading" /> True Heading ({trueHeadingForVisual}°)</li>
            </ul>
          </div>

          <div className="mvt-note">
            <p><strong>Flight note:</strong> A compass is most reliable in steady, level flight. Turns and acceleration can cause errors.</p>
          </div>
        </section>
      </div>

      <style>{`
        .magnetic-variation-tool {
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
          border: 1px solid var(--sl-color-gray-5);
          border-radius: 0.6rem;
          padding: 0.45rem 0.6rem;
          background: color-mix(in srgb, var(--sl-color-bg) 84%, transparent);
          color: var(--sl-color-gray-2);
          font-size: 0.84rem;
          font-weight: 600;
          cursor: pointer;
        }

        .mvt-toggle.active {
          border-color: color-mix(in srgb, var(--sl-color-accent) 45%, var(--sl-color-gray-5));
          background: color-mix(in srgb, var(--sl-color-accent) 18%, var(--sl-color-bg));
          color: var(--sl-color-white);
        }

        .mvt-slider-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .mvt-slider {
          width: 100%;
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
          border: 1px solid color-mix(in srgb, var(--sl-color-accent) 34%, var(--sl-color-gray-5));
          border-radius: 0.7rem;
          background: color-mix(in srgb, var(--sl-color-accent) 14%, var(--sl-color-bg));
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
          background: #22c55e;
        }

        .mvt-dot.magnetic {
          background: #ef4444;
        }

        .mvt-dot.heading {
          background: #3b82f6;
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
  );
}

export default MagneticVariationTool;
