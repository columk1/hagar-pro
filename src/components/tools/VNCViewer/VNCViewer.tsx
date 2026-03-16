import type { LatLngTuple, Layer, LeafletMouseEvent, Map, Polyline, Tooltip } from 'leaflet'

import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo, useRef, useState } from 'react'

import styles from './VNCViewer.module.css'

type VariationDirection = 'E' | 'W'

type VNCViewerProps = {
  chartImageUrl?: string
  chartBounds?: [LatLngTuple, LatLngTuple]
  initialCenter?: LatLngTuple
  initialZoom?: number
  tileUrlTemplate?: string
  chartAttribution?: string
  baseMapUrlTemplate?: string
  baseMapAttribution?: string
  minZoom?: number
  maxZoom?: number
  magneticVariationDirection?: VariationDirection
  magneticVariationDegrees?: number
}

type LeafletModule = typeof import('leaflet')

const EARTH_RADIUS_METERS = 6_371_000
const METERS_PER_NAUTICAL_MILE = 1_852

const DEFAULT_BOUNDS: [LatLngTuple, LatLngTuple] = [
  [48.5, -124.0],
  [49.5, -122.25],
]

const DEFAULT_INITIAL_CENTER: LatLngTuple = [49.1, -123.4]

function degreesToRadians(value: number): number {
  return (value * Math.PI) / 180
}

function radiansToDegrees(value: number): number {
  return (value * 180) / Math.PI
}

function normalizeBearing(value: number): number {
  return ((value % 360) + 360) % 360
}

function calculateDistanceNm(pointA: LatLngTuple, pointB: LatLngTuple): number {
  const [lat1, lon1] = pointA
  const [lat2, lon2] = pointB

  const phi1 = degreesToRadians(lat1)
  const phi2 = degreesToRadians(lat2)
  const deltaPhi = degreesToRadians(lat2 - lat1)
  const deltaLambda = degreesToRadians(lon2 - lon1)

  const haversine =
    Math.sin(deltaPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2

  const centralAngle = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  const meters = EARTH_RADIUS_METERS * centralAngle
  return meters / METERS_PER_NAUTICAL_MILE
}

function calculateTrueTrack(pointA: LatLngTuple, pointB: LatLngTuple): number {
  const [lat1, lon1] = pointA
  const [lat2, lon2] = pointB

  const phi1 = degreesToRadians(lat1)
  const phi2 = degreesToRadians(lat2)
  const deltaLambda = degreesToRadians(lon2 - lon1)

  const y = Math.sin(deltaLambda) * Math.cos(phi2)
  const x =
    Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda)

  return normalizeBearing(radiansToDegrees(Math.atan2(y, x)))
}

