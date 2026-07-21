import { useRef, useState } from 'react'
import { ArrowLeft, Check, Pencil, Plus, Trash2, Upload } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useCourseBySlug } from '../../data/catalog'
import { deleteExamQuestion, emptyExamQuestion, parseExamJson, upsertExamQuestion, useExamQuestions, type ExamQuestion } from '../../store/exam-store'

function QuestionEditor({ question, onClose }: { question: ExamQuestion; onClose: () => void }) {
 const [draft, setDraft] = useState(question)
 const [saving, setSaving] = useState(false)
 const setOption = (index: number, value: string) => { const options = [...draft.options]; options[index] = value; setDraft({ ...draft, options }) }
 const valid = draft.question.trim() && draft.options.every((option) => option.trim())
 const save = async () => { setSaving(true); await upsertExamQuestion(draft).catch(() => window.alert('Could not save — check Firestore rules.')); setSaving(false); onClose() }

 return <div className="admin-panel path-editor">
  <label>Question<textarea value={draft.question} onChange={(event) => setDraft({ ...draft, question: event.target.value })} rows={2} placeholder="What does neuroplasticity mean?"/></label>
  <label>Image URL (optional)<input value={draft.imageUrl ?? ''} onChange={(event) => setDraft({ ...draft, imageUrl: event.target.value })} placeholder="https://images.example.com/diagram.jpg"/></label>
  {draft.imageUrl && <div className="thumb-preview"><img src={draft.imageUrl} alt=""/></div>}
  <label>Answer options — select the correct one</label>
  <div className="exam-option-editor-list">{draft.options.map((option, index) => <label className="exam-option-editor-row" key={index}><input type="radio" name={`correct-${draft.id}`} checked={draft.correctIndex === index} onChange={() => setDraft({ ...draft, correctIndex: index })}/><input value={option} onChange={(event) => setOption(index, event.target.value)} placeholder={`Option ${index + 1}`}/></label>)}</div>
  <div className="admin-form-actions"><button className="button primary sm" onClick={save} disabled={saving || !valid}>{saving ? 'Saving…' : 'Save question'}</button><button className="button ghost sm" onClick={onClose}>Cancel</button></div>
 </div>
}

export function AdminExamEditor() {
 const { slug } = useParams()
 const course = useCourseBySlug(slug, true)
 const questions = useExamQuestions(slug)
 const [editingId, setEditingId] = useState<string | null>(null)
 const [creating, setCreating] = useState(false)
 const [importSummary, setImportSummary] = useState('')
 const fileRef = useRef<HTMLInputElement>(null)

 if (!slug || !course) return <div className="admin-page"><p className="admin-empty">Course not found.</p></div>

 const remove = async (id: string) => { if (!window.confirm('Delete this question?')) return; await deleteExamQuestion(id).catch(() => window.alert('Could not delete — check Firestore rules.')) }

 const importFile = async (file: File) => {
  setImportSummary('Importing…')
  try {
   const text = await file.text()
   const parsed = JSON.parse(text)
   const { valid, skipped } = parseExamJson(parsed, slug)
   if (!valid.length) { setImportSummary(`No valid questions found${skipped ? ` (${skipped} rows skipped — check the shape)` : ''}.`); return }
   await Promise.all(valid.map((question) => upsertExamQuestion(question)))
   setImportSummary(`Imported ${valid.length} question${valid.length === 1 ? '' : 's'}${skipped ? `, skipped ${skipped} invalid row${skipped === 1 ? '' : 's'}` : ''}.`)
  } catch {
   setImportSummary('Could not read that file — make sure it\'s valid JSON.')
  }
  if (fileRef.current) fileRef.current.value = ''
 }

 return <div className="admin-page">
  <header className="admin-header"><div><Link className="text-link" to={`/admin/courses/${slug}`}><ArrowLeft size={14}/> {course.title}</Link><h1>Final exam questions</h1><p>Learners get {questions.length >= 30 ? '30 random questions from this bank' : `all ${questions.length} question${questions.length === 1 ? '' : 's'} (add ${30 - questions.length} more to reach the random-30 pool)`} each attempt, with options shuffled.</p></div></header>

  <div className="admin-panel">
   <div className="admin-panel-head"><h2>Import from JSON</h2><button className="button ghost sm" onClick={() => fileRef.current?.click()}><Upload size={14}/> Choose file</button></div>
   <input ref={fileRef} type="file" accept="application/json" hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) importFile(file) }}/>
   <p className="admin-hint">Expects an array of objects: <code>{'[{"question":"...","options":["A","B","C","D"],"correctIndex":1,"imageUrl":""}]'}</code>. <code>imageUrl</code> is optional.</p>
   {importSummary && <p className="admin-empty">{importSummary}</p>}
  </div>

  <div className="admin-panel-head banner-section-head"><h2>Question bank ({questions.length})</h2><button className="button primary sm" onClick={() => setCreating(true)}><Plus size={14}/> New question</button></div>

  {creating && <QuestionEditor question={emptyExamQuestion(slug)} onClose={() => setCreating(false)}/>}

  {!questions.length && !creating && <p className="admin-empty">No exam questions yet — add some above, or import a JSON file, before learners can take the final exam.</p>}

  <div className="admin-post-list">{questions.map((question) => editingId === question.id ? <QuestionEditor question={question} onClose={() => setEditingId(null)} key={question.id}/> : <article className="admin-post" key={question.id}>
   {question.imageUrl ? <div className="admin-post-thumb"><img src={question.imageUrl} alt=""/></div> : <div className="admin-post-thumb admin-post-thumb-empty"><Check size={16}/></div>}
   <div className="admin-post-body">
    <p>{question.question}</p>
    <p className="path-course-list">{question.options.map((option, index) => index === question.correctIndex ? `✓ ${option}` : option).join(' · ')}</p>
    <footer><button onClick={() => setEditingId(question.id)}><Pencil size={13}/> Edit</button><button onClick={() => remove(question.id)} aria-label="Delete question"><Trash2/> Delete</button></footer>
   </div>
  </article>)}</div>
 </div>
}
