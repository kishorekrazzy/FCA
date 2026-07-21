import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { achievementGoalLabel, deleteAchievement, emptyAchievement, upsertAchievement, useAchievements, type Achievement } from '../../store/achievements-store'

function AchievementEditor({ achievement, onClose }: { achievement: Achievement; onClose: () => void }) {
 const [draft, setDraft] = useState(achievement)
 const [saving, setSaving] = useState(false)
 const save = async () => { setSaving(true); await upsertAchievement(draft).catch(() => window.alert('Could not save — check Firestore rules.')); setSaving(false); onClose() }

 return <div className="admin-panel path-editor">
  <label>Title<input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="e.g. First Light"/></label>
  <label>Description<textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} rows={2} placeholder="Complete your first lesson."/></label>
  <label>Sticker image URL (JPG)<input value={draft.stickerUrl} onChange={(event) => setDraft({ ...draft, stickerUrl: event.target.value })} placeholder="https://images.example.com/sticker.jpg"/></label>
  <div className={`thumb-preview ${draft.stickerUrl ? '' : 'thumb-preview-empty'}`}>{draft.stickerUrl ? <img src={draft.stickerUrl} alt=""/> : <span>No sticker set yet — learners will see a placeholder badge instead.</span>}</div>
  <div className="field-row">
   <label>Goal type<select value={draft.goalType} onChange={(event) => setDraft({ ...draft, goalType: event.target.value as Achievement['goalType'] })}><option value="lessons">Lessons completed</option><option value="streak">Day streak reached</option><option value="iq">Total IQ earned</option><option value="certificates">Certificates earned</option></select></label>
   <label>Goal count<input type="number" value={draft.goalCount} onChange={(event) => setDraft({ ...draft, goalCount: Number(event.target.value) || 1 })}/></label>
  </div>
  <div className="admin-form-actions"><button className="button primary sm" onClick={save} disabled={saving || !draft.title}>{saving ? 'Saving…' : 'Save achievement'}</button><button className="button ghost sm" onClick={onClose}>Cancel</button></div>
 </div>
}

export function AdminAchievements() {
 const achievements = useAchievements()
 const [editingId, setEditingId] = useState<string | null>(null)
 const [creating, setCreating] = useState(false)

 const remove = async (id: string) => { if (!window.confirm('Delete this achievement? Learners who already earned it will lose the sticker.')) return; await deleteAchievement(id).catch(() => window.alert('Could not delete — check Firestore rules.')) }

 return <div className="admin-page">
  <header className="admin-header"><div><span className="kicker">Gamification</span><h1>Achievements</h1><p>Permanent milestones that award a collectible sticker when a learner crosses the goal — visible on their dashboard and profile.</p></div><button className="button primary" onClick={() => setCreating(true)}><Plus size={15}/> New achievement</button></header>
  <div className="admin-panel">
   {creating && <AchievementEditor achievement={emptyAchievement()} onClose={() => setCreating(false)}/>}
   {!achievements.length && !creating && <p className="admin-empty">No achievements yet — create one to give learners something to collect.</p>}
   <div className="admin-post-list">{achievements.map((achievement) => editingId === achievement.id ? <AchievementEditor achievement={achievement} onClose={() => setEditingId(null)} key={achievement.id}/> : <article className="admin-post path-row" key={achievement.id}>
    <span className="path-row-icon achievement-sticker-thumb">{achievement.stickerUrl ? <img src={achievement.stickerUrl} alt=""/> : '🏅'}</span>
    <div className="admin-post-body">
     <div><b>{achievement.title || 'Untitled achievement'}</b></div>
     <p>{achievement.description}</p>
     <p className="path-course-list">Reach {achievement.goalCount} {achievementGoalLabel(achievement.goalType)}</p>
     <footer><button onClick={() => setEditingId(achievement.id)}><Pencil size={13}/> Edit</button><button onClick={() => remove(achievement.id)} aria-label="Delete achievement"><Trash2/> Delete</button></footer>
    </div>
   </article>)}</div>
  </div>
 </div>
}
