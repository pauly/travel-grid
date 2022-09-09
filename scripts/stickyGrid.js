#!/usr/bin/env node

const fs = require('fs')
const { svg, svgNote } = require('./stickySVG')
const ticketWidth = 100
const margin = 10
const lineStraightness = 40

const file = process.argv[2]

const byColumn = column => (a, b) => {
  if (a[column] > b[column]) return 1
  if (a[column] < b[column]) return -1
  return 0
}

const toObject = line => {
  const date = new Date(line[0]).toISOString().substr(0, 10)
  if (!date) return false
  return {
    date,
    text: line[1],
    note: line[3],
    score: Number(line[2])
  }
}

const splitTitle = (ticket, index) => {
  const title = ticket.text.match(/(.{1,20}(\s|$))\s*/g).map(line => line.trim())
  return { ...ticket, title }
}

const toGrid = (grid, ticket) => {
  if (!grid[ticket.score]) grid[ticket.score] = []
  grid[ticket.score].push(ticket)
  return grid
}

fs.readFile(file, 'utf8', (err, content) => {
  if (err) throw err
  const notes = []
  const tickets = content.split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => line.split(/\s*\|\s*/))
    .map(toObject)
    .filter(Boolean)
    .map(ticket => {
      if (ticket.note) {
        notes.push(ticket.note)
        ticket.text = `${ticket.text} (${notes.length})`
      }
      return ticket
    })
    .map(splitTitle)

  const grid = Object.values(tickets
    .sort(byColumn('date'))
    .reduce(toGrid, {}))
  const maxCols = Math.max.apply(null, grid.map(rows => rows.length))
  grid.reverse().forEach((row, scoreIndex) => {
    row.forEach((ticket, dateIndex, columns) => {
      ticket.x = (maxCols - dateIndex) * ticketWidth * 0.9
      ticket.y = scoreIndex * ticketWidth * 0.6
    })
  })
  const mappedTickets = grid.flat()
    .reverse()

  const rand = (a, b = 0) => Math.round(Math.random() * a + b)

  const width = Math.max.apply(null, mappedTickets.map(note => note.x)) + ticketWidth + margin
  const height = Math.max.apply(null, mappedTickets.map(note => note.y)) + ticketWidth + (notes.length * 10)
  const yAxis = margin
  let y = height - yAxis
  let x = margin
  const points = [String([x, y])]
  while (y >= lineStraightness) {
    x = Math.round(rand(2, 9))
    y = Math.round(rand(-lineStraightness, y))
    points.push(String([x, y]))
  }
  // arrow head
  points.push(String([x - rand(2, 3), y + rand(2, 8)]))
  points.push(String([x, y]))
  points.push(String([x + rand(2, 3), y + rand(2, 8)]))

  const axes = [
    `<polyline stroke="#ccc" fill="none" points="${points.join(' ')}" />`,
    `<text fill="#ccc" transform="translate(${yAxis - rand(2, 3)}, ${height / 2}) rotate(-90)">adopting</text>`
  ]
  const dangerTicket = mappedTickets.find(ticket => ticket.score < 1)
  const dangerLine = dangerTicket && dangerTicket.y
  if (dangerLine) {
    let x = rand(5, 5)
    const points = [String([x, dangerLine])]
    while (x < width - lineStraightness) {
      x = Math.round(rand(lineStraightness, x))
      y = Math.round(rand(2, dangerLine - 1))
      points.push(String([x, y]))
    }
    axes.push(`<polyline stroke="#fcc" fill="none" points="${points.join(' ')}" />`)
    axes.push(`<text x="${rand(5, margin)}" y="${dangerLine + margin}" fill="#fcc">danger zone</text>`)
  }
  const winningTicket = mappedTickets.find(ticket => ticket.score > 9)
  const winningLine = winningTicket && (winningTicket.y + 100)
  if (winningLine) {
    let x = rand(5, 5)
    const points = [String([x, winningLine])]
    while (x < width - lineStraightness) {
      x = Math.round(rand(lineStraightness, x))
      y = Math.round(rand(2, winningLine - 1))
      points.push(String([x, y]))
    }
    axes.push(`<polyline stroke="#ccf" fill="none" points="${points.join(' ')}" />`)
    axes.push(`<text x="${rand(5, margin)}" y="${winningLine + margin}" fill="#ccf">winning</text>`)
  }
  const output = svg(mappedTickets.map(svgNote), { notes, width, height, axis: axes.join('\n    ') })
  console.log(output)
})
