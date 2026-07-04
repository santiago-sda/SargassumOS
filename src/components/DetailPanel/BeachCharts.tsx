'use client'
import { useMemo } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import type { Report } from '@/types'

const CONDITION_COLOR: Record<string, string> = {
  clean:    '#22c55e',
  light:    '#facc15',
  moderate: '#f97316',
  heavy:    '#dc2626',
  unknown:  '#9ca3af',
}
const CONDITION_LABEL: Record<string, string> = {
  clean: 'Clear', light: 'Light', moderate: 'Moderate', heavy: 'Heavy', unknown: 'Unknown',
}

interface Props { reports: Report[] }

export default function BeachCharts({ reports }: Props) {
  const donutData = useMemo(() => {
    const counts: Record<string, number> = {}
    reports.forEach(r => { counts[r.condition] = (counts[r.condition] ?? 0) + 1 })
    return Object.entries(counts).map(([condition, value]) => ({
      condition, value, label: CONDITION_LABEL[condition] ?? condition,
    }))
  }, [reports])

  const timelineData = useMemo(() => {
    const days: Record<string, Record<string, number>> = {}
    const now = Date.now()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 86400000)
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      days[key] = { clean: 0, light: 0, moderate: 0, heavy: 0 }
    }
    reports.forEach(r => {
      const key = new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      if (days[key] && r.condition !== 'unknown') {
        days[key][r.condition] = (days[key][r.condition] ?? 0) + 1
      }
    })
    return Object.entries(days).map(([day, counts]) => ({ day, ...counts }))
  }, [reports])

  if (reports.length < 3) {
    return (
      <div className="rounded-2xl bg-gray-50 border border-gray-100 px-4 py-6 text-center mb-4">
        <p className="text-2xl mb-1">📊</p>
        <p className="text-sm font-semibold text-gray-600">Not enough data yet</p>
        <p className="text-xs text-gray-400 mt-0.5">Charts will appear after 3+ reports</p>
      </div>
    )
  }

  return (
    <div className="mb-4 flex flex-col gap-3">
      {/* Donut */}
      <div className="rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Condition Distribution</p>
        <div className="flex items-center gap-3">
          <ResponsiveContainer width={100} height={100}>
            <PieChart>
              <Pie data={donutData} dataKey="value" innerRadius={28} outerRadius={44} paddingAngle={2} startAngle={90} endAngle={-270}>
                {donutData.map(entry => (
                  <Cell key={entry.condition} fill={CONDITION_COLOR[entry.condition] ?? '#9ca3af'} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any, _: any, props: any) => [value, props.payload?.label ?? '']}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-1.5">
            {donutData.map(entry => (
              <div key={entry.condition} className="flex items-center gap-2">
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: CONDITION_COLOR[entry.condition] ?? '#9ca3af', flexShrink: 0, display: 'inline-block' }} />
                <span className="text-xs text-gray-600">{entry.label}</span>
                <span className="text-xs font-semibold text-gray-800 ml-auto pl-2">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7-day timeline */}
      <div className="rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Last 7 Days</p>
        <ResponsiveContainer width="100%" height={110}>
          <BarChart data={timelineData} barSize={10} barGap={2}>
            <CartesianGrid vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis hide allowDecimals={false} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
            />
            <Bar dataKey="clean"    name="Clear"    fill={CONDITION_COLOR.clean}    stackId="a" radius={[0,0,0,0]} />
            <Bar dataKey="light"    name="Light"    fill={CONDITION_COLOR.light}    stackId="a" radius={[0,0,0,0]} />
            <Bar dataKey="moderate" name="Moderate" fill={CONDITION_COLOR.moderate} stackId="a" radius={[0,0,0,0]} />
            <Bar dataKey="heavy"    name="Heavy"    fill={CONDITION_COLOR.heavy}    stackId="a" radius={[2,2,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
