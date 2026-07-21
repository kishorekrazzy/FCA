import { Medal } from 'lucide-react'
import { achievementValue, useAchievements, type AchievementStats } from '../../store/achievements-store'

export function AchievementGrid({ stats }: { stats: AchievementStats }) {
 const achievements = useAchievements()
 if (!achievements.length) return <p className="admin-empty">No achievements yet — check back soon.</p>
 return <div className="achievements-grid">{achievements.map((achievement) => {
  const value = achievementValue(stats, achievement.goalType)
  const unlocked = value >= achievement.goalCount
  return <article className={`achievement-card ${unlocked ? 'unlocked' : ''}`} key={achievement.id}>
   <span className="achievement-sticker">{achievement.stickerUrl ? <img src={achievement.stickerUrl} alt=""/> : <Medal/>}</span>
   <h3>{achievement.title}</h3>
   <p>{achievement.description}</p>
   {!unlocked && <span className="achievement-progress-text">{Math.min(value, achievement.goalCount).toLocaleString()}/{achievement.goalCount.toLocaleString()}</span>}
  </article>
 })}</div>
}
