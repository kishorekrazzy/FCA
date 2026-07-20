import { useState } from 'react'
import { deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { Image, Trash2 } from 'lucide-react'
import { db } from '../../lib/firebase'
import { useRemotePosts, type RemotePost } from '../../components/admin/useAdminData'

export function AdminCommunity() {
 const { posts, error } = useRemotePosts()
 const sorted = posts ? [...posts].sort((a, b) => b.createdAt - a.createdAt) : []
 const [editingId, setEditingId] = useState<string | null>(null)
 const [imageDraft, setImageDraft] = useState('')
 const [savingId, setSavingId] = useState<string | null>(null)

 const remove = async (id: string) => { if (!window.confirm('Delete this post?')) return; try { await deleteDoc(doc(db, 'posts', id)) } catch { window.alert('Could not delete — check Firestore rules.') } }
 const startEdit = (post: RemotePost) => { setEditingId(post.id); setImageDraft(post.image ?? '') }
 const saveImage = async (id: string) => {
  setSavingId(id)
  try { await updateDoc(doc(db, 'posts', id), { image: imageDraft.trim() || null }); setEditingId(null) }
  catch { window.alert('Could not save — check Firestore rules.') }
  setSavingId(null)
 }

 return <div className="admin-page">
  <header className="admin-header"><div><span className="kicker">Moderation</span><h1>Community</h1><p>Everything posted to the commons, newest first. Edit an image URL, or remove anything that breaks the rules.</p></div></header>
  <div className="admin-panel">
   {error && <p className="admin-empty">Firestore isn't reachable — posts created while offline stay device-local and won't appear here until Firestore is connected.</p>}
   {!error && !sorted.length && <p className="admin-empty">No community posts yet.</p>}
   <div className="admin-post-list">{sorted.map((post) => <article className="admin-post" key={post.id}>
    <div className="admin-post-thumb">{post.image ? <img src={post.image} alt=""/> : <div className="admin-post-thumb-empty"><Image size={16}/></div>}</div>
    <div className="admin-post-body">
     <div><b>{post.name}</b> <span>@{post.handle}</span></div>
     <p>{post.text}</p>
     {editingId === post.id ? <div className="admin-post-image-edit"><input value={imageDraft} onChange={(event) => setImageDraft(event.target.value)} placeholder="https://images.example.com/photo.jpg"/><button className="button primary sm" onClick={() => saveImage(post.id)} disabled={savingId === post.id}>{savingId === post.id ? 'Saving…' : 'Save'}</button><button className="button ghost sm" onClick={() => setEditingId(null)}>Cancel</button></div> : <footer><span>{post.likes} likes · {post.replies} replies</span><button onClick={() => startEdit(post)}><Image size={13}/> Edit image</button><button onClick={() => remove(post.id)} aria-label="Delete post"><Trash2/> Delete</button></footer>}
    </div>
   </article>)}</div>
  </div>
 </div>
}
