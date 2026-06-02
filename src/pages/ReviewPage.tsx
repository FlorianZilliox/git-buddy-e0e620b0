/**
 * ReviewPage — reproduction exacte de ReviewPage.js vanilla render()
 * Textes, classes CSS, et structure HTML identiques.
 */
import { useState, useCallback, useRef, useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { KpiGrid } from '@/components/kpi/KpiGrid'
import { ThroughputKpi, CycleTimeKpi, BugsKpi, MidSprintKpi, MttrKpi, CfrKpi } from '@/components/kpi/KpiCards'
import { SpCompletionBlock } from '@/components/kpi/SpCompletionBlock'
import { GoalItem, GoalInput } from '@/components/GoalItem'
import { ChartCard } from '@/components/charts/ChartCard'
import { ThroughputChart } from '@/components/charts/ThroughputChart'
import { CycleTimeChart } from '@/components/charts/CycleTimeChart'
import { TimeInStatusChart, StatusLegend } from '@/components/charts/TimeInStatusChart'
import { ExportMenu } from '@/components/ExportMenu'

// @ts-expect-error — JS service
import { formatNumber } from '@/utils/formatters.js'

type GoalStatus = 'achieved' | 'partial' | 'missed' | 'pending'
interface Goal { text: string; status: GoalStatus }

export function ReviewPage() {
  const csvLoaded = useAppStore((s) => s.csvLoaded)
  const sprintMetrics = useAppStore((s) => s.sprintMetrics) as Record<string, any> | null
  const selectedSprint = useAppStore((s) => s.selectedSprint)
  const availableSprints = useAppStore((s) => s.availableSprints)
  const selectedTeams = useAppStore((s) => s.selectedTeams)
  const availableTeams = useAppStore((s) => s.availableTeams)
  

  const [goals, setGoals] = useState<Goal[]>([])
  const [throughputMetric, setThroughputMetric] = useState<'tickets' | 'storyPoints'>('tickets')

  const addGoal = useCallback((text: string) => {
    if (goals.length >= 5) return
    setGoals((prev) => [...prev, { text, status: 'pending' }])
  }, [goals.length])

  const updateGoalStatus = useCallback((index: number, status: GoalStatus) => {
    setGoals((prev) => prev.map((g, i) => (i === index ? { ...g, status } : g)))
  }, [])

  // Empty state — same as vanilla
  if (!csvLoaded || !sprintMetrics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <span className="material-symbols-outlined text-5xl text-ink-mute mb-4">upload_file</span>
        <h2 className="h-section mb-2">Aucune donnée</h2>
        <p className="dek">Importez vos CSV depuis la page Préparation.</p>
      </div>
    )
  }

  const { throughput, cycleTime, bugs, storyPoints, timeInStatus, wip } = sprintMetrics as any

  // Team name and sprint label (same logic as vanilla)
  const teamName = selectedTeams.length === 1
    ? selectedTeams[0]
    : (availableTeams.length === 1 ? availableTeams[0] : 'Sprint Review')
  const sprintLabel = availableSprints.find((s) => s.sprint === selectedSprint)?.label || 'Sprint'
  const sprintNumber = String(selectedSprint || '').match(/\d+/)?.[0] || String(selectedSprint || '')

  return (
    <div className="review-page" id="section-review">

      {/* ══════ COVER — exact vanilla _renderHeader() ══════ */}
      <div className="cover">
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <h1 className="h-display">{teamName}</h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="cover__sprintno"><sup>N°</sup>{sprintNumber}</div>
          <div style={{ marginTop: 18, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <ExportMenu targetId="section-review" />
          </div>
        </div>
      </div>

      {/* ══════ § 01 — STORY POINTS ══════ */}
      {storyPoints && (
        <div className="section--editorial" style={{ borderTop: 0, paddingTop: 0, marginTop: 0 }}>
          <div className="section__head">
            <div className="section__title">
              <span className="section__num">§ 01 — Story points</span>
              <h2 className="h-section">Engagement et livraison</h2>
            </div>
          </div>
          <SpCompletionBlock
            currentDelivered={storyPoints.currentDelivered}
            currentCommitted={storyPoints.currentCommitted}
            currentCompletion={storyPoints.currentCompletion}
            currentSprintLabel={storyPoints.currentSprintLabel}
            initialCommitted={storyPoints.initialCommitted ?? storyPoints.currentCommitted}
            initialDelivered={storyPoints.initialDelivered ?? storyPoints.currentDelivered}
            initialCompletion={storyPoints.initialCompletion ?? storyPoints.currentCompletion}
            midSprintSP={storyPoints.midSprintSP ?? 0}
            avgDelivered={storyPoints.avgDelivered}
            avgCompletion={storyPoints.avgCompletion}
            previousSprintsCount={storyPoints.previousSprintsCount}
            recommendedVelocity={storyPoints.recommendedVelocity}
          />
        </div>
      )}

      {/* ══════ § 02 — INDICATEURS ══════ */}
      <div className="section--editorial">
        <div className="section__head">
          <div className="section__title">
            <span className="section__num">§ 02 — Indicateurs</span>
            <h2 className="h-section">Six chiffres pour résumer le sprint</h2>
          </div>
          <span className="dek section__deck">Comparé à la médiane des six derniers sprints.</span>
        </div>

        {/* KPI Grid — Row 1: Throughput, Cycle Time, Stock Bugs */}
        <KpiGrid>
          {throughput && (
            <ThroughputKpi
              value={throughput.currentValue}
              benchmark={throughput.benchmarkMedian}
              trend={throughput.trend}
            />
          )}
          {cycleTime && (
            <CycleTimeKpi
              avg={cycleTime.currentValue}
              median={cycleTime.sprintMedian || cycleTime.currentValue}
              trend={cycleTime.trend}
            />
          )}
          {bugs && (
            <BugsKpi
              stock={bugs.stock || 0}
              created={bugs.sprintCreated || 0}
              closed={bugs.sprintClosed || 0}
            />
          )}
        </KpiGrid>

        {/* KPI Grid — Row 2: Mid-Sprint, MTTR, CFR */}
        <KpiGrid>
          {throughput && (
            <MidSprintKpi
              count={throughput.midSprintCount || 0}
              throughputValue={throughput.currentValue}
              additions={throughput.midSprintAdditions || []}
            />
          )}
          {bugs && (
            <MttrKpi
              value={bugs.mttr || 0}
              median={bugs.mttrMedian || 0}
              periodAvg={bugs.mttrPeriod || 0}
            />
          )}
          {bugs && (
            <CfrKpi
              value={bugs.changeFailureRate || 0}
              periodAvg={bugs.changeFailureRatePeriod || 0}
              bugsClosed={bugs.sprintClosed || 0}
              itemsDelivered={bugs.itemsDelivered || 0}
            />
          )}
        </KpiGrid>
      </div>

      {/* ══════ § 03 — TENDANCES ══════ */}
      <div className="section--editorial">
        <div className="section__head">
          <div className="section__title">
            <span className="section__num">§ 03 — Tendances</span>
            <h2 className="h-section">Six sprints en perspective</h2>
          </div>
        </div>
        <div className="grid-2">
          {/* Throughput */}
          {throughput && (
            <ChartCard
              title="Throughput"
              subtitle={throughputMetric === 'storyPoints'
                ? 'Story Points livrés par sprint — sprint courant en pleine teinte'
                : 'Tickets fermés par sprint — sprint courant en pleine teinte'}
              actions={
                <div className="toggle">
                  <button
                    data-action="set-throughput-metric" data-value="tickets"
                    aria-pressed={throughputMetric === 'tickets' ? 'true' : 'false'}
                    onClick={() => setThroughputMetric('tickets')}
                  >Tickets</button>
                  <button
                    data-action="set-throughput-metric" data-value="storyPoints"
                    aria-pressed={throughputMetric === 'storyPoints' ? 'true' : 'false'}
                    onClick={() => setThroughputMetric('storyPoints')}
                  >SP</button>
                </div>
              }
            >
              <ThroughputChart
                labels={throughput.weeks || []}
                values={throughputMetric === 'storyPoints' ? (throughput.storyPointsValues || []) : (throughput.values || [])}
                benchmark={throughput.benchmarkMedian}
              />
            </ChartCard>
          )}

          {/* Cycle Time */}
          {cycleTime && (
            <ChartCard title="Cycle Time" subtitle="Temps moyen, en jours, par sprint">
              <CycleTimeChart
                labels={cycleTime.weeks || []}
                avgValues={cycleTime.values || []}
                medianValues={cycleTime.medianValues}
                benchmarkAvg={cycleTime.benchmarkAvg}
                benchmarkMedian={cycleTime.benchmarkMedian}
              />
            </ChartCard>
          )}

          {/* Time in Status */}
          {timeInStatus && (
            <ChartCard
              title="Répartition du cycle"
              subtitle="Sprint courant vs 6 sprints"
              legend={timeInStatus.sprintData && <StatusLegend items={timeInStatus.sprintData} />}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <TimeInStatusChart data={timeInStatus.sprintData || []} title="Sprint" />
                <TimeInStatusChart data={timeInStatus.periodData || []} title="6 sprints" />
              </div>
            </ChartCard>
          )}

          {/* Bugs */}
          {bugs && throughput && (
            <ChartCard
              title="Bugs — créés vs résolus"
              subtitle="Solde net du stock par sprint"
              legend={
                <div className="legend" style={{ margin: 0, gap: 12 }}>
                  <span className="legend__item"><span className="legend__sw" style={{ background: 'var(--rust)' }} />Créés</span>
                  <span className="legend__item"><span className="legend__sw" style={{ background: 'var(--sage)' }} />Résolus</span>
                </div>
              }
            >
              <div className="cell__chart" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="dek">Graphique bugs — Sprint 3</span>
              </div>
            </ChartCard>
          )}
        </div>
      </div>

      {/* ══════ FINEPRINT — exact vanilla ══════ */}
      <div className="fineprint">Sprint Review · {teamName} — {sprintLabel} · 100 % local · Aucune donnée transmise</div>
    </div>
  )
}
