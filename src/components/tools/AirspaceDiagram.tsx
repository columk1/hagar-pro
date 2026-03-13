import { useState } from 'react'

type AirspaceClass = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'

type AirspaceInfo = {
  title: string
  color: string
  vfr: string[]
  hgpg: string[]
}

const AIRSPACE_INFO: Record<AirspaceClass, AirspaceInfo> = {
  A: {
    title: 'Class A',
    color: '#e8c0ad',
    vfr: ['VFR flight is not permitted.', 'IFR only.'],
    hgpg: ['HG/PG operations are not permitted in Class A.'],
  },
  B: {
    title: 'Class B',
    color: '#efe51b',
    vfr: ['VFR entry requires ATC clearance.'],
    hgpg: ['ATC clearance and required equipment are mandatory before any authorized entry.'],
  },
  C: {
    title: 'Class C',
    color: '#ddd8b7',
    vfr: ['Flight visibility: 3 SM.', 'Cloud clearance: 500 ft vertical and 1 SM horizontal.'],
    hgpg: [
      'Two-way radio and ATC clearance required before entry.',
      'Maintain visual reference to ground/water.',
      'Can be denied entry.',
    ],
  },
  D: {
    title: 'Class D',
    color: '#d5d4ba',
    vfr: ['Flight visibility: 3 SM.', 'Cloud clearance: 500 ft vertical and 1 SM horizontal.'],
    hgpg: [
      'Establish two-way communications before entry.',
      'Comply with tower instructions.',
      "Can't be denied entry if requirements are met.",
    ],
  },
  E: {
    title: 'Class E',
    color: '#89a6cb',
    vfr: ['Flight visibility: 3 SM.', 'Cloud clearance: 500 ft vertical and 1 SM horizontal.'],
    hgpg: [
      'No ATC clearance required for VFR transit.',
      'Remain outside controlled areas unless entry requirements are met.',
    ],
  },
  F: {
    title: 'Class F (CYR / Special-use)',
    color: '#d2d2d2',
    vfr: [
      'Requirements depend on the CYR type and published restrictions.',
      'Entry may be prohibited or require prior authorization.',
    ],
    hgpg: [
      'Check NOTAMs/CFS and chart notes before flight.',
      "Can't enter an active CYR without authorization",
      'Can enter an active CYA with caution.',
    ],
  },
  G: {
    title: 'Class G',
    color: '#5ec0ad',
    vfr: [
      'Above 1,000 ft AGL: 1 SM visibility, 500 ft vertical and 2,000 ft horizontal from cloud.',
      'At or below 1,000 ft AGL (day): 2 SM visibility, clear of cloud.',
    ],
    hgpg: [
      'Uncontrolled airspace: no ATC clearance required.',
      'Maintain visual reference to ground/water and avoid restricted/prohibited areas.',
    ],
  },
}

const CLASS_ORDER: AirspaceClass[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

export function AirspaceDiagram() {
  const [activeClass, setActiveClass] = useState<AirspaceClass>('A')

  const activeData = AIRSPACE_INFO[activeClass]

  const activate = (classKey: AirspaceClass) => {
    setActiveClass(classKey)
  }

  return (
    <section className="airspace-diagram not-content" aria-label="Canadian domestic airspace model">
      <header className="airspace-header">
        <h3>Aerodromes and Air Navigation (AARN) Airspace Model</h3>
        <p>
          Use the class buttons below to view VFR minima and HG/PG-focused operating requirements.
        </p>
      </header>

      <div className="airspace-canvas">
        <div className="airspace-image-shell" aria-label="Static airspace chart image">
          <img
            src="/images/tc-aarn.png"
            alt="Layered Class A B C D E F and G domestic airspace diagram"
            width={1024}
            height={353}
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>

      <div
        className="airspace-class-buttons"
        role="group"
        aria-label="Select airspace class details"
      >
        {CLASS_ORDER.map((classKey) => (
          <button
            key={classKey}
            type="button"
            className={activeClass === classKey ? 'active' : ''}
            onClick={() => activate(classKey)}
          >
            Class {classKey}
          </button>
        ))}
      </div>

      <section
        className="airspace-output"
        aria-live="polite"
        aria-label="Selected airspace requirements"
      >
        <p className="tip-title">{activeData.title}</p>

        <p className="tip-label">VFR minima</p>
        <ul>
          {activeData.vfr.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>

        <p className="tip-label">HG / PG pilot requirements</p>
        <ul>
          {activeData.hgpg.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <style>{`
        .airspace-diagram {
          display: grid;
          gap: 0.8rem;
          margin: 1rem 0;
          border: 1px solid var(--sl-color-gray-5);
          border-radius: 0.95rem;
          padding: 1rem;
          background: color-mix(in srgb, var(--sl-color-bg) 94%, var(--sl-color-gray-6));
        }

        .airspace-header h3 {
          margin: 0;
          font-size: 1.05rem;
        }

        .airspace-header p {
          margin: 0.35rem 0 0;
          color: var(--sl-color-gray-2);
          font-size: 0.9rem;
        }

        .airspace-canvas {
          position: relative;
        }

        .airspace-image-shell {
          border: 1px solid var(--sl-color-gray-5);
          border-radius: 0.75rem;
          overflow: hidden;
          background: #b8d7e7;
        }

        .airspace-canvas img {
          display: block;
          width: 100%;
          height: auto;
        }

        .airspace-output {
          width: 100%;
          min-height: 200px;
          border: 1px solid #2b5fb9;
          background: color-mix(in srgb, #0d2039 78%, var(--sl-color-bg));
          box-shadow: 0 14px 30px rgba(5, 12, 30, 0.36);
          border-radius: 0.78rem;
          padding: 0.7rem 0.78rem;
        }

        .tip-title {
          margin: 0;
          color: #f5f8ff;
          font-size: 0.96rem;
          font-weight: 800;
        }

        .tip-label {
          margin: 0.45rem 0 0.2rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #9db8ea;
          font-size: var(--sl-text-xs);
          font-weight: 700;
        }

        .airspace-output ul {
          margin: 0;
          padding-left: 1rem;
          display: grid;
          gap: 0.2rem;
          color: #e9efff;
          font-size: 0.82rem;
          line-height: 1.35;
        }

        .airspace-class-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
        }

        .airspace-class-buttons button {
          border-radius: 999px;
          border: 1px solid var(--sl-color-gray-5);
          background: color-mix(in srgb, var(--sl-color-bg) 86%, transparent);
          color: var(--sl-color-gray-2);
          padding: 0.34rem 0.6rem;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
        }

        .airspace-class-buttons button.active {
          border-color: color-mix(in srgb, var(--sl-color-accent) 48%, var(--sl-color-gray-5));
          background: color-mix(in srgb, var(--sl-color-accent) 19%, var(--sl-color-bg));
          color: var(--sl-color-white);
        }

        @media (max-width: 900px) {
          .airspace-output {
            box-shadow: 0 10px 22px rgba(5, 12, 30, 0.3);
          }
        }
      `}</style>
    </section>
  )
}

export default AirspaceDiagram
