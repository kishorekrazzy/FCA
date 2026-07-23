import type { Book, Course } from '../types'

const courseTemplate: Omit<Course, 'slug'> = {
 title: 'Intro to Prompt Engineering',
 subtitle: 'Ask better, get better answers',
 description: 'A short practical course on writing prompts that get useful, reliable results out of any LLM.',
 category: 'AI & Prompting',
 difficulty: 'Beginner',
 duration: '1h 30m',
 color: '#6871FA',
 art: 'orbit',
 tagline: 'Ask better questions.',
 thumbnail: 'https://images.example.com/course-cover.jpg',
 skills: ['Prompting', 'Clarity', 'Iteration'],
 tools: ['ChatGPT', 'Claude'],
 models: ['GPT-4', 'Claude'],
 featured: false,
 status: 'draft',
 modules: [
  {
   title: 'Module 1 — Foundations',
   lessons: [
    {
     slug: 'why-prompts-matter',
     title: 'Why prompts matter',
     duration: '10 min',
     xp: 20,
     type: 'standard',
     eyebrow: 'Foundations',
     lead: 'One-sentence hook that appears under the lesson title.',
     thumbnail: 'https://images.example.com/lesson-1.jpg',
     sections: [{ title: 'The problem', body: 'Plain-text paragraph body for this section.' }],
     blocks: [
      { id: 'b1', type: 'heading', text: "Let's begin", level: 2 },
      { id: 'b2', type: 'paragraph', text: 'Some explanatory text.' },
      { id: 'b3', type: 'callout', title: 'Tip', body: 'A highlighted callout box.' },
      { id: 'b4', type: 'quiz', question: 'What makes a prompt effective?', options: ['Length', 'Clarity', 'Formality'], correctIndex: 1, explanation: 'Clarity reduces ambiguity for the model.' },
     ],
     drill: { prompt: 'Rewrite this vague prompt to be specific:', placeholder: 'Type your rewrite…', accepted: ['example accepted answer'], hint: 'Add a goal, a format, and a constraint.' },
    },
   ],
  },
 ],
}

const bookTemplate: Omit<Book, 'slug'> = {
 title: 'The Quiet Art of Debugging',
 subtitle: 'Finding bugs without losing your mind',
 description: 'A short, story-driven read on staying calm and systematic when nothing works.',
 category: 'Craft',
 difficulty: 'Beginner',
 duration: '25 min',
 color: '#6871FA',
 tagline: 'Stay calm. Find the bug.',
 thumbnail: 'https://images.example.com/book-cover.jpg',
 skills: ['Debugging', 'Patience', 'Systems thinking'],
 featured: false,
 status: 'draft',
 chapters: [
  {
   slug: 'the-first-clue',
   title: 'The first clue',
   duration: '8 min',
   xp: 15,
   eyebrow: 'Chapter 1',
   lead: 'One-sentence hook shown under the chapter title.',
   thumbnail: 'https://images.example.com/chapter-1.jpg',
   blocks: [
    { id: 'b1', type: 'heading', text: "Something's wrong", level: 2 },
    { id: 'b2', type: 'paragraph', text: 'Plain paragraph text goes here.' },
    { id: 'b3', type: 'image', url: 'https://images.example.com/inline.jpg', caption: 'Optional caption' },
   ],
  },
 ],
}

export const COURSE_JSON_TEMPLATE = JSON.stringify(courseTemplate, null, 2)
export const BOOK_JSON_TEMPLATE = JSON.stringify(bookTemplate, null, 2)
