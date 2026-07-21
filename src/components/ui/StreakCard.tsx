import { Flame, Snowflake } from 'lucide-react'
import { dateKey, MAX_STREAK_FREEZES } from '../../store/academy-store'

const DAY = 86400000
const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function currentWeekKeys(): string[] {
 const now = new Date()
 const isoDay = now.getDay() === 0 ? 7 : now.getDay() // Monday = 1 ... Sunday = 7
 const monday = new Date(now.getTime() - (isoDay - 1) * DAY)
 return Array.from({ length: 7 }, (_, i) => dateKey(monday.getTime() + i * DAY))
}

export function StreakCard({ streak, streakFreezes, activityLog }: { streak: number; streakFreezes: number; activityLog: Record<string, number> }) {
 const week = currentWeekKeys()
 const today = dateKey()
 const activeDaysThisWeek = week.filter((key) => key <= today && (activityLog[key] ?? 0) > 0).length

 return <section className="streak-card">
  <div className="streak-flame"><Flame size={30}/></div>
  <div className="streak-main">
   <div className="streak-headline"><strong>{streak}</strong><span>{streak === 1 ? 'day streak' : 'day streak'}</span></div>
   <div className="streak-progress"><div className="progress"><span style={{ width: `${Math.round((activeDaysThisWeek / 7) * 100)}%` }}/></div><small>{activeDaysThisWeek}/7 days active this week</small></div>
   <div className="streak-week">{week.map((key, index) => { const done = key <= today && (activityLog[key] ?? 0) > 0; const isToday = key === today; return <div className={`streak-day ${done ? 'done' : ''} ${isToday ? 'today' : ''}`} key={key}><span className="streak-day-dot">{done ? '✓' : ''}</span><small>{WEEKDAY_LABELS[index]}</small></div> })}</div>
  </div>
  <div className="streak-freezes" title="Streak freezes auto-cover one missed day so your streak survives"><Snowflake size={14}/> {streakFreezes}/{MAX_STREAK_FREEZES} freezes</div>
 </section>
}
