import { useState } from 'react'
import { AlignCenter, AlignLeft, AlignRight, GripVertical, Heading, HelpCircle, Image, MessageSquareQuote, Pilcrow, Plus, Trash2, Video, ChevronUp, ChevronDown } from 'lucide-react'
import type { Align, ContentBlock } from '../../types'
import { RenderBlock } from './BlockRenderer'

const newId = () => `blk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

const blank = (type: ContentBlock['type']): ContentBlock => {
 switch (type) {
  case 'heading': return { id: newId(), type: 'heading', text: '', level: 2, align: 'left' }
  case 'paragraph': return { id: newId(), type: 'paragraph', text: '', align: 'left' }
  case 'image': return { id: newId(), type: 'image', url: '', caption: '', align: 'center' }
  case 'video': return { id: newId(), type: 'video', url: '', caption: '', align: 'center' }
  case 'callout': return { id: newId(), type: 'callout', title: '', body: '' }
  case 'quiz': return { id: newId(), type: 'quiz', question: '', options: ['', ''], correctIndex: 0, explanation: '' }
 }
}

const typeIcon: Record<ContentBlock['type'], React.ReactNode> = { heading: <Heading/>, paragraph: <Pilcrow/>, image: <Image/>, video: <Video/>, callout: <MessageSquareQuote/>, quiz: <HelpCircle/> }
const typeLabel: Record<ContentBlock['type'], string> = { heading: 'Heading', paragraph: 'Paragraph', image: 'Image URL', video: 'Video URL', callout: 'Callout', quiz: 'Quiz' }

export function BlockEditor({ blocks, onChange }: { blocks: ContentBlock[]; onChange: (blocks: ContentBlock[]) => void }) {
 const [dragIndex, setDragIndex] = useState<number | null>(null)
 const add = (type: ContentBlock['type']) => onChange([...blocks, blank(type)])
 const update = (id: string, patch: Partial<ContentBlock>) => onChange(blocks.map((block) => block.id === id ? { ...block, ...patch } as ContentBlock : block))
 const remove = (id: string) => onChange(blocks.filter((block) => block.id !== id))
 const move = (index: number, dir: -1 | 1) => { const target = index + dir; if (target < 0 || target >= blocks.length) return; const next = [...blocks]; [next[index], next[target]] = [next[target], next[index]]; onChange(next) }
 const drop = (index: number) => { if (dragIndex === null || dragIndex === index) return; const next = [...blocks]; const [moved] = next.splice(dragIndex, 1); next.splice(index, 0, moved); onChange(next); setDragIndex(null) }

 const setQuizOption = (block: Extract<ContentBlock, { type: 'quiz' }>, index: number, value: string) => { const options = [...block.options]; options[index] = value; update(block.id, { options }) }
 const addQuizOption = (block: Extract<ContentBlock, { type: 'quiz' }>) => update(block.id, { options: [...block.options, ''] })
 const removeQuizOption = (block: Extract<ContentBlock, { type: 'quiz' }>, index: number) => { const options = block.options.filter((_, itemIndex) => itemIndex !== index); const correctIndex = block.correctIndex === index ? 0 : block.correctIndex > index ? block.correctIndex - 1 : block.correctIndex; update(block.id, { options, correctIndex }) }

 return <div className="block-editor">
  <div className="block-toolbar"><span>Add block:</span>{(['heading', 'paragraph', 'image', 'video', 'quiz', 'callout'] as const).map((type) => <button key={type} onClick={() => add(type)}>{typeIcon[type]} {typeLabel[type]}</button>)}</div>
  {!blocks.length && <p className="block-empty">No content blocks yet. Add a heading first, then image, video, or quiz blocks, in the order you want them to appear.</p>}
  <div className="block-list">{blocks.map((block, index) => <div className={`block-row ${dragIndex === index ? 'dragging' : ''}`} key={block.id} draggable onDragStart={() => setDragIndex(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => drop(index)}>
   <div className="block-row-head"><span className="block-drag" aria-hidden="true"><GripVertical/></span><span className="block-type">{typeIcon[block.type]} {typeLabel[block.type]}</span>
    {(block.type === 'heading' || block.type === 'paragraph' || block.type === 'image' || block.type === 'video') && <div className="align-group">{(['left', 'center', 'right'] as Align[]).map((align) => <button key={align} className={block.align === align || (!block.align && align === 'left') ? 'on' : ''} onClick={() => update(block.id, { align })} aria-label={`Align ${align}`}>{align === 'left' ? <AlignLeft/> : align === 'center' ? <AlignCenter/> : <AlignRight/>}</button>)}</div>}
    <div className="block-order"><button onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up"><ChevronUp/></button><button onClick={() => move(index, 1)} disabled={index === blocks.length - 1} aria-label="Move down"><ChevronDown/></button></div>
    <button className="block-delete" onClick={() => remove(block.id)} aria-label="Delete block"><Trash2/></button>
   </div>
   <div className="block-row-body">
    {block.type === 'heading' && <><input value={block.text} onChange={(event) => update(block.id, { text: event.target.value })} placeholder="Heading text"/><select value={block.level ?? 2} onChange={(event) => update(block.id, { level: Number(event.target.value) as 2 | 3 })}><option value={2}>Large</option><option value={3}>Small</option></select></>}
    {block.type === 'paragraph' && <textarea value={block.text} onChange={(event) => update(block.id, { text: event.target.value })} placeholder="Paragraph text" rows={3}/>}
    {block.type === 'image' && <><input value={block.url} onChange={(event) => update(block.id, { url: event.target.value })} placeholder="https://images.example.com/photo.jpg"/><input value={block.caption ?? ''} onChange={(event) => update(block.id, { caption: event.target.value })} placeholder="Caption (optional)"/></>}
    {block.type === 'video' && <><input value={block.url} onChange={(event) => update(block.id, { url: event.target.value })} placeholder="YouTube, Vimeo, or direct .mp4 URL"/><input value={block.caption ?? ''} onChange={(event) => update(block.id, { caption: event.target.value })} placeholder="Caption (optional)"/></>}
    {block.type === 'callout' && <><input value={block.title} onChange={(event) => update(block.id, { title: event.target.value })} placeholder="Callout title"/><textarea value={block.body} onChange={(event) => update(block.id, { body: event.target.value })} placeholder="Callout body" rows={2}/></>}
    {block.type === 'quiz' && <div className="quiz-editor">
     <input value={block.question} onChange={(event) => update(block.id, { question: event.target.value })} placeholder="Question — e.g. What does a feedback loop describe?"/>
     <p className="quiz-editor-hint">Mark the correct option. Learners see these in the order listed.</p>
     <div className="quiz-editor-options">{block.options.map((option, optionIndex) => <div className="quiz-editor-option" key={optionIndex}>
      <button type="button" className={`quiz-correct-toggle ${block.correctIndex === optionIndex ? 'on' : ''}`} onClick={() => update(block.id, { correctIndex: optionIndex })} aria-label={`Mark option ${optionIndex + 1} as correct`}>{block.correctIndex === optionIndex ? '✓' : ''}</button>
      <input value={option} onChange={(event) => setQuizOption(block, optionIndex, event.target.value)} placeholder={`Option ${optionIndex + 1}`}/>
      <button type="button" className="block-delete" onClick={() => removeQuizOption(block, optionIndex)} disabled={block.options.length <= 2} aria-label="Remove option"><Trash2/></button>
     </div>)}</div>
     <button type="button" className="button ghost sm" onClick={() => addQuizOption(block)}><Plus/> Add option</button>
     <textarea value={block.explanation ?? ''} onChange={(event) => update(block.id, { explanation: event.target.value })} placeholder="Explanation shown after answering (optional)" rows={2}/>
    </div>}
   </div>
   <div className="block-preview">{RenderBlock({ block })}</div>
  </div>)}</div>
 </div>
}
