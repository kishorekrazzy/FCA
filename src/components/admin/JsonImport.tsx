import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Check, FileJson, Upload, X } from 'lucide-react'
import { slugify } from '../../types'

const EASE = [0.22, 1, 0.36, 1] as const

/** Generic paste-or-upload JSON importer for admin list pages (Courses, Books). Accepts a
 * single object or an array of objects, fills in any missing fields from `emptyItem()`,
 * derives a slug from the title when one isn't given, then hands each item to `upsertItem`
 * — the same full-document write the editor pages already use, so imported content behaves
 * exactly like anything created by hand. */
export function JsonImport<T extends { slug: string; title: string }>({ noun, template, emptyItem, upsertItem }: {
 noun: string
 template: string
 emptyItem: () => T
 upsertItem: (item: T) => Promise<void>
}) {
 const [open, setOpen] = useState(false)
 const [text, setText] = useState('')
 const [error, setError] = useState('')
 const [result, setResult] = useState('')
 const [busy, setBusy] = useState(false)
 const [copied, setCopied] = useState(false)

 const close = () => { setOpen(false); setError(''); setResult(''); setText('') }

 const copyTemplate = async () => {
  try { await navigator.clipboard.writeText(template); setCopied(true); window.setTimeout(() => setCopied(false), 1800) }
  catch { setError('Could not copy to clipboard — select the template text and copy it manually.') }
 }

 const onFile = (file?: File) => {
  if (!file) return
  file.text().then((content) => { setText(content); setError(''); setResult('') }).catch(() => setError('Could not read that file.'))
 }

 const runImport = async () => {
  setError(''); setResult('')
  let parsed: unknown
  try { parsed = JSON.parse(text) }
  catch { setError("That isn't valid JSON — check for a missing comma, quote, or bracket.") ; return }
  const items = Array.isArray(parsed) ? parsed : [parsed]
  if (!items.length) { setError('Nothing to import — the JSON was empty.'); return }
  setBusy(true)
  try {
   for (const raw of items) {
    if (!raw || typeof raw !== 'object') throw new Error(`Each ${noun} must be a JSON object.`)
    const item = raw as Partial<T>
    if (!item.title || !String(item.title).trim()) throw new Error(`Every ${noun} needs a non-empty "title".`)
    const slug = item.slug && String(item.slug).trim() ? slugify(String(item.slug)) : slugify(String(item.title))
    if (!slug) throw new Error(`Could not derive a URL slug for "${item.title}".`)
    await upsertItem({ ...emptyItem(), ...item, slug } as T)
   }
   setResult(`Imported ${items.length} ${items.length === 1 ? noun : `${noun}s`}.`)
   setText('')
  } catch (err) {
   setError(err instanceof Error ? err.message : 'Import failed — check the shape matches the template.')
  }
  setBusy(false)
 }

 return <>
  <button className="button ghost" onClick={() => setOpen(true)}><FileJson size={15}/> Import JSON</button>
  <AnimatePresence>
   {open && <motion.div className="json-import-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} onClick={(event) => { if (event.target === event.currentTarget) close() }}>
    <motion.div className="json-import-panel" initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 6 }} transition={{ duration: 0.24, ease: EASE }}>
     <div className="json-import-head"><h3><FileJson size={16}/> Import {noun}s from JSON</h3><button onClick={close} aria-label="Close"><X size={16}/></button></div>
     <p>Paste a JSON object — or an array of objects to import several at once — matching the template. Any field you leave out falls back to a sensible default; <code>slug</code> is derived from <code>title</code> if omitted.</p>
     <textarea value={text} onChange={(event) => { setText(event.target.value); setError(''); setResult('') }} placeholder="Paste JSON here…" rows={14} spellCheck={false}/>
     {error && <p className="json-import-error">{error}</p>}
     {result && <p className="json-import-success"><Check size={13}/> {result}</p>}
     <div className="json-import-actions">
      <label className="button ghost sm json-import-upload">
       <Upload size={13}/> Upload file
       <input type="file" accept="application/json" onChange={(event) => onFile(event.target.files?.[0])} hidden/>
      </label>
      <button className="button ghost sm" onClick={copyTemplate}>{copied ? <><Check size={13}/> Copied</> : 'Copy template'}</button>
      <button className="button primary sm" onClick={runImport} disabled={!text.trim() || busy}>{busy ? 'Importing…' : 'Import'}</button>
     </div>
    </motion.div>
   </motion.div>}
  </AnimatePresence>
 </>
}
