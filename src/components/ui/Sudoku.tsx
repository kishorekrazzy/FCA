import { useEffect, useMemo, useRef, useState } from 'react'
import { Delete, RotateCcw, X } from 'lucide-react'
import { conflictCells, dailySudoku, isSolved, type Grid } from '../../lib/sudoku'
import { ConfettiBurst } from '../fx'
import { dateKey } from '../../store/academy-store'

const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

export function SudokuBoard({ xpReward, alreadySolvedToday, onWin, onClose }: { xpReward: number; alreadySolvedToday: boolean; onWin: () => void; onClose: () => void }) {
 const { puzzle, solution } = useMemo(() => dailySudoku(dateKey()), [])
 const [board, setBoard] = useState<Grid>(() => puzzle.map((row) => [...row]))
 const [selected, setSelected] = useState<{ row: number; col: number } | null>(null)
 const [elapsed, setElapsed] = useState(0)
 const [won, setWon] = useState(false)
 const [confetti, setConfetti] = useState(0)
 const timerRef = useRef<number | null>(null)

 useEffect(() => {
  timerRef.current = window.setInterval(() => setElapsed((value) => value + 1), 1000)
  return () => { if (timerRef.current) window.clearInterval(timerRef.current) }
 }, [])

 const given = (row: number, col: number) => puzzle[row][col] !== 0
 const conflicts = useMemo(() => conflictCells(board), [board])

 const place = (value: number) => {
  if (!selected || won || given(selected.row, selected.col)) return
  const next = board.map((row) => [...row])
  next[selected.row][selected.col] = value
  setBoard(next)
  if (isSolved(next, solution)) {
   setWon(true)
   if (timerRef.current) window.clearInterval(timerRef.current)
   setConfetti(Date.now())
   onWin()
  }
 }

 const erase = () => { if (!selected || won || given(selected.row, selected.col)) return; const next = board.map((row) => [...row]); next[selected.row][selected.col] = 0; setBoard(next) }
 const reset = () => { setBoard(puzzle.map((row) => [...row])); setSelected(null) }

 return <div className="sudoku-panel">
  <ConfettiBurst trigger={confetti}/>
  <div className="sudoku-panel-head">
   <div><h3>Daily Sudoku</h3><span className="sudoku-timer">{formatTime(elapsed)}</span></div>
   <button className="sudoku-close" onClick={onClose} aria-label="Close puzzle"><X size={16}/></button>
  </div>

  {won ? <div className="sudoku-win">
   <span className="sudoku-win-badge">✦ Solved!</span>
   <p>{formatTime(elapsed)} — {alreadySolvedToday ? 'already claimed today, come back tomorrow for more IQ' : `+${xpReward} IQ earned`}</p>
   <button className="button primary sm" onClick={onClose}>Done</button>
  </div> : <>
   <div className="sudoku-grid" role="grid">
    {board.map((row, r) => row.map((value, c) => {
     const isGiven = given(r, c)
     const isSelected = selected?.row === r && selected?.col === c
     const conflict = conflicts.has(`${r}-${c}`)
     return <button key={`${r}-${c}`} className={`sudoku-cell ${isGiven ? 'given' : ''} ${isSelected ? 'selected' : ''} ${conflict ? 'conflict' : ''} r${r} c${c}`} onClick={() => setSelected({ row: r, col: c })} disabled={isGiven}>{value || ''}</button>
    }))}
   </div>
   <div className="sudoku-pad">
    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => <button key={n} onClick={() => place(n)}>{n}</button>)}
    <button aria-label="Erase" onClick={erase}><Delete size={15}/></button>
   </div>
   <button className="sudoku-reset" onClick={reset}><RotateCcw size={13}/> Start over</button>
  </>}
 </div>
}
