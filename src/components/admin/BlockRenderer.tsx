import { useState } from 'react'
import { Check, HelpCircle, Info, RotateCcw, X } from 'lucide-react'
import { Reveal } from '../fx'
import type { ContentBlock } from '../../types'

const alignStyle = (align?: string) => align === 'center' ? { textAlign: 'center' as const, marginInline: 'auto' } : align === 'right' ? { textAlign: 'right' as const, marginLeft: 'auto' } : {}

function toEmbedUrl(url: string) {
 const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{6,})/)
 if (yt) return `https://www.youtube.com/embed/${yt[1]}`
 const vimeo = url.match(/vimeo\.com\/(\d+)/)
 if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
 return null
}

function QuizBlock({ block }: { block: Extract<ContentBlock, { type: 'quiz' }> }) {
 const [selected, setSelected] = useState<number | null>(null)
 const [submitted, setSubmitted] = useState(false)
 const correct = submitted && selected === block.correctIndex
 const wrong = submitted && selected !== null && selected !== block.correctIndex
 const options = block.options.filter((option) => option.trim())
 const retry = () => { setSelected(null); setSubmitted(false) }
 return <div className={`quiz-block ${correct ? 'is-correct' : wrong ? 'is-wrong' : ''}`}>
  <span className="quiz-kicker"><HelpCircle/> Quick check</span>
  <h3 className="quiz-question">{block.question || 'Untitled question'}</h3>
  <div className="quiz-options" role="radiogroup" aria-label={block.question}>{options.map((option, index) => {
   const isCorrectOption = index === block.correctIndex
   const isSelected = selected === index
   const state = submitted ? (isCorrectOption ? 'correct' : isSelected ? 'incorrect' : '') : isSelected ? 'selected' : ''
   return <button key={index} className={`quiz-option ${state}`} disabled={submitted} onClick={() => setSelected(index)} role="radio" aria-checked={isSelected}>
    <span className="quiz-option-mark">{submitted && isCorrectOption ? <Check/> : submitted && isSelected ? <X/> : String.fromCharCode(65 + index)}</span>
    <span>{option}</span>
   </button>
  })}</div>
  {!submitted ? <button className="button primary quiz-submit" onClick={() => setSubmitted(true)} disabled={selected === null}>Check answer</button> : <div className="quiz-result">
   <p className={correct ? 'feedback success' : 'feedback error'}>{correct ? 'Correct — nice work.' : `Not quite. The right answer is “${options[block.correctIndex]}.”`}</p>
   {block.explanation && <p className="quiz-explanation">{block.explanation}</p>}
   {!correct && <button className="button ghost sm quiz-retry" onClick={retry}><RotateCcw/> Try again</button>}
  </div>}
 </div>
}

export function RenderBlock({ block }: { block: ContentBlock }) {
 switch (block.type) {
  case 'heading': {
   const Tag = block.level === 3 ? 'h3' : 'h2'
   return <Tag style={alignStyle(block.align)}>{block.text || 'Untitled heading'}</Tag>
  }
  case 'paragraph':
   return <p style={alignStyle(block.align)}>{block.text}</p>
  case 'image':
   return <figure className="block-media" style={{ maxWidth: block.align === 'center' ? '100%' : '80%', ...alignStyle(block.align) }}>{block.url ? <img src={block.url} alt={block.caption ?? ''} loading="lazy"/> : <div className="block-media-empty">Add an image URL</div>}{block.caption && <figcaption>{block.caption}</figcaption>}</figure>
  case 'video': {
   const embed = block.url ? toEmbedUrl(block.url) : null
   return <figure className="block-media" style={{ maxWidth: block.align === 'center' ? '100%' : '80%', ...alignStyle(block.align) }}>{!block.url ? <div className="block-media-empty">Add a video URL</div> : embed ? <iframe src={embed} title={block.caption ?? 'Lesson video'} allowFullScreen/> : <video src={block.url} controls/>}{block.caption && <figcaption>{block.caption}</figcaption>}</figure>
  }
  case 'callout':
   return <aside className="callout"><Info/><p><b>{block.title || 'Note'}.</b> {block.body}</p></aside>
  case 'quiz':
   return <QuizBlock block={block}/>
  default:
   return null
 }
}

export function RenderBlocks({ blocks }: { blocks: ContentBlock[] }) {
 return <>{blocks.map((block, index) => <Reveal delay={Math.min(index, 4) * 40} key={block.id}><section className={`prose block-wrap ${block.type === 'quiz' ? 'block-wrap-quiz' : ''}`}>{RenderBlock({ block })}</section></Reveal>)}</>
}