function formatDms(value: number, axis: 'lat' | 'lon'): string {
  const isPositive = value >= 0
  const absolute = Math.abs(value)
  const degrees = Math.floor(absolute)
  const minutes = (absolute - degrees) * 60

  const hemisphere = axis === 'lat' ? (isPositive ? 'N' : 'S') : isPositive ? 'E' : 'W'

  const degreeLabel =
    axis === 'lat' ? String(degrees).padStart(2, '0') : String(degrees).padStart(3, '0')

  return `${degreeLabel}deg ${minutes.toFixed(2).padStart(5, '0')}' ${hemisphere}`
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
  const mapElementRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<Map | null>(null)
  const leafletRef = useRef<LeafletModule | null>(null)

  const pointAMarkerRef = useRef<Layer | null>(null)
  const pointBMarkerRef = useRef<Layer | null>(null)
  const routeLineRef = useRef<Polyline | null>(null)
  const routeTooltipRef = useRef<Tooltip | null>(null)

  const pointARef = useRef<LatLngTuple | null>(null)
  const pointBRef = useRef<LatLngTuple | null>(null)

  const [pointA, setPointA] = useState<LatLngTuple | null>(null)
  const [pointB, setPointB] = useState<LatLngTuple | null>(null)
  const [cursorCoordinate, setCursorCoordinate] = useState<LatLngTuple | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    pointARef.current = pointA
  }, [pointA])

  useEffect(() => {
    pointBRef.current = pointB
  }, [pointB])

  const routeMetrics = useMemo(() => {
    if (!pointA || !pointB) {
      return null
    }

    const trueTrack = calculateTrueTrack(pointA, pointB)
    const variationSign = magneticVariationDirection === 'E' ? -1 : 1
    const magneticTrack = normalizeBearing(trueTrack + variationSign * magneticVariationDegrees)

    return {
      distanceNm: calculateDistanceNm(pointA, pointB),
      trueTrack,
      magneticTrack,
    }
  }, [pointA, pointB, magneticVariationDirection, magneticVariationDegrees])

  useEffect(() => {
    const mapElement = mapElementRef.current
    if (!mapElement || mapRef.current) {
      return
    }

    let didCancel = false

    const initializeMap = async () => {
      try {
        const L = await import('leaflet')
        if (didCancel || !mapElementRef.current) {
          return
        }

        leafletRef.current = L

        const map = L.map(mapElementRef.current, {
          zoomControl: true,
          attributionControl: true,
          minZoom,
          maxZoom,
          maxBounds: chartBounds,
          maxBoundsViscosity: 1.0,
        })

        if (baseMapUrlTemplate) {
          L.tileLayer(baseMapUrlTemplate, {
            attribution: baseMapAttribution,
            minZoom,
            maxZoom,
            bounds: chartBounds,
            opacity: 0.45,
          }).addTo(map)
        }

        if (tileUrlTemplate) {
          L.tileLayer(tileUrlTemplate, {
            attribution: chartAttribution,
            minZoom,
            maxZoom,
            bounds: chartBounds,
          }).addTo(map)
        } else {
          L.imageOverlay(chartImageUrl, chartBounds, {
            attribution: chartAttribution,
            interactive: false,
            opacity: 1,
          }).addTo(map)
        }

        map.setView(initialCenter, initialZoom)
        map.setMaxBounds(chartBounds)

        map.on('mousemove', (event: LeafletMouseEvent) => {
          setCursorCoordinate([event.latlng.lat, event.latlng.lng])
        })

        map.on('mouseout', () => {
          setCursorCoordinate(null)
        })

        map.on('click', (event: LeafletMouseEvent) => {
          const clickedPoint: LatLngTuple = [event.latlng.lat, event.latlng.lng]

          if (!pointARef.current) {
            setPointA(clickedPoint)
            setPointB(null)
            return
          }

          if (!pointBRef.current) {
            setPointB(clickedPoint)
            return
          }

          setPointA(clickedPoint)
          setPointB(null)
        })

        mapRef.current = map
      } catch {
        setLoadError('Leaflet failed to load. Ensure the package is installed and reload.')
      }
    }

    initializeMap()

    return () => {
      didCancel = true
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
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
  ])

  useEffect(() => {
    const map = mapRef.current
    const L = leafletRef.current

    if (!map || !L) {
      return
    }

    for (const existingLayerRef of [pointAMarkerRef, pointBMarkerRef, routeLineRef]) {
      if (existingLayerRef.current) {
        existingLayerRef.current.remove()
        existingLayerRef.current = null
      }
    }

    if (routeTooltipRef.current) {
      routeTooltipRef.current.remove()
      routeTooltipRef.current = null
    }

    if (pointA) {
      pointAMarkerRef.current = L.circleMarker(pointA, {
        radius: 7,
        color: 'var(--sl-color-accent)',
        weight: 2,
        fillColor: 'var(--sl-color-accent)',
        fillOpacity: 0.95,
      })
        .bindTooltip('Point A', { direction: 'top', permanent: true, offset: [0, -10] })
        .addTo(map)
    }

    if (pointB) {
      pointBMarkerRef.current = L.circleMarker(pointB, {
        radius: 7,
        color: 'var(--sl-color-red)',
        weight: 2,
        fillColor: 'var(--sl-color-red)',
        fillOpacity: 0.95,
      })
        .bindTooltip('Point B', { direction: 'top', permanent: true, offset: [0, -10] })
        .addTo(map)
    }

    if (pointA && pointB && routeMetrics) {
      routeLineRef.current = L.polyline([pointA, pointB], {
        color: 'var(--sl-color-green)',
        weight: 4,
        opacity: 0.92,
      }).addTo(map)

      const midpoint: LatLngTuple = [(pointA[0] + pointB[0]) / 2, (pointA[1] + pointB[1]) / 2]

      routeTooltipRef.current = L.tooltip({
        permanent: true,
        direction: 'center',
        className: 'vnc-measure-tooltip',
      })
        .setLatLng(midpoint)
        .setContent(
          `TT ${routeMetrics.trueTrack.toFixed(0)}deg | MT ${routeMetrics.magneticTrack.toFixed(0)}deg | ${routeMetrics.distanceNm.toFixed(1)} NM`,
        )
        .addTo(map)
    }
  }, [pointA, pointB, routeMetrics])

  const cursorLabel = cursorCoordinate
    ? `${formatDms(cursorCoordinate[0], 'lat')} / ${formatDms(cursorCoordinate[1], 'lon')}`
    : 'Move your cursor over the chart to inspect coordinates.'

  return (
    <section className={`${styles.viewer} not-content`} aria-label="VNC chart viewer">
      <header className={styles.head}>
        <h3>VNC Chart Viewer + Virtual Plotter</h3>
        <p>
          Click Point A, then Point B to draw a route and measure its distance. A third click resets
          the route with a new Point A.
        </p>
      </header>

      <div className={styles.mapShell}>
        {loadError ? (
          <p className={styles.error} role="alert">
            {loadError}
          </p>
        ) : (
          <div ref={mapElementRef} className={styles.map} />
        )}
      </div>

      <div className={styles.dataPanel} aria-live="polite">
        <p className={styles.label}>Coordinate finder</p>
        <p className={styles.value}>{cursorLabel}</p>

        <p className={styles.label}>Plotter</p>
        {routeMetrics ? (
          <p className={styles.value}>
            True Track: <strong>{routeMetrics.trueTrack.toFixed(0)}deg</strong> | Magnetic Track (
            {magneticVariationDegrees}deg{magneticVariationDirection}):{' '}
            <strong>{routeMetrics.magneticTrack.toFixed(0)}deg</strong> | Distance:{' '}
            <strong>{routeMetrics.distanceNm.toFixed(1)} NM</strong>
          </p>
        ) : (
          <p className={styles.value}>Set two points to calculate true track and distance.</p>
        )}

        <button
          type="button"
          className={styles.reset}
          onClick={() => {
            setPointA(null)
            setPointB(null)
          }}
        >
          Clear Plotter
        </button>
      </div>
    </section>
  )
}

export default VNCViewer
