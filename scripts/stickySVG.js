const randomness = 6

const rand = exports.rand = (a, b = 0) => Math.round(Math.random() * a + b)

exports.wobblyLine = ({ from: [x, y], to, label, color = '#ccc', lineStraightness = 30, margin = 10 }) => {
  const points = [String([x, y])]
  while (x < to[0] - lineStraightness) {
    x = Math.round(rand(lineStraightness, x))
    y = Math.round(rand(2, to[1] - 1))
   points.push(String([x, y]))
  }
  return `<polyline stroke="${color}" fill="none" points="${points.join(' ')}" />
    <text x="${rand(5, margin)}" y="${y + margin}" fill="${color}">${label}</text>`
}

const lineOfText = exports.lineOfText = startingY => (line, index) => {
  return `<text x="20" y="${index * 10 + startingY}">${line.replace(/&/, '&amp;')}</text>`
}

const extraNote = exports.extraNote = (height, notes) => (line, index) => {
  const y = height - (notes.length - index) * 10
  return `<text x="20" y="${y}">${index + 1}. ${line.replace(/&/, '&amp;')}</text>`
}

exports.svgNote = note => {
  const randX = Math.round(Math.random() * randomness) - randomness
  const randY = Math.round(Math.random() * randomness) - randomness
  const rotation = (Math.random() * randomness - randomness / 2).toFixed(1)
  return `<svg x="${note.x}" y="${note.y}">
      <g transform="translate(${randX} ${randY}) rotate(${rotation} 50 50)">
        <use href="#note" transform="scale(0.3 0.3)" />
        ${note.id ? `<text font-weight="bold" x="20" y="45">
          ${note.id || ''} ${note.mappedStatus || note.status || ''}
        </text>` : ''}
        ${note.title.map(lineOfText(60)).join('\n        ')}
      </g>
    </svg>`
}

exports.svg = (stickies, { notes, width = 400, height = 400, axis = '' }) => {
  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" version="1.0">
  <defs>
    <filter id="drop-shadow">
      <feGaussianBlur id="feGaussianBlur4783" stdDeviation="5.4601647"/>
    </filter>
    <linearGradient id="linearGradient2">
      <stop style="stop-color:#f7ec9a" offset="0"/>
      <stop style="stop-color:#f6ea8d" offset=".13401"/>
      <stop style="stop-color:#f5e98a" offset=".45674"/>
      <stop style="stop-color:#f8ed9d" offset=".80934"/>
      <stop style="stop-color:#f5e98a" offset="1"/>
    </linearGradient>
    <g id="note">
      <path style="opacity:.5;filter:url(#drop-shadow);fill:#000000" d="m111.75 670.22l291.37-1.42 5.86 284.29s-228.99-3.84-306.48-0.73c7.35-70.31 9.25-282.14 9.25-282.14z" transform="matrix(1.0231 .0042596 -.0043582 .99999 -61.966 -626.72)"/>
      <path style="fill:url(#linearGradient2)" d="m46.41 37.51l304.28 1.297-1.21 284.28s-262.56 5.77-298.49-15.56c-7.501-36.06-4.58-270.02-4.58-270.02z"/>
    </g>
  </defs>
  <g font-family="Arial, Helvetica, sans-serif" font-size="8">
    ${axis}
    ${notes.map(extraNote(height, notes)).join('\n    ')}
    ${stickies.join('\n    ')}
  </g>
</svg>`
}
