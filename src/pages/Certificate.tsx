import { useEffect, useState } from 'react'
import { Award, Check, CheckCircle2, Download, GraduationCap, ShieldCheck } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useCourseBySlug } from '../data/catalog'
import { useAcademyStore } from '../store/academy-store'
import { Tilt } from '../components/fx'
import { useAuthStore } from '../store/auth-store'
import { CertificateCard, downloadCertificatePng, formatCertDate } from '../components/ui/CertificateCard'
import { LinkedInIcon } from '../components/ui/ShareRow'
import { buildLinkedInAddUrl, certIdFor, recordCertificate, useCertificate } from '../store/certificates-store'
import { ExamModal } from '../components/ui/ExamModal'
import { EXAM_PASS_PERCENT, useExamQuestions } from '../store/exam-store'

export function Certificate() {
 const { courseSlug } = useParams(); const course = useCourseBySlug(courseSlug); const progress = useAcademyStore(state => course ? state.progress(course.slug) : 0); const user = useAuthStore(auth => auth.user)
 const examBank = useExamQuestions(course?.slug)
 const examPassed = useAcademyStore(state => course ? !!state.examPassed[course.slug] : false)
 const markExamPassed = useAcademyStore(state => state.markExamPassed)
 const [examOpen, setExamOpen] = useState(false)
 const [copied, setCopied] = useState(false)
 const lessonsDone = progress === 100
 const needsExam = lessonsDone && examBank.length > 0 && !examPassed
 const unlocked = lessonsDone && (examBank.length === 0 || examPassed)
 const certId = user && course ? certIdFor(user.uid, course.slug) : undefined
 const { cert } = useCertificate(certId)

 useEffect(() => {
  if (!unlocked || !user || !course || !certId) return
  recordCertificate({ id: certId, uid: user.uid, displayName: user.displayName ?? 'FCA Learner', photoURL: user.photoURL ?? null, courseSlug: course.slug, courseTitle: course.title })
 }, [unlocked, user, course, certId])

 if (!course) return null
 const displayName = user?.displayName ?? 'FCA Learner'
 const issuedAtMs = cert?.issuedAt ?? null
 const download = () => { if (certId) downloadCertificatePng(displayName, course.title, certId, issuedAtMs, `FCA-Certificate-${course.slug}.jpg`) }
 const linkedInUrl = certId && issuedAtMs ? buildLinkedInAddUrl(course.title, certId, issuedAtMs, `${window.location.origin}/certificates/${certId}`) : undefined
 // LinkedIn has no public, unauthenticated way to attach a downloaded image or preset
 // post text into a new post (that needs their OAuth Share API + a registered app).
 // The honest working version of "post this on LinkedIn": download the image, copy a
 // ready-to-paste caption, and open LinkedIn's post composer for the user to finish.
 const postToLinkedIn = async () => {
  if (!certId) return
  download()
  const url = `${window.location.origin}/certificates/${certId}`
  const caption = `I'm happy to share that I'm completing my course "${course.title}" at Future Creators Academy.\n\nCredential ID: ${certId}\nVerify here: ${url}`
  try { await navigator.clipboard.writeText(caption) } catch { /* clipboard unavailable */ }
  window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank', 'noopener')
  setCopied(true)
  window.setTimeout(() => setCopied(false), 5000)
 }
 return <main className="certificate-page page"><span className="kicker">Course credential</span><h1>Keep the proof<br/>of your <em>practice.</em></h1><p>A shareable, verifiable record of the work you completed.</p><div className="certificate-layout"><Tilt max={5}><div className="certificate">{unlocked && certId ? <CertificateCard name={displayName} courseTitle={course.title} certId={certId} issuedAtMs={issuedAtMs}/> : <CertificateCard name="" courseTitle={course.title} certId="" issuedAtMs={null}/>}</div></Tilt><aside className="certificate-actions">{unlocked ? <><span className="cert-status-badge unlocked"><CheckCircle2/></span><h2>Credential unlocked.</h2><p>Your certificate is ready to save, share, and verify at any time.</p>{certId && <Link className="button light full" to={`/certificates/${certId}`}>View public record</Link>}<button className="button primary full" onClick={download}><Download/> Download certificate</button>{linkedInUrl && <a className="button linkedin-btn full" href={linkedInUrl} target="_blank" rel="noreferrer"><LinkedInIcon/> Add to LinkedIn</a>}<button className="button linkedin-btn full" onClick={postToLinkedIn}>{copied ? <><Check/> Copied — paste on LinkedIn</> : <><LinkedInIcon/> Post on LinkedIn</>}</button>{copied && <p className="linkedin-post-hint">Certificate image downloaded and caption copied. On LinkedIn: start a post, attach the image, then paste your caption.</p>}</> : needsExam ? <><span className="cert-status-badge progress"><GraduationCap/></span><h2>One last test.</h2><p>Score {EXAM_PASS_PERCENT}% or higher on the final exam to unlock this credential. You'll get 30 random questions, 12 seconds each.</p><button className="button primary full" onClick={() => setExamOpen(true)}>Take the final exam</button></> : <><span className="cert-status-badge locked"><Award/></span><h2>Keep going.</h2><p>Complete all lessons in this course to unlock this verifiable credential.</p><div className="certificate-progress"><strong>{progress}%</strong><span>course complete</span></div><Link className="button primary" to={`/academy/${course.slug}`}>Return to course</Link></>}</aside></div>
  {examOpen && course && <ExamModal bank={examBank} onClose={() => setExamOpen(false)} onPass={() => markExamPassed(course.slug)}/>}
 </main>
}

export function VerifyCertificate() {
 const { certId } = useParams()
 const { cert, error } = useCertificate(certId)
 if (cert === undefined && !error) return <main className="verify-page page"><p className="admin-empty">Looking up credential…</p></main>
 if (!cert) return <main className="verify-page page"><div className="verify-shield not-found"><ShieldCheck/><span>NOT FOUND</span></div><span className="kicker">Public credential record</span><h1>Certificate<br/><em>not found.</em></h1><p>We couldn't find a credential with ID <b>{certId}</b>. Check the link and try again.</p><Link to="/academy" className="text-link">Explore Future Creators Academy</Link></main>
 return <main className="verify-page page"><div className="verify-shield"><ShieldCheck/><span>VERIFIED</span></div><span className="kicker">Public credential record</span><h1>Certificate<br/><em>verified.</em></h1><p>This achievement record has been issued by Future Creators Academy and has not been altered.</p>
  <div className="certificate verify-cert"><CertificateCard name={cert.displayName} courseTitle={cert.courseTitle} certId={cert.id} issuedAtMs={cert.issuedAt}/></div>
  <div className="verify-record"><p><span>Learner</span><b>{cert.displayName}</b></p><p><span>Course</span><b>{cert.courseTitle}</b></p><p><span>Completion date</span><b>{formatCertDate(cert.issuedAt)}</b></p><p><span>Verification ID</span><b>{cert.id}</b></p></div>
  <Link to="/academy" className="text-link">Explore Future Creators Academy</Link></main>
}
