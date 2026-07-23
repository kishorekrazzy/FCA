import { useState } from 'react'
import { Pencil, Plus, Ticket, Trash2 } from 'lucide-react'
import { deleteCoupon, deleteShopItem, emptyCoupon, emptyShopItem, upsertCoupon, upsertShopItem, useAllShopItemsAdmin, useShopCoupons, type ShopCoupon, type ShopItem } from '../../store/shop-store'

function ShopItemEditor({ item, onClose }: { item: ShopItem; onClose: () => void }) {
 const [draft, setDraft] = useState(item)
 const [saving, setSaving] = useState(false)
 const save = async () => { setSaving(true); await upsertShopItem(draft).catch(() => window.alert('Could not save — check Firestore rules.')); setSaving(false); onClose() }

 return <div className="admin-panel path-editor">
  <label>Name<input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="e.g. Confetti Burst"/></label>
  <label>Description<textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} rows={2} placeholder="What this item is / does."/></label>
  <div className="field-row">
   <label>Type<select value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value as ShopItem['type'] })}><option value="sticker">Chat sticker</option><option value="cosmetic">Profile cosmetic (flair)</option></select></label>
   <label>Price (IQ)<input type="number" value={draft.price} onChange={(event) => setDraft({ ...draft, price: Math.max(0, Number(event.target.value) || 0) })}/></label>
  </div>
  <label>{draft.type === 'sticker' ? 'Sticker character sent in chat' : 'Flair character shown next to the name'}<input value={draft.emoji} onChange={(event) => setDraft({ ...draft, emoji: event.target.value })} placeholder="✨" maxLength={4}/></label>
  <label>Preview image URL (small — stamp/sticker style)<input value={draft.image} onChange={(event) => setDraft({ ...draft, image: event.target.value })} placeholder="https://images.example.com/stamp.png"/></label>
  <div className={`thumb-preview shop-thumb-preview ${draft.image ? '' : 'thumb-preview-empty'}`}>{draft.image ? <img src={draft.image} alt=""/> : <span>No preview image yet — the emoji character shows instead.</span>}</div>
  <label className="checkbox-label"><input type="checkbox" checked={draft.active} onChange={(event) => setDraft({ ...draft, active: event.target.checked })}/> Available in the shop</label>
  <div className="admin-form-actions"><button className="button primary sm" onClick={save} disabled={saving || !draft.name}>{saving ? 'Saving…' : 'Save item'}</button><button className="button ghost sm" onClick={onClose}>Cancel</button></div>
 </div>
}

function CouponEditor({ coupon, items, onClose }: { coupon: ShopCoupon; items: ShopItem[]; onClose: () => void }) {
 const [draft, setDraft] = useState(coupon)
 const [saving, setSaving] = useState(false)
 const isNew = !coupon.code
 const save = async () => { setSaving(true); await upsertCoupon(draft).catch(() => window.alert('Could not save — check Firestore rules.')); setSaving(false); onClose() }

 return <div className="admin-panel path-editor">
  <label>Code<input value={draft.code} onChange={(event) => setDraft({ ...draft, code: event.target.value.toUpperCase() })} placeholder="WELCOME50" disabled={!isNew}/></label>
  <label>Grants item<select value={draft.itemId} onChange={(event) => setDraft({ ...draft, itemId: event.target.value })}><option value="">Select an item…</option>{items.map((item) => <option value={item.id} key={item.id}>{item.name || 'Untitled item'}</option>)}</select></label>
  <label>Max redemptions<input type="number" value={draft.maxRedemptions} onChange={(event) => setDraft({ ...draft, maxRedemptions: Math.max(1, Number(event.target.value) || 1) })}/></label>
  <label className="checkbox-label"><input type="checkbox" checked={draft.active} onChange={(event) => setDraft({ ...draft, active: event.target.checked })}/> Active</label>
  <p className="admin-hint-line">{draft.redeemedBy.length} of {draft.maxRedemptions} redeemed so far.</p>
  <div className="admin-form-actions"><button className="button primary sm" onClick={save} disabled={saving || !draft.code.trim() || !draft.itemId}>{saving ? 'Saving…' : 'Save coupon'}</button><button className="button ghost sm" onClick={onClose}>Cancel</button></div>
 </div>
}

