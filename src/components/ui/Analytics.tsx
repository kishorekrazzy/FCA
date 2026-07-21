import { useMemo } from 'react'
import { allLessons } from '../../types'
import type { Course } from '../../types'

const WEEKDAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

/** GitHub-style contribution graph: one column per calendar week, aligned to Sunday,
 * spanning `weeksCount` weeks back from today. Month labels sit above the column
 * containing the 1st of that month, matching how GitHub's own graph labels months. */
export function ContributionGraph({ log, weeksCount = 53 }: { log: Record<string, number>; weeksCount?: number }) {
 const { weeks, monthLabels, max, totalReps, activeDays } = useMemo(() => {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const start = new Date(today)
  start.setDate(start.getDate() - (weeksCount * 7 - 1))
  start.setDate(start.getDate() - start.getDay())
  const days: { key: string; count: number; date: Date }[] = []
  for (const cursor = new Date(start); cursor <= today; cursor.setDate(cursor.getDate() + 1)) {
   const key = cursor.toISOString().slice(0, 10)
   days.push({ key, count: log[key] ?? 0, date: new Date(cursor) })
  }
  const weeks: (typeof days)[] = []
  for (let index = 0; index < days.length; index += 7) weeks.push(days.slice(index, index + 7))
  const monthLabels = weeks.map((week) => { const firstOfMonth = week.find((day) => day.date.getDate() === 1); return firstOfMonth ? firstOfMonth.date.toLocaleDateString('en-US', { month: 'short' }) : '' })
  const max = Math.max(1, ...days.map((day) => day.count))
  const totalReps = days.reduce((sum, day) => sum + day.count, 0)
  const activeDays = days.filter((day) => day.count > 0).length
  return { weeks, monthLabels, max, totalReps, activeDays }
 }, [log, weeksCount])

 const levelFor = (count: number) => count === 0 ? 0 : Math.min(4, Math.ceil((count / max) * 4))

 return <div className="contrib">
  <div className="contrib-scroll">
   <div className="contrib-inner">
    <div className="contrib-months">{monthLabels.map((label, index) => <span key={index}>{label}</span>)}</div>
    <div className="contrib-body">
     <div className="contrib-weekdays">{WEEKDAY_LABELS.map((label, index) => <span key={index}>{label}</span>)}</div>
     <div className="contrib-grid">{weeks.map((week, index) => <div className="contrib-col" key={index}>{week.map((day) => <span className={`contrib-cell level-${levelFor(day.count)}`} key={day.key} title={`${day.date.toDateString()} — ${day.count} ${day.count === 1 ? 'activity' : 'activities'}`}/>)}</div>)}</div>
    </div>
   </div>
  </div>
  <div className="contrib-foot">
   <span className="contrib-summary">{totalReps.toLocaleString()} reps logged · {activeDays} active days in the last year</span>
   <div className="contrib-legend"><span>Less</span>{[0, 1, 2, 3, 4].map((level) => <span className={`contrib-cell level-${level}`} key={level}/>)}<span>More</span></div>
  </div>
 </div>
}

export function SkillRadar({ completed, courses }: { completed: string[]; courses: Course[] }) {
 const tally = new Map<string, number>()
 for (const course of courses) {
  const count = allLessons(course).filter((lesson) => completed.includes(lesson.slug)).length
  if (count > 0) tally.set(course.category, (tally.get(course.category) ?? 0) + count)
 }
 const categories = [...tally.entries()]
 if (categories.length < 3) return <p className="admin-empty">Complete lessons across a few categories to see your skill spread.</p>

 const max = Math.max(...categories.map(([, value]) => value))
 const size = 240, center = size / 2, radius = center - 46
 const angleFor = (index: number) => (Math.PI * 2 * index) / categories.length - Math.PI / 2
 const pointAt = (index: number, ratio: number) => { const angle = angleFor(index); const r = radius * ratio; return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}` }
 const shapePoints = categories.map(([, value], index) => pointAt(index, value / max)).join(' ')

 return <div className="radar-wrap">
  <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
   {[0.25, 0.5, 0.75, 1].map((ring) => <polygon className="radar-ring" key={ring} points={categories.map((_, index) => pointAt(index, ring)).join(' ')}/>)}
   {categories.map((_, index) => { const angle = angleFor(index); return <line className="radar-axis" key={index} x1={center} y1={center} x2={center + radius * Math.cos(angle)} y2={center + radius * Math.sin(angle)}/> })}
   <polygon className="radar-shape" points={shapePoints}/>
   {categories.map(([label], index) => { const angle = angleFor(index); const x = center + (radius + 26) * Math.cos(angle); const y = center + (radius + 26) * Math.sin(angle); return <text className="radar-label" key={label} x={x} y={y} textAnchor="middle" dominantBaseline="middle">{label}</text> })}
  </svg>
 </div>
}
