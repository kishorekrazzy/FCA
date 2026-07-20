import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ChevronLeft, CornerDownRight, Flag, Info, MessageSquare, NotebookPen, Send, X } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useCourseBySlug } from '../data/catalog'
import { allLessons } from '../types'
import { useAcademyStore } from '../store/academy-store'
import { useAuthStore } from '../store/auth-store'
import { fetchNote, saveNote } from '../store/notes-store'
import { addLessonThread, useLessonThreads } from '../store/discussion-store'
import { ConfettiBurst, Reveal, ScrollProgress } from '../components/fx'
import { RenderBlocks } from '../components/admin/BlockRenderer'
import { RelatedCourses } from '../components/ui/RelatedCourses'
import type { Lesson as LessonType } from '../types'

const blockText = (lesson: LessonType) => (lesson.blocks ?? []).map((block) => ('text' in block ? block.text : 'body' in block ? block.body : '')).join(' ')
const readingMinutes = (lesson: LessonType) => Math.max(1, Math.round((lesson.lead + ' ' + lesson.sections.map(section => section.title + ' ' + section.body).join(' ') + ' ' + blockText(lesson)).split(/\s+/).length / 170))

function NotesPanel({ courseSlug, lessonSlug }: { courseSlug: string; lessonSlug: string }) {
 const user = useAuthStore((state) => state.user)
 const [text, setText] = useState('')
 const [status, setStatus] = useState<'idle' | 'loading' | 'saving' | 'saved'>('idle')
 const timer = useRef<number | undefined>(undefined)

 useEffect(() => {
  if (!user) return
  setStatus('loading')
  fetchNote(user.uid, lessonSlug).then((value) => { setText(value); setStatus('idle') }).catch(() => setStatus('idle'))
 }, [user, lessonSlug])

 const onChange = (value: string) => {
  setText(value)
  if (!user) return
  window.clearTimeout(timer.current)
  setStatus('saving')
  timer.current = window.setTimeout(() => { saveNote(user.uid, lessonSlug, courseSlug, value).then(() => setStatus('saved')).catch(() => setStatus('idle')) }, 700)
 }

 return <section className="prose notes-panel"><h2><NotebookPen size={17}/> My notes</h2>{user ? <><p className="notes-hint">Private to you — jot down what clicks while you read.</p><textarea value={text} onChange={(event) => onChange(event.target.value)} placeholder="Write a note for future-you…" rows={4}/><span className={`notes-status ${status}`}>{status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved ✓' : status === 'loading' ? 'Loading…' : ''}</span></> : <p className="notes-hint"><Link to="/auth/sign-in">Sign in</Link> to keep private notes for every lesson, synced to your account.</p>}</section>
}

function DiscussionPanel({ lessonSlug }: { lessonSlug: string }) {
 const user = useAuthStore((state) => state.user)
 const { comments, discussion } = useLessonThreads(lessonSlug)
 const [open, setOpen] = useState(false)
 const [tab, setTab] = useState<'discussion' | 'comment'>('discussion')
 const [text, setText] = useState('')
 const [posting, setPosting] = useState(false)
 const items = tab === 'discussion' ? discussion : comments
 const total = comments.length + discussion.length

 const submit = async () => {
  if (!user || !text.trim()) return
  setPosting(true)
  await addLessonThread(lessonSlug, tab, user.uid, user.displayName ?? 'Learner', user.photoURL ?? null, text)
  setText('')
  setPosting(false)
 }

 return <>
  <button className={`discussion-tab ${open ? 'open' : ''}`} onClick={() => setOpen((value) => !value)}><MessageSquare size={15}/> <span>Discussion</span>{total > 0 && <em>{total}</em>}</button>
  <aside className={`discussion-panel ${open ? 'open' : ''}`}>
   <header><h2>Lesson discussion</h2><button aria-label="Close discussion" onClick={() => setOpen(false)}><X size={16}/></button></header>
   <div className="discussion-switch">
    <button className={tab === 'discussion' ? 'on' : ''} onClick={() => setTab('discussion')}>Discussion{discussion.length > 0 && <em>{discussion.length}</em>}</button>
    <button className={tab === 'comment' ? 'on' : ''} onClick={() => setTab('comment')}>Comments{comments.length > 0 && <em>{comments.length}</em>}</button>
   </div>
   <div className="discussion-list">{items.length ? items.map((item) => <article className="discussion-item" key={item.id}><span className="discussion-avatar">{item.photo ? <img src={item.photo} alt="" referrerPolicy="no-referrer"/> : item.name.slice(0, 2).toUpperCase()}</span><div><b>{item.name}</b><p>{item.text}</p></div></article>) : <p className="discussion-empty">{tab === 'discussion' ? 'No discussion yet — ask a question or share an insight.' : 'No comments yet.'}</p>}</div>
   {user ? <div className="discussion-input"><input value={text} onChange={(event) => setText(event.target.value)} placeholder={tab === 'discussion' ? 'Ask a question or share an insight…' : 'Add a quick comment…'} onKeyDown={(event) => event.key === 'Enter' && submit()}/><button aria-label="Post" onClick={submit} disabled={posting || !text.trim()}><Send size={14}/></button></div> : <p className="discussion-empty"><Link to="/auth/sign-in">Sign in</Link> to join the conversation.</p>}
  </aside>
 </>
}

export function Lesson() {
 const { courseSlug, lessonSlug } = useParams(); const course = useCourseBySlug(courseSlug); const [answer, setAnswer] = useState(''); const [feedback, setFeedback] = useState<'good' | 'bad' | null>(null); const [toast, setToast] = useState(false); const [confetti, setConfetti] = useState(0)
 const complete = useAcademyStore(state => state.complete); const completedList = useAcademyStore(state => state.completed); const reader = useAcademyStore(state => state.reader); const toggleReader = useAcademyStore(state => state.toggleReader)
 if (!course) return <main className="page not-found"><h1>Lesson not found.</h1></main>
 const lessons = allLessons(course); const index = lessons.findIndex(item => item.slug === lessonSlug); const lesson = lessons[index] ?? lessons[0]; const next = lessons[index + 1]; const prev = lessons[index - 1]
 const completed = completedList.includes(lesson.slug)
 const markComplete = () => { if (completed) return; complete(course.slug, lesson.slug, lesson.xp); setToast(true); setConfetti(Date.now()); window.setTimeout(() => setToast(false), 3600); window.setTimeout(() => setConfetti(0), 3200) }
 const submitDrill = () => { if (!lesson.drill) return; setFeedback(lesson.drill.accepted.some(value => answer.toLowerCase().trim().includes(value)) ? 'good' : 'bad') }
 return <>
 <main className={`lesson-shell ${reader ? 'reader-mode' : ''}`}><aside className="lesson-sidebar"><Link className="back-link" to={`/academy/${course.slug}`}><ChevronLeft/> {course.title}</Link><div className="sidebar-list">{lessons.map(item => <Link className={item.slug === lesson.slug ? 'active' : completedList.includes(item.slug) ? 'done' : ''} to={`/academy/${course.slug}/${item.slug}`} key={item.slug}>{item.title}</Link>)}</div></aside>
 <article className="lesson-article"><ScrollProgress/><div className="lesson-tools"><Link className="tool-pill" to={`/academy/${course.slug}`} aria-label="Back to course"><ArrowLeft/></Link><span className="lesson-read">~{readingMinutes(lesson)} min read</span><span className="lesson-xp"><img className="mini-icon" src="/icon-xp.svg" alt=""/> +{lesson.xp} IQ</span></div>
 <div className={`lesson-hero ${lesson.thumbnail ? 'has-photo' : ''}`} style={{ '--course-color': course.color } as React.CSSProperties}>{lesson.thumbnail ? <img className="lesson-hero-photo" src={lesson.thumbnail} alt="" key={lesson.slug}/> : <><i/><i/><i/></>}</div>
 <span className="lesson-eyebrow">{course.title}</span><h1>{lesson.title}</h1><p className="lesson-lead">{lesson.lead}</p>
 {lesson.blocks && lesson.blocks.length > 0 ? <RenderBlocks blocks={lesson.blocks}/> : lesson.sections.map(section => <Reveal key={section.title}><section className="prose"><h2>{section.title}</h2><p>{section.body}</p></section></Reveal>)}
 {lesson.callout && <aside className="callout"><Info/><p><b>{lesson.callout.title}.</b> {lesson.callout.body}</p></aside>}
 {lesson.table && <section className="prose"><h2>{lesson.table.title}</h2><div className="data-table"><table><thead><tr>{lesson.table.headers.map(header => <th key={header}>{header}</th>)}</tr></thead><tbody>{lesson.table.rows.map(row => <tr key={row[0]}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div></section>}
 {lesson.drill && <section className="prose"><h2>Drill it until it's reflex</h2><p>{lesson.drill.hint}</p><div className="drill"><span className="drill-counter">1 / 1</span><h3>{lesson.drill.prompt}</h3><div className="drill-input"><input value={answer} onChange={event => { setAnswer(event.target.value); setFeedback(null) }} placeholder={lesson.drill.placeholder} onKeyDown={event => event.key === 'Enter' && submitDrill()}/><button onClick={submitDrill} aria-label="Submit answer"><CornerDownRight/></button></div>{feedback && <p className={feedback === 'good' ? 'feedback success' : 'feedback error'}>{feedback === 'good' ? 'Exactly. You found the key idea.' : 'Not quite. Re-read the lesson, then try again.'}</p>}</div></section>}
 <NotesPanel courseSlug={course.slug} lessonSlug={lesson.slug}/>
 <nav className="lesson-next">{prev ? <Link className="button ghost" to={`/academy/${course.slug}/${prev.slug}`}><ArrowLeft/> Previous lesson</Link> : <span/>}{next ? <Link className="button ghost" to={`/academy/${course.slug}/${next.slug}`}>Next lesson <ArrowRight/></Link> : <Link className="button gold-button" to={`/academy/${course.slug}/certificate`}>Claim certificate <ArrowRight/></Link>}</nav></article>
 </main>
 {!reader && <RelatedCourses excludeSlug={course.slug} category={course.category}/>}
 {!reader && <DiscussionPanel lessonSlug={lesson.slug}/>}
 <div className="quick-actions"><span>Quick actions</span><button aria-label="Report an issue"><Flag/></button><button aria-label="Mark lesson complete" className={completed ? 'active' : ''} onClick={markComplete}><CheckCircle2/></button></div>
 <button className="reader-pill" onClick={toggleReader}><BookOpen/> {reader ? 'Exit reader' : 'Reader mode'}</button>
 <ConfettiBurst trigger={confetti}/>{toast && <div className="xp-toast"><b>Lesson complete!</b><span className="toast-xp"><img className="mini-icon" src="/icon-xp.svg" alt=""/> +{lesson.xp} IQ</span></div>}
 </>
}