export function AdminShop() {
 const items = useAllShopItemsAdmin()
 const coupons = useShopCoupons()
 const [editingId, setEditingId] = useState<string | null>(null)
 const [creating, setCreating] = useState(false)
 const [editingCode, setEditingCode] = useState<string | null>(null)
 const [creatingCoupon, setCreatingCoupon] = useState(false)

 const removeItem = async (id: string) => { if (!window.confirm('Delete this shop item? Learners who already own it keep it, but it disappears from the shop.')) return; await deleteShopItem(id).catch(() => window.alert('Could not delete — check Firestore rules.')) }
 const removeCoupon = async (code: string) => { if (!window.confirm('Delete this coupon code?')) return; await deleteCoupon(code).catch(() => window.alert('Could not delete — check Firestore rules.')) }
 const itemName = (id: string) => items.find((item) => item.id === id)?.name ?? 'Deleted item'

 return <div className="admin-page">
  <header className="admin-header"><div><span className="kicker">Gamification</span><h1>Shop</h1><p>Cosmetic stickers and profile flair learners buy with IQ on the Playground page — plus coupon codes that grant an item for free.</p></div><button className="button primary" onClick={() => setCreating(true)}><Plus size={15}/> New item</button></header>

  <div className="admin-panel">
   <h2>Items</h2>
   {creating && <ShopItemEditor item={emptyShopItem()} onClose={() => setCreating(false)}/>}
   {!items.length && !creating && <p className="admin-empty">No shop items yet — create one to let learners spend their IQ.</p>}
   <div className="admin-post-list">{items.map((item) => editingId === item.id ? <ShopItemEditor item={item} onClose={() => setEditingId(null)} key={item.id}/> : <article className="admin-post path-row" key={item.id}>
    <span className="path-row-icon achievement-sticker-thumb">{item.image ? <img src={item.image} alt=""/> : item.emoji}</span>
    <div className="admin-post-body">
     <div><b>{item.name || 'Untitled item'}</b> <span>· {item.type === 'sticker' ? 'Sticker' : 'Cosmetic'} · {item.price} IQ{!item.active && ' · Hidden'}</span></div>
     <p>{item.description}</p>
     <footer><button onClick={() => setEditingId(item.id)}><Pencil size={13}/> Edit</button><button onClick={() => removeItem(item.id)} aria-label="Delete item"><Trash2/> Delete</button></footer>
    </div>
   </article>)}</div>
  </div>

  <div className="admin-panel" style={{ marginTop: 18 }}>
   <div className="admin-panel-head"><h2><Ticket size={16}/> Coupon codes</h2><button className="button ghost sm" onClick={() => setCreatingCoupon(true)}><Plus size={13}/> New code</button></div>
   {creatingCoupon && <CouponEditor coupon={emptyCoupon()} items={items} onClose={() => setCreatingCoupon(false)}/>}
   {!coupons.length && !creatingCoupon && <p className="admin-empty">No coupon codes yet.</p>}
   {!!coupons.length && <table className="admin-table wide">
    <thead><tr><th>Code</th><th>Grants</th><th>Redeemed</th><th>Status</th><th/></tr></thead>
    <tbody>{coupons.map((coupon) => <tr key={coupon.code}><td><code>{coupon.code}</code></td><td>{itemName(coupon.itemId)}</td><td>{coupon.redeemedBy.length} / {coupon.maxRedemptions}</td><td>{coupon.active ? 'Active' : 'Disabled'}</td><td><div className="admin-row-actions"><button onClick={() => setEditingCode(coupon.code)} aria-label="Edit coupon"><Pencil/></button><button onClick={() => removeCoupon(coupon.code)} aria-label="Delete coupon"><Trash2/></button></div></td></tr>)}</tbody>
   </table>}
   {editingCode && <CouponEditor coupon={coupons.find((coupon) => coupon.code === editingCode)!} items={items} onClose={() => setEditingCode(null)}/>}
  </div>
 </div>
}
