import { useEffect, useRef, useState } from 'react'
import { SkipForward, X } from 'lucide-react'
import { ConfettiBurst, RadialRing } from '../fx'
import { buildExamRound, EXAM_PASS_PERCENT, EXAM_TIME_PER_QUESTION, type ExamQuestion, type ExamRoundQuestion } from '../../store/exam-store'

type Phase = 'question' | 'feedback' | 'results'

function TimerRing({ timeLeft }: { timeLeft: number }) {
 const size = 56, stroke = 5, radius = (size - stroke) / 2, circumference = 2 * Math.PI * radius
 const pct = timeLeft / EXAM_TIME_PER_QUESTION
 const hue = Math.max(0, Math.round(pct * 120))
 return <div className="exam-timer-ring">
  <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
   <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,.14)" strokeWidth={stroke}/>
   <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={`hsl(${hue},85%,55%)`} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference - pct * circumference} transform={`rotate(-90 ${size / 2} ${size / 2})`}/>
  </svg>
  <span>{Math.ceil(timeLeft)}</span>
 </div>
}

export function ExamModal({ bank, onClose, onPass }: { bank: ExamQuestion[]; onClose: () => void; onPass: () => void }) {
 const [round, setRound] = useState<ExamRoundQuestion[]>(() => buildExamRound(bank))
 const [index, setIndex] = useState(0)
 const [phase, setPhase] = useState<Phase>('question')
 const [selected, setSelected] = useState<number | null>(null)
 const [correctCount, setCorrectCount] = useState(0)
 const [finalScore, setFinalScore] = useState<{ correct: number; total: number } | null>(null)
 const [timeLeft, setTimeLeft] = useState(EXAM_TIME_PER_QUESTION)
 const [confetti, setConfetti] = useState(0)
 const timerRef = useRef<number | undefined>(undefined)

 const current = round[index]
 const total = round.length

 useEffect(() => {
  if (phase !== 'question') return
  const start = Date.now()
  setTimeLeft(EXAM_TIME_PER_QUESTION)
  timerRef.current = window.setInterval(() => {
   const remaining = Math.max(0, EXAM_TIME_PER_QUESTION - (Date.now() - start) / 1000)
   setTimeLeft(remaining)
   if (remaining <= 0) { window.clearInterval(timerRef.current); handleAnswer(null) }
  }, 100)
  return () => window.clearInterval(timerRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [index, phase])

 const handleAnswer = (optionIndex: number | null) => {
  if (phase !== 'question') return
  window.clearInterval(timerRef.current)
  const isCorrect = optionIndex !== null && optionIndex === current.correctIndex
  const runningCorrect = correctCount + (isCorrect ? 1 : 0)
  setSelected(optionIndex)
  if (isCorrect) setCorrectCount(runningCorrect)
  setPhase('feedback')
  window.setTimeout(() => {
   if (index + 1 < total) { setIndex((value) => value + 1); setSelected(null); setPhase('question') }
   else {
    setFinalScore({ correct: runningCorrect, total })
    setPhase('results')
    if (Math.round((runningCorrect / total) * 100) >= EXAM_PASS_PERCENT) { setConfetti(Date.now()); onPass() }
   }
  }, 900)
 }

 const retake = () => {
  setRound(buildExamRound(bank))
  setIndex(0); setPhase('question'); setSelected(null); setCorrectCount(0); setFinalScore(null)
 }

 const danger = phase === 'question' && timeLeft <= 3
 const passed = finalScore ? Math.round((finalScore.correct / finalScore.total) * 100) >= EXAM_PASS_PERCENT : false

 return <div className={`exam-overlay ${danger ? 'exam-danger' : ''}`}>
  <div className="exam-vignette" aria-hidden="true"/>
  <button className="exam-close" onClick={onClose} aria-label="Exit exam"><X/></button>

  {phase !== 'results' && current && <>
   <div className="exam-progress-track"><span style={{ width: `${(index / total) * 100}%` }}/></div>
   <div className="exam-body">
    <div className="exam-meta"><span className="exam-count">Question {index + 1} of {total}</span><TimerRing timeLeft={timeLeft}/></div>
    <h2 className="exam-question">{current.question}</h2>
    {current.imageUrl && <img className="exam-question-image" src={current.imageUrl} alt=""/>}
    <div className="exam-options">{current.options.map((option, optionIndex) => {
     const isCorrectOption = optionIndex === current.correctIndex
     const isPicked = selected === optionIndex
     const revealed = phase === 'feedback'
     return <button key={optionIndex} className={`exam-option ${revealed && isCorrectOption ? 'correct' : ''} ${revealed && isPicked && !isCorrectOption ? 'incorrect' : ''}`} onClick={() => handleAnswer(optionIndex)} disabled={phase === 'feedback'}>
      <span className="exam-option-letter">{String.fromCharCode(65 + optionIndex)}</span>{option}
     </button>
    })}</div>
    <button className="exam-skip" onClick={() => handleAnswer(null)} disabled={phase === 'feedback'}><SkipForward size={14}/> Skip question</button>
   </div>
  </>}

  {phase === 'results' && finalScore && <div className="exam-results">
   <RadialRing percent={Math.round((finalScore.correct / finalScore.total) * 100)} size={160} stroke={12} color={passed ? '#22C55E' : '#EF4444'} label={`${Math.round((finalScore.correct / finalScore.total) * 100)}%`}/>
   <h2>{passed ? 'You passed!' : 'Not quite there.'}</h2>
   <p>{finalScore.correct} of {finalScore.total} correct — you need {EXAM_PASS_PERCENT}% to unlock your certificate.</p>
   {passed ? <button className="button gold-button lg" onClick={onClose}>View my certificate</button> : <div className="exam-results-actions"><button className="button primary lg" onClick={retake}>Retake the exam</button><button className="button ghost" onClick={onClose}>Exit for now</button></div>}
  </div>}

  <ConfettiBurst trigger={confetti}/>
 </div>
}
