import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { deleteChallenge, emptyChallenge, upsertChallenge, useChallenges, type Challenge } from '../../store/challenges-store'

const toLocalInput = (time: number) => { const d = new Date(time - new Date().getTimezoneOffset() * 60000); return d.toISOString().slice(0, 16) }
const fromLocalInput = (value: string) => new Date(value).getTime()

function ChallengeEditor({ challenge, onClose }: { challenge: Challenge; onClose: () => void }) {
 const [draft, setDraft] = useState(challenge)
 const [saving, setSaving] = useState(false)
 const save = async () => { setSaving(true); await upsertChallenge(draft).catch(() => window.alert('Could not save — check Firestore rules.')); setSaving(false); onClose() }

 return <div className="admin-panel path-editor">
  <label>Title<input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="e.g. Weekend Sprint"/></label>
  <label>Description<textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} rows={2}/></label>
  <div className="field-row">
   <label>Icon (emoji)<input value={draft.icon} onChange={(event) => setDraft({ ...draft, icon: event.target.value })} maxLength={2}/></label>
   <label>IQ reward<input type="number" value={draft.xpReward} onChange={(event) => setDraft({ ...draft, xpReward: Number(event.target.value) || 0 })}/></label>
  </div>
  <div className="field-row">
   <label>Starts<input type="datetime-local" value={toLocalInput(draft.startAt)} onChange={(event) => setDraft({ ...draft, startAt: fromLocalInput(event.target.value) })}/></label>
   <label>Ends<input type="datetime-local" value={toLocalInput(draft.endAt)} onChange={(event) => setDraft({ ...draft, endAt: fromLocalInput(event.target.value) })}/></label>
  </div>
  <div className="field-row">
   <label>Goal type<select value={draft.goalType} onChange={(event) => setDraft({ ...draft, goalType: event.target.value as Challenge['goalType'] })}><option value="lessons">Lessons completed</option><option value="streak">Day streak reached</option><option value="manual">Honor system (learner self-confirms)</option></select></label>
   {draft.goalType !== 'manual' && <label>Goal count<input type="number" value={draft.goalCount} onChange={(event) => setDraft({ ...draft, goalCount: Number(event.target.value) || 1 })}/></label>}
  </div>
  {draft.goalType === 'manual' && <p className="admin-hint">Learners tick a confirmation checkbox and claim the reward directly — use this for anything that can't be tracked automatically, like tagging FCA on LinkedIn.</p>}
  <div className="admin-form-actions"><button className="button primary sm" onClick={save} disabled={saving || !draft.title}>{saving ? 'Saving…' : 'Save event'}</button><button className="button ghost sm" onClick={onClose}>Cancel</button></div>
 </div>
}

export function AdminChallenges() {
 const challenges = useChallenges()
 const [editingId, setEditingId] = useState<string | null>(null)
 const [creating, setCreating] = useState(false)
 const now = Date.now()

 const remove = async (id: string) => { if (!window.confirm('Delete this event?')) return; await deleteChallenge(id).catch(() => window.alert('Could not delete — check Firestore rules.')) }

 return <div className="admin-page">
  <header className="admin-header"><div><span className="kicker">Gamification</span><h1>Events</h1><p>Time-boxed goals and one-off events that award bonus IQ — visible to learners on the Playground page.</p></div><button className="button primary" onClick={() => setCreating(true)}><Plus size={15}/> New event</button></header>
  <div className="admin-panel">
   {creating && <ChallengeEditor challenge={emptyChallenge()} onClose={() => setCreating(false)}/>}
   {!challenges.length && !creating && <p className="admin-empty">No events yet — create one to give learners a goal.</p>}
   <div className="admin-post-list">{challenges.map((challenge) => editingId === challenge.id ? <ChallengeEditor challenge={challenge} onClose={() => setEditingId(null)} key={challenge.id}/> : <article className="admin-post path-row" key={challenge.id}>
    <span className="path-row-icon">{challenge.icon || '🏆'}</span>
    <div className="admin-post-body">
     <div><b>{challenge.title || 'Untitled event'}</b> <span className={now >= challenge.startAt && now <= challenge.endAt ? 'challenge-live-tag' : ''}>{now < challenge.startAt ? 'Upcoming' : now > challenge.endAt ? 'Ended' : 'Live now'}</span></div>
     <p>{challenge.description}</p>
     <p className="path-course-list">{challenge.goalType === 'lessons' ? `Complete ${challenge.goalCount} lessons` : challenge.goalType === 'streak' ? `Reach a ${challenge.goalCount}-day streak` : 'Honor system — self-confirm'} · +{challenge.xpReward} IQ · {new Date(challenge.startAt).toLocaleDateString()} – {new Date(challenge.endAt).toLocaleDateString()}</p>
     <footer><button onClick={() => setEditingId(challenge.id)}><Pencil size={13}/> Edit</button><button onClick={() => remove(challenge.id)} aria-label="Delete event"><Trash2/> Delete</button></footer>
    </div>
   </article>)}</div>
  </div>
 </div>
}
