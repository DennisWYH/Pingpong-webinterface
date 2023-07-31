// https://stackoverflow.com/a/9744576
export function padNumber(number: number, padLen: number, padChar: string = '0') {
  padChar = typeof padChar !== 'undefined' ? padChar : '0'

  const pad = new Array(1 + padLen).join(padChar)
  return (pad + number).slice(-pad.length)
}
