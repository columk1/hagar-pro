import { useEffect, useMemo, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import type {
  LatLngTuple,
  Layer,
  LeafletMouseEvent,
  Map,
  Polyline,
  Tooltip,
} from 'leaflet';

type VariationDirection = 'E' | 'W';

type VNCViewerProps = {
  chartImageUrl?: string;
  chartBounds?: [LatLngTuple, LatLngTuple];
  initialCenter?: LatLngTuple;
  initialZoom?: number;
  tileUrlTemplate?: string;
  chartAttribution?: string;
  baseMapUrlTemplate?: string;
  baseMapAttribution?: string;
  minZoom?: number;
  maxZoom?: number;
  magneticVariationDirection?: VariationDirection;
  magneticVariationDegrees?: number;
};

type LeafletModule = typeof import('leaflet');

const EARTH_RADIUS_METERS = 6_371_000;
const METERS_PER_NAUTICAL_MILE = 1_852;

const DEFAULT_BOUNDS: [LatLngTuple, LatLngTuple] = [
  [48.5, -124.0],
  [49.5, -122.25],
];

const DEFAULT_INITIAL_CENTER: LatLngTuple = [49.1, -123.4];

function degreesToRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function radiansToDegrees(value: number): number {
  return (value * 180) / Math.PI;
}

function normalizeBearing(value: number): number {
  return ((value % 360) + 360) % 360;
}

function calculateDistanceNm(pointA: LatLngTuple, pointB: LatLngTuple): number {
  const [lat1, lon1] = pointA;
  const [lat2, lon2] = pointB;

  const phi1 = degreesToRadians(lat1);
  const phi2 = degreesToRadians(lat2);
  const deltaPhi = degreesToRadians(lat2 - lat1);
  const deltaLambda = degreesToRadians(lon2 - lon1);

  const haversine =
    Math.sin(deltaPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;

  const centralAngle = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
  const meters = EARTH_RADIUS_METERS * centralAngle;
  return meters / METERS_PER_NAUTICAL_MILE;
}

function calculateTrueTrack(pointA: LatLngTuple, pointB: LatLngTuple): number {
  const [lat1, lon1] = pointA;
  const [lat2, lon2] = pointB;

  const phi1 = degreesToRadians(lat1);
  const phi2 = degreesToRadians(lat2);
  const deltaLambda = degreesToRadians(lon2 - lon1);

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  return normalizeBearing(radiansToDegrees(Math.atan2(y, x)));
}

function formatDms(value: number, axis: 'lat' | 'lon'): string {
  const isPositive = value >= 0;
  const absolute = Math.abs(value);
  const degrees = Math.floor(absolute);
  const minutes = (absolute - degrees) * 60;

  const hemisphere = axis === 'lat'
    ? isPositive
      ? 'N'
      : 'S'
    : isPositive
      ? 'E'
      : 'W';

  const degreeLabel = axis === 'lat'
    ? String(degrees).padStart(2, '0')
    : String(degrees).padStart(3, '0');

  return `${degreeLabel}deg ${minutes.toFixed(2).padStart(5, '0')}' ${hemisphere}`;
}

export function VNCViewer({
  chartImageUrl = '/maps/vancouver-vnc.png',
  chartBounds = DEFAULT_BOUNDS,
  initialCenter = DEFAULT_INITIAL_CENTER,
  initialZoom = 9,
  tileUrlTemplate,
  chartAttribution = '',
  baseMapUrlTemplate = 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
  baseMapAttribution = '&copy; OpenStreetMap contributors &copy; CARTO',
  minZoom = 8,
  maxZoom = 12,
  magneticVariationDirection = 'E',
  magneticVariationDegrees = 16,
}: VNCViewerProps) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);

  const pointAMarkerRef = useRef<Layer | null>(null);
  const pointBMarkerRef = useRef<Layer | null>(null);
  const routeLineRef = useRef<Polyline | null>(null);
  const routeTooltipRef = useRef<Tooltip | null>(null);

  const pointARef = useRef<LatLngTuple | null>(null);
  const pointBRef = useRef<LatLngTuple | null>(null);

  const [pointA, setPointA] = useState<LatLngTuple | null>(null);
  const [pointB, setPointB] = useState<LatLngTuple | null>(null);
  const [cursorCoordinate, setCursorCoordinate] = useState<LatLngTuple | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    pointARef.current = pointA;
  }, [pointA]);

  useEffect(() => {
    pointBRef.current = pointB;
  }, [pointB]);

  const routeMetrics = useMemo(() => {
    if (!pointA || !pointB) {
      return null;
    }

    const trueTrack = calculateTrueTrack(pointA, pointB);
    const variationSign = magneticVariationDirection === 'E' ? -1 : 1;
    const magneticTrack = normalizeBearing(trueTrack + variationSign * magneticVariationDegrees);

    return {
      distanceNm: calculateDistanceNm(pointA, pointB),
      trueTrack,
      magneticTrack,
    };
  }, [pointA, pointB, magneticVariationDirection, magneticVariationDegrees]);

  useEffect(() => {
    const mapElement = mapElementRef.current;
    if (!mapElement || mapRef.current) {
      return;
    }

    let didCancel = false;

    const initializeMap = async () => {
      try {
        const L = await import('leaflet');
        if (didCancel || !mapElementRef.current) {
          return;
        }

        leafletRef.current = L;

        const map = L.map(mapElementRef.current, {
          zoomControl: true,
          attributionControl: true,
          minZoom,
          maxZoom,
          maxBounds: chartBounds,
          maxBoundsViscosity: 1.0,
        });

        if (baseMapUrlTemplate) {
          L.tileLayer(baseMapUrlTemplate, {
            attribution: baseMapAttribution,
            minZoom,
            maxZoom,
            bounds: chartBounds,
            opacity: 0.45,
          }).addTo(map);
        }

        if (tileUrlTemplate) {
          L.tileLayer(tileUrlTemplate, {
            attribution: chartAttribution,
            minZoom,
            maxZoom,
            bounds: chartBounds,
          }).addTo(map);
        } else {
          L.imageOverlay(chartImageUrl, chartBounds, {
            attribution: chartAttribution,
            interactive: false,
            opacity: 1,
          }).addTo(map);
        }

        map.setView(initialCenter, initialZoom);
        map.setMaxBounds(chartBounds);

        map.on('mousemove', (event: LeafletMouseEvent) => {
          setCursorCoordinate([event.latlng.lat, event.latlng.lng]);
        });

        map.on('mouseout', () => {
          setCursorCoordinate(null);
        });

        map.on('click', (event: LeafletMouseEvent) => {
          const clickedPoint: LatLngTuple = [event.latlng.lat, event.latlng.lng];

          if (!pointARef.current) {
            setPointA(clickedPoint);
            setPointB(null);
            return;
          }

          if (!pointBRef.current) {
            setPointB(clickedPoint);
            return;
          }

          setPointA(clickedPoint);
          setPointB(null);
        });

        mapRef.current = map;
      } catch {
        setLoadError('Leaflet failed to load. Ensure the package is installed and reload.');
      }
    };

    initializeMap();

    return () => {
      didCancel = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [
    baseMapAttribution,
    baseMapUrlTemplate,
    chartAttribution,
    chartBounds,
    chartImageUrl,
    initialCenter,
    initialZoom,
    maxZoom,
    minZoom,
    tileUrlTemplate,
  ]);

  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;

    if (!map || !L) {
      return;
    }

    for (const existingLayerRef of [pointAMarkerRef, pointBMarkerRef, routeLineRef]) {
      if (existingLayerRef.current) {
        existingLayerRef.current.remove();
        existingLayerRef.current = null;
      }
    }

    if (routeTooltipRef.current) {
      routeTooltipRef.current.remove();
      routeTooltipRef.current = null;
    }

    if (pointA) {
      pointAMarkerRef.current = L.circleMarker(pointA, {
        radius: 7,
        color: 'var(--hp-tool-heading)',
        weight: 2,
        fillColor: 'var(--hp-tool-heading)',
        fillOpacity: 0.95,
      })
        .bindTooltip('Point A', { direction: 'top', permanent: true, offset: [0, -10] })
        .addTo(map);
    }

    if (pointB) {
      pointBMarkerRef.current = L.circleMarker(pointB, {
        radius: 7,
        color: 'var(--hp-tool-negative)',
        weight: 2,
        fillColor: 'var(--hp-tool-negative)',
        fillOpacity: 0.95,
      })
        .bindTooltip('Point B', { direction: 'top', permanent: true, offset: [0, -10] })
        .addTo(map);
    }

    if (pointA && pointB && routeMetrics) {
      routeLineRef.current = L.polyline([pointA, pointB], {
        color: 'var(--hp-tool-positive)',
        weight: 4,
        opacity: 0.92,
      }).addTo(map);

      const midpoint: LatLngTuple = [
        (pointA[0] + pointB[0]) / 2,
        (pointA[1] + pointB[1]) / 2,
      ];

      routeTooltipRef.current = L.tooltip({
        permanent: true,
        direction: 'center',
        className: 'vnc-measure-tooltip',
      })
        .setLatLng(midpoint)
        .setContent(
          `TT ${routeMetrics.trueTrack.toFixed(0)}deg | MT ${routeMetrics.magneticTrack.toFixed(0)}deg | ${routeMetrics.distanceNm.toFixed(1)} NM`,
        )
        .addTo(map);
    }
  }, [pointA, pointB, routeMetrics]);

  const cursorLabel = cursorCoordinate
    ? `${formatDms(cursorCoordinate[0], 'lat')} / ${formatDms(cursorCoordinate[1], 'lon')}`
    : 'Move your cursor over the chart to inspect coordinates.';

  return (
    <section className="vnc-viewer not-content" aria-label="VNC chart viewer">
      <header className="vnc-head">
        <h3>VNC Chart Viewer + Virtual Plotter</h3>
        <p>
          Click Point A, then Point B to draw a route and measure its distance. A third click resets
          the route with a new Point A.
        </p>
      </header>

      <div className="vnc-map-shell">
        {loadError ? (
          <p className="vnc-error" role="alert">{loadError}</p>
        ) : (
          <>
            <div ref={mapElementRef} className="vnc-map" />
            <div className="vnc-crosshair" aria-hidden="true" />
          </>
        )}
      </div>

      <div className="vnc-data-panel" aria-live="polite">
        <p className="vnc-label">Coordinate finder</p>
        <p className="vnc-value">{cursorLabel}</p>

        <p className="vnc-label">Plotter</p>
        {routeMetrics ? (
          <p className="vnc-value">
            True Track: <strong>{routeMetrics.trueTrack.toFixed(0)}deg</strong> | Magnetic Track ({magneticVariationDegrees}deg{magneticVariationDirection}): <strong>{routeMetrics.magneticTrack.toFixed(0)}deg</strong> | Distance: <strong>{routeMetrics.distanceNm.toFixed(1)} NM</strong>
          </p>
        ) : (
          <p className="vnc-value">Set two points to calculate true track and distance.</p>
        )}

        <button
          type="button"
          className="vnc-reset"
          onClick={() => {
            setPointA(null);
            setPointB(null);
          }}
        >
          Clear Plotter
        </button>
      </div>

      <style>{`
        .vnc-viewer {
          display: grid;
          gap: 0.75rem;
          padding: 1rem;
          border-radius: 1rem;
          border: 1px solid var(--sl-color-gray-5);
          background: color-mix(in srgb, var(--sl-color-bg) 94%, var(--sl-color-gray-6));
        }

        .vnc-head h3 {
          margin: 0;
          font-size: 1.05rem;
        }

        .vnc-head p {
          margin: 0.35rem 0 0;
          color: var(--sl-color-gray-2);
          font-size: 0.9rem;
        }

        .vnc-map-shell {
          position: relative;
          border: 1px solid var(--sl-color-gray-5);
          border-radius: 0.85rem;
          overflow: hidden;
          min-height: 420px;
          background: var(--hp-tool-map-surface);
        }

        .vnc-map {
          width: 100%;
          height: 420px;
        }

        .vnc-crosshair {
          pointer-events: none;
          position: absolute;
          inset: 0;
          background:
            linear-gradient(to right, transparent calc(50% - 0.5px), rgba(12, 23, 39, 0.45) 50%, transparent calc(50% + 0.5px)),
            linear-gradient(to bottom, transparent calc(50% - 0.5px), rgba(12, 23, 39, 0.45) 50%, transparent calc(50% + 0.5px));
        }

        .vnc-data-panel {
          border: 1px solid var(--sl-color-gray-5);
          border-radius: 0.75rem;
          padding: 0.7rem;
          display: grid;
          gap: 0.35rem;
          background: color-mix(in srgb, var(--sl-color-bg) 90%, transparent);
        }

        .vnc-label {
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--sl-color-gray-3);
          font-size: var(--sl-text-xs);
          font-weight: 700;
        }

        .vnc-value {
          margin: 0;
          color: var(--sl-color-gray-2);
          font-size: 0.87rem;
          line-height: 1.4;
        }

        .vnc-reset {
          margin-top: 0.25rem;
          justify-self: start;
          border-radius: 0.6rem;
          border: 1px solid color-mix(in srgb, var(--sl-color-accent) 45%, var(--sl-color-gray-4));
          background: color-mix(in srgb, var(--sl-color-accent) 16%, var(--sl-color-bg));
          color: var(--sl-color-white);
          padding: 0.42rem 0.65rem;
          font-size: var(--sl-text-xs);
          font-weight: 600;
          cursor: pointer;
        }

        .vnc-error {
          margin: 0;
          padding: 0.8rem;
          color: var(--hp-tool-alert-text);
          background: color-mix(in srgb, var(--hp-tool-negative) 20%, var(--sl-color-bg));
        }

        :global(.vnc-measure-tooltip) {
          background: var(--hp-tool-tooltip-bg);
          border: 1px solid var(--hp-tool-tooltip-border);
          color: var(--hp-tool-tooltip-text);
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          box-shadow: 0 8px 24px rgba(2, 6, 23, 0.25);
        }

        :global(.vnc-measure-tooltip::before) {
          display: none;
        }

        @media (max-width: 760px) {
          .vnc-map-shell,
          .vnc-map {
            min-height: 340px;
            height: 340px;
          }

          .vnc-head p,
          .vnc-value {
            font-size: 0.82rem;
          }
        }
      `}</style>
    </section>
  );
}

export default VNCViewer;
