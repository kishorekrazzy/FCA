export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced'
export type Align = 'left' | 'center' | 'right'

export interface Drill {
  prompt: string
  placeholder: string
  accepted: string[]
  hint: string
}

export type ContentBlock =
  | { id: string; type: 'heading'; text: string; level?: 2 | 3; align?: Align }
  | { id: string; type: 'paragraph'; text: string; align?: Align }
  | { id: string; type: 'image'; url: string; caption?: string; align?: Align }
  | { id: string; type: 'video'; url: string; caption?: string; align?: Align }
  | { id: string; type: 'callout'; title: string; body: string }
  | { id: string; type: 'quiz'; question: string; options: string[]; correctIndex: number; explanation?: string }

export interface Lesson {
  slug: string
  title: string
  duration: string
  xp: number
  type?: 'standard' | 'test' | 'capstone'
  eyebrow: string
  lead: string
  sections: { title: string; body: string }[]
  blocks?: ContentBlock[]
  thumbnail?: string
  callout?: { title: string; body: string }
  table?: { title: string; headers: string[]; rows: string[][] }
  drill?: Drill
}

export interface Module {
  title: string
  lessons: Lesson[]
}

export interface Course {
  slug: string
  title: string
  subtitle: string
  description: string
  category: string
  difficulty: Difficulty
  duration: string
  modules: Module[]
  skills: string[]
  tools: string[]
  models?: string[]
  color: string
  art: string
  tagline?: string
  thumbnail?: string
  featured?: boolean
  status?: 'draft' | 'published'
  updatedAt?: number
}

export const allLessons = (course: Course) => course.modules.flatMap((module) => module.lessons)

export const emptyCourse = (): Course => ({
  slug: '', title: '', subtitle: '', description: '', category: 'Foundations', difficulty: 'Beginner', duration: '1h 00m',
  modules: [], skills: [], tools: [], models: [], color: '#6871FA', art: 'orbit', tagline: '', featured: false, status: 'draft',
})

export const emptyLesson = (): Lesson => ({
  slug: '', title: '', duration: '10 min', xp: 20, type: 'standard', eyebrow: '', lead: '', sections: [], blocks: [],
})

export const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
