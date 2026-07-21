import { Trophy } from 'lucide-react'
import { Reveal } from '../components/fx'
import { Leaderboard } from '../components/ui/Leaderboard'

export function LeaderboardPage() {
 return <main className="leaderboard-page page">
  <Reveal><span className="kicker"><Trophy size={13}/> Ranked by IQ</span><h1>The full <em>leaderboard.</em></h1><p>Every learner who's earned IQ and chosen to be seen here, ranked from the top.</p></Reveal>
  <Reveal delay={80}><Leaderboard limit={100}/></Reveal>
 </main>
}
