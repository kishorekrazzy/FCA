import type { Course } from '../types'

export const courses: Course[] = []

export const getCourse = (slug?: string) => courses.find((course) => course.slug === slug)
