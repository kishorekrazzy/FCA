// Deterministic daily Sudoku: every learner gets the exact same puzzle on a given
// calendar date, generated from a seeded PRNG rather than stored anywhere.
export type Grid = number[][]

function mulberry32(seed: number) {
  return function random() {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashString(value: string) {
  let hash = 0
  for (let i = 0; i < value.length; i++) { hash = (hash << 5) - hash + value.charCodeAt(i); hash |= 0 }
  return hash
}

function shuffled<T>(items: T[], random: () => number): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1));[copy[i], copy[j]] = [copy[j], copy[i]] }
  return copy
}

function isSafe(grid: Grid, row: number, col: number, value: number): boolean {
  for (let i = 0; i < 9; i++) { if (grid[row][i] === value || grid[i][col] === value) return false }
  const boxRow = row - (row % 3), boxCol = col - (col % 3)
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) if (grid[boxRow + r][boxCol + c] === value) return false
  return true
}

function fill(grid: Grid, random: () => number): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] !== 0) continue
      for (const value of shuffled([1, 2, 3, 4, 5, 6, 7, 8, 9], random)) {
        if (isSafe(grid, row, col, value)) {
          grid[row][col] = value
          if (fill(grid, random)) return true
          grid[row][col] = 0
        }
      }
      return false
    }
  }
  return true
}

function solvedGrid(random: () => number): Grid {
  const grid: Grid = Array.from({ length: 9 }, () => Array(9).fill(0))
  fill(grid, random)
  return grid
}

const GIVENS = 34

export type DailyPuzzle = { date: string; puzzle: Grid; solution: Grid }

export function dailySudoku(date: string): DailyPuzzle {
  const random = mulberry32(hashString(`fca-sudoku-${date}`))
  const solution = solvedGrid(random)
  const puzzle = solution.map((row) => [...row])
  let toClear = 81 - GIVENS
  for (const cell of shuffled(Array.from({ length: 81 }, (_, i) => i), random)) {
    if (toClear <= 0) break
    puzzle[Math.floor(cell / 9)][cell % 9] = 0
    toClear--
  }
  return { date, puzzle, solution }
}

/** Cells that conflict with another filled cell in the same row, column, or 3x3 box. */
export function conflictCells(grid: Grid): Set<string> {
  const conflicts = new Set<string>()
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const value = grid[row][col]
      if (!value) continue
      for (let i = 0; i < 9; i++) {
        if (i !== col && grid[row][i] === value) conflicts.add(`${row}-${col}`)
        if (i !== row && grid[i][col] === value) conflicts.add(`${row}-${col}`)
      }
      const boxRow = row - (row % 3), boxCol = col - (col % 3)
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
        const rr = boxRow + r, cc = boxCol + c
        if ((rr !== row || cc !== col) && grid[rr][cc] === value) conflicts.add(`${row}-${col}`)
      }
    }
  }
  return conflicts
}

export function isSolved(grid: Grid, solution: Grid): boolean {
  for (let row = 0; row < 9; row++) for (let col = 0; col < 9; col++) if (grid[row][col] !== solution[row][col]) return false
  return true
}
