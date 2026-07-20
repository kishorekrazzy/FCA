import { courses as seedCourses } from './courses'
import { useCatalogStore } from '../store/catalog-store'
import type { Course } from '../types'

export function mergeCourses(remote: Course[], hidden: string[], order: string[]): Course[] {
  const map = new Map<string, Course>(seedCourses.filter((course) => !hidden.includes(course.slug)).map((course) => [course.slug, course]))
  for (const course of remote) map.set(course.slug, course)
  let list = [...map.values()]
  if (order.length) {
    const rank = new Map(order.map((slug, index) => [slug, index]))
    list = list.sort((a, b) => (rank.get(a.slug) ?? 999) - (rank.get(b.slug) ?? 999))
  }
  return list
}

export function getMergedCourses(): Course[] {
  const state = useCatalogStore.getState()
  return mergeCourses(state.remoteCourses, state.hiddenSeeds, state.courseOrder)
}

export function getPublishedCourses(): Course[] {
  return getMergedCourses().filter((course) => course.status !== 'draft')
}

export function useCourses(): Course[] {
  const remote = useCatalogStore((state) => state.remoteCourses)
  const hidden = useCatalogStore((state) => state.hiddenSeeds)
  const order = useCatalogStore((state) => state.courseOrder)
  return mergeCourses(remote, hidden, order).filter((course) => course.status !== 'draft')
}

export function useAllCoursesAdmin(): Course[] {
  const remote = useCatalogStore((state) => state.remoteCourses)
  const hidden = useCatalogStore((state) => state.hiddenSeeds)
  const order = useCatalogStore((state) => state.courseOrder)
  return mergeCourses(remote, hidden, order)
}

export function useCourseBySlug(slug?: string, admin = false): Course | undefined {
  const remote = useCatalogStore((state) => state.remoteCourses)
  const hidden = useCatalogStore((state) => state.hiddenSeeds)
  const order = useCatalogStore((state) => state.courseOrder)
  const list = mergeCourses(remote, hidden, order)
  const filtered = admin ? list : list.filter((course) => course.status !== 'draft')
  return filtered.find((course) => course.slug === slug)
}

export function useCatalogSynced(): boolean {
  return useCatalogStore((state) => state.synced)
}

export const isSeedCourse = (slug: string) => seedCourses.some((course) => course.slug === slug)
