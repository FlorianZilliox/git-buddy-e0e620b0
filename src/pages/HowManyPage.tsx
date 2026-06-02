import { useMemo, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { ScenarioCard } from '@/components/ScenarioCard'

// @ts-expect-error — JS service
import { extractThroughputs, detectTrend, calculateStability, runSimulation } from '@/services/howManyService.js'
// @ts-expect-error — JS service
import { aggregateBySprint } from '@/services/csvParserV2.js'

export function HowManyPage() {
  const csvData = useAppStore((s) => s.csvData)
  const csvLoaded = useAppStore((s) => s.csvLoaded)
  const [metricType, setMetricType] = useState<'tickets' | 'storyPoints'>('tickets')

  const analysis = useMemo(() => {
    if (!csvLoaded || !csvData?.sprintReview) return null

    try {
      const { tickets } = csvData.sprintReview as { tickets: any[] }
      const sprintData = aggregateBySprint(tickets)

      // Extract throughputs
      const throughputs = extractThroughputs
        ? extractThroughputs(sprintData, metricType)
        : sprintData.map((s: any) => metricType === 'storyPoints' ? s.storyPointsDelivered : s.closed)

      if (!throughputs || throughputs.length < 3) return null

      const trend = detectTrend(throughputs)
      const stability = calculateStability(throughputs)
      const simulation = runSimulation(throughputs, {})

      return { throughputs, trend, stability, simulation }
    } catch (err) {
      console.error('[HowManyPage] Error:', err)
      return null
    }
  }, [csvLoaded, csvData, metricType])

  if (!csvLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <span className="material-symbols-outlined text-5xl text-ink-mute mb-4">upload_file</span>
        <h2 className="h-section mb-2">Aucune donnée</h2>
        <p className="dek">Importez vos CSV depuis la page Préparation.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="cover">
        <div>
          <div className="eyebrow" style={{ color: '#667eea' }}>Page secrète</div>
          <h1 className="h-display">
            How <em>Many</em>
          </h1>
          <p className="lede">Combien de sprints faut-il pour livrer X tickets ou story points ?</p>
        </div>
      </div>

      <div className="section--editorial">
        <div className="section__head">
          <div className="section__title">
            <div className="section__num">★ — Analyse</div>
            <h2 className="h-section">Données historiques</h2>
          </div>
          <div className="toggle">
            <button
              aria-pressed={metricType === 'tickets' ? 'true' : 'false'}
              onClick={() => setMetricType('tickets')}
            >
              Tickets
            </button>
            <button
              aria-pressed={metricType === 'storyPoints' ? 'true' : 'false'}
              onClick={() => setMetricType('storyPoints')}
            >
              SP
            </button>
          </div>
        </div>

        {analysis ? (
          <>
            {/* Trend & Stability */}
            <div className="kpi-grid">
              <div className="kpi">
                <div className="kpi__label">Tendance</div>
                <div className="kpi__num">
                  <span className="tnum">
                    {analysis.trend?.direction === 'up' ? '↑' : analysis.trend?.direction === 'down' ? '↓' : '→'}
                  </span>
                </div>
                <div className="kpi__hint">
                  {analysis.trend?.direction === 'up' ? 'En amélioration' :
                   analysis.trend?.direction === 'down' ? 'En baisse' : 'Stable'}
                </div>
              </div>
              <div className="kpi">
                <div className="kpi__label">Stabilité</div>
                <div className="kpi__num">
                  <span className="tnum">{Math.round((analysis.stability?.score || 0) * 100)}</span>
                  <em>%</em>
                </div>
                <div className="kpi__hint">
                  {(analysis.stability?.score || 0) >= 0.7 ? 'Vélocité prévisible' : 'Vélocité variable'}
                </div>
              </div>
              <div className="kpi">
                <div className="kpi__label">Sprints analysés</div>
                <div className="kpi__num"><span className="tnum">{analysis.throughputs.length}</span></div>
              </div>
            </div>

            {/* Simulation results */}
            {analysis.simulation && (
              <div style={{ marginTop: 24 }}>
                <h3 className="h-card" style={{ marginBottom: 16 }}>Projections</h3>
                <div className="scenarios">
                  {Object.entries(analysis.simulation).slice(0, 3).map(([key, val]: [string, any]) => (
                    <ScenarioCard
                      key={key}
                      name={val.label || key}
                      percentile={val.confidence || ''}
                      value={val.sprints ?? val.value ?? '—'}
                      sub={val.description}
                      variant={key.includes('pessim') || key.includes('p15') ? 'p15' : key.includes('optim') || key.includes('p85') ? 'p85' : 'p50'}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
            <p className="dek">Données insuffisantes (minimum 3 sprints nécessaires).</p>
          </div>
        )}
      </div>

      <div className="fineprint">
        *Page secrète — ←←→→ pour débloquer, ↓↓↑↑ pour masquer
      </div>
    </div>
  )
}
