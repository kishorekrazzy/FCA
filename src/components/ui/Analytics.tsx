import { allLessons } from '../../types'
import type { Course } from '../../types'

export function ActivityHeatmap({ log }: { log: Record<string, number> }) {
 const days = 112
 const today = new Date()
 const cells = Array.from({ length: days }, (_, index) => {
  const date = new Date(today)
  date.setDate(date.getDate() - (days - 1 - index))
  const key = date.toISOString().slice(0, 10)
  return { key, count: log[key] ?? 0 }
 })
 const max = Math.max(1, ...cells.map((cell) => cell.count))
 const levelFor = (count: number) => count === 0 ? 0 : Math.min(4, Math.ceil((count / max) * 4))
 const weeks: (typeof cells)[] = []
 for (let index = 0; index < cells.length; index += 7) weeks.push(cells.slice(index, index + 7))

 return <div className="heatmap">
  <div className="heatmap-grid">{weeks.map((week, index) => <div className="heatmap-col" key={index}>{week.map((cell) => <span className={`heatmap-cell level-${levelFor(cell.count)}`} key={cell.key} title={`${cell.key}: ${cell.count} ${cell.count === 1 ? 'activity' : 'activities'}`}/>)}</div>)}</div>
  <div className="heatmap-legend"><span>Less</span>{[0, 1, 2, 3, 4].map((level) => <span className={`heatmap-cell level-${level}`} key={level}/>)}<span>More</span></div>
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
