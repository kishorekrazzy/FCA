import { useEffect, useState } from 'react'
import { ImageIcon, Pencil, Plus, Trash2 } from 'lucide-react'
import { deleteBanner, emptyBanner, upsertBanner, useAllBanners, type Banner, type BannerPlacement } from '../../store/banners-store'
import { setHeroImageUrl, useHeroImageUrl } from '../../store/site-settings-store'

function HeroImageSettings() {
 const currentUrl = useHeroImageUrl()
 const [draft, setDraft] = useState(currentUrl ?? '')
 const [saving, setSaving] = useState(false)
 const [saved, setSaved] = useState(false)
 useEffect(() => { setDraft(currentUrl ?? '') }, [currentUrl])

 const save = async () => {
  setSaving(true)
  await setHeroImageUrl(draft).catch(() => window.alert('Could not save — check Firestore rules.'))
  setSaving(false)
  setSaved(true)
  window.setTimeout(() => setSaved(false), 2000)
 }

 return <div className="admin-panel">
  <h2>Homepage hero background</h2>
  <label>Image URL<input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="https://images.example.com/hero.jpg"/></label>
  <div className={`thumb-preview hero-thumb-preview ${draft ? '' : 'thumb-preview-empty'}`}>{draft ? <img src={draft} alt=""/> : <span>No image set — the hero uses the generated gradient background instead.</span>}</div>
  <div className="admin-form-actions"><button className="button primary sm" onClick={save} disabled={saving}>{saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save hero image'}</button>{draft && <button className="button ghost sm" onClick={() => setDraft('')}>Clear</button>}</div>
 </div>
}

function BannerEditor({ banner, onClose }: { banner: Banner; onClose: () => void }) {
 const [draft, setDraft] = useState(banner)
 const [saving, setSaving] = useState(false)
 const save = async () => { setSaving(true); await upsertBanner(draft).catch(() => window.alert('Could not save — check Firestore rules.')); setSaving(false); onClose() }

 return <div className="admin-panel path-editor">
  <label>Image URL ({draft.placement === 'login' ? 'tall portrait works best' : '21:9 works best'})<input value={draft.imageUrl} onChange={(event) => setDraft({ ...draft, imageUrl: event.target.value })} placeholder="https://images.example.com/banner.jpg"/></label>
  <div className={`thumb-preview banner-thumb-preview ${draft.imageUrl ? '' : 'thumb-preview-empty'}`}>{draft.imageUrl ? <img src={draft.imageUrl} alt=""/> : <span>No image set yet.</span>}</div>
  <label>Title (optional overlay text)<input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="e.g. New: Learn How to Learn Anything"/></label>
  <label>Link URL (optional — internal path like /academy, or a full external URL)<input value={draft.linkUrl} onChange={(event) => setDraft({ ...draft, linkUrl: event.target.value })} placeholder="/academy/learn-how-to-learn"/></label>
  <div className="field-row">
   <label>Show on<select value={draft.placement} onChange={(event) => setDraft({ ...draft, placement: event.target.value as BannerPlacement })}><option value="home">Home page</option><option value="academy">Academy page</option><option value="login">Login page</option></select></label>
  </div>
  <div className="admin-form-actions"><button className="button primary sm" onClick={save} disabled={saving || !draft.imageUrl}>{saving ? 'Saving…' : 'Save banner'}</button><button className="button ghost sm" onClick={onClose}>Cancel</button></div>
 </div>
}

export function AdminBanners() {
 const banners = useAllBanners()
 const [editingId, setEditingId] = useState<string | null>(null)
 const [creating, setCreating] = useState<BannerPlacement | null>(null)

 const remove = async (id: string) => { if (!window.confirm('Delete this banner?')) return; await deleteBanner(id).catch(() => window.alert('Could not delete — check Firestore rules.')) }
 const editing = banners.find((banner) => banner.id === editingId)

 return <div className="admin-page">
  <header className="admin-header"><div><span className="kicker">Site content</span><h1>Banners</h1><p>The homepage hero image, and wide promotional banners shown on the Home and Academy pages.</p></div></header>
  <HeroImageSettings/>

  <div className="admin-panel-head banner-section-head"><h2>Promotional banners</h2><div className="admin-form-actions"><button className="button ghost sm" onClick={() => setCreating('home')}><Plus size={14}/> New home banner</button><button className="button ghost sm" onClick={() => setCreating('academy')}><Plus size={14}/> New academy banner</button><button className="button ghost sm" onClick={() => setCreating('login')}><Plus size={14}/> New login image</button></div></div>

  {creating && <BannerEditor banner={emptyBanner(creating)} onClose={() => setCreating(null)}/>}
  {editing && <BannerEditor banner={editing} onClose={() => setEditingId(null)}/>}

  {!banners.length && !creating && <p className="admin-empty">No banners yet — add one above. With more than one on the same page, they'll rotate automatically.</p>}

  <div className="banner-admin-grid">{banners.map((banner) => <article className="banner-admin-card" key={banner.id}>
   <div className="banner-admin-thumb">{banner.imageUrl ? <img src={banner.imageUrl} alt=""/> : <ImageIcon/>}</div>
   <div className="banner-admin-body">
    <span className={`banner-placement-tag ${banner.placement}`}>{banner.placement === 'home' ? 'Home' : banner.placement === 'academy' ? 'Academy' : 'Login'}</span>
    <b>{banner.title || 'Untitled banner'}</b>
    {banner.linkUrl && <p className="path-course-list">Links to {banner.linkUrl}</p>}
    <footer><button onClick={() => setEditingId(banner.id)}><Pencil size={13}/> Edit</button><button onClick={() => remove(banner.id)} aria-label="Delete banner"><Trash2/> Delete</button></footer>
   </div>
  </article>)}</div>
 </div>
}
