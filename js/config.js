window.MOSS = window.MOSS || {};

MOSS.CONFIG = {
  presets: {
    easy:   { cols: 9,  rows: 9,  mines: 10, label: 'Fácil'   },
    medium: { cols: 16, rows: 12, mines: 30, label: 'Médio'   },
    hard:   { cols: 20, rows: 15, mines: 60, label: 'Difícil' }
  },
  custom: {
    minCols: 5,  maxCols: 40,
    minRows: 5,  maxRows: 30,
    minMines: 1, maxMines: 500,
    safeRatio: 0.25   // minas <= 25% das células
  },
  defaults: { preset: 'easy' }
};