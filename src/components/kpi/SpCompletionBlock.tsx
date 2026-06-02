// @ts-expect-error — JS service
import { formatNumber } from '@/utils/formatters.js'

export interface CompletionMetrics {
  currentDelivered: number
  currentCommitted: number
  currentCompletion: number
  currentSprintLabel: string
  initialCommitted: number
  initialDelivered: number
  initialCompletion: number
  /** Quantité d'éléments ajoutés en cours de sprint (SP ou tickets selon le mode) */
  midSprintAmount: number
  avgDelivered?: number
  avgCompletion?: number
  previousSprintsCount?: number
  recommendedVelocity?: number
}

interface SpCompletionBlockProps {
  metrics: CompletionMetrics
  /** Libellé d'unité court ('sp' ou 'tickets') */
  unit: string
  /** Libellé du hero (par défaut "Story points livrés") */
  heroLabel?: string
}

function getCompletionClass(pct: number): string {
  if (pct >= 90) return 'success'
  if (pct < 70) return 'danger'
  return 'warning'
}

function pillClass(cls: string): string {
  return cls === 'success' ? 'ok' : cls === 'danger' ? 'bad' : 'warn'
}

export function SpCompletionBlock({ metrics, unit, heroLabel }: SpCompletionBlockProps) {
  const {
    currentDelivered,
    currentCommitted,
    currentCompletion,
    currentSprintLabel,
    initialCommitted,
    initialDelivered,
    initialCompletion,
    midSprintAmount,
    avgDelivered,
    avgCompletion,
    previousSprintsCount,
    recommendedVelocity,
  } = metrics

  const initialClass = getCompletionClass(initialCompletion)
  const totalClass = getCompletionClass(currentCompletion)
  const hasMidSprint = midSprintAmount > 0
  const label = heroLabel ?? (unit === 'sp' ? 'Story points livrés' : 'Tickets livrés')

  return (
    <div className="sp" style={{ border: '1px solid var(--color-line)' }}>
      <div>
        <div className="eyebrow">{label}</div>
        <div className="sp__hero">
          <span className="v tnum">{currentDelivered}</span>
          <span className="frac">/ {currentCommitted} engagés</span>
        </div>
      </div>

      <div className="sp__bar">
        <div className="sp__bar-fill" style={{ width: `${currentCompletion}%` }} />
      </div>

      <div className="sp__completion-cards">
        <div className="kpi kpi--completion">
          <div className="kpi__label">Engagement initial</div>
          <div className="kpi__num"><span className="tnum">{initialCompletion}</span><em>%</em></div>
          <div className="kpi__hint">{initialDelivered} / {initialCommitted} {unit}</div>
          <div className="kpi__foot">
            <span className={`pill pill--${pillClass(initialClass)}`} style={{ fontSize: 10, padding: '2px 8px' }}>
              {hasMidSprint ? `Hors ${midSprintAmount} ${unit} ajoutés` : 'Scope préservé'}
            </span>
          </div>
        </div>
        <div className="kpi kpi--completion">
          <div className="kpi__label">Complétion totale</div>
          <div className="kpi__num"><span className="tnum">{currentCompletion}</span><em>%</em></div>
          <div className="kpi__hint">{currentDelivered} / {currentCommitted} {unit}</div>
          <div className="kpi__foot">
            <span className={`pill pill--${pillClass(totalClass)}`} style={{ fontSize: 10, padding: '2px 8px' }}>
              {currentSprintLabel || 'Sprint actuel'}
            </span>
          </div>
        </div>
      </div>

      <div className="sp__rows">
        {previousSprintsCount && previousSprintsCount > 0 && (
          <>
            <div className="sp__row">
              <span>Moyenne {previousSprintsCount} sprints précédents</span>
              <b>{formatNumber(avgDelivered || 0, 1)} {unit}</b>
              <span className="dek">{avgCompletion}%</span>
            </div>
            {recommendedVelocity ? (
              <div className="sp__row">
                <span>Vélocité recommandée</span>
                <b>{recommendedVelocity} {unit}</b>
                <span className="kicker">— suggéré</span>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
