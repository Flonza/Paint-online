export const  getSvgPathFromStroke = stroke => {
    if (!stroke.length) return ""
  
    const d = stroke.reduce(
      (acc, [x0, y0], i, arr) => {
        const [x1, y1] = arr[(i + 1) % arr.length]
        acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2)
        return acc
      },
      ["M", ...stroke[0], "Q"]
    )
  
    d.push("Z")
    return d.join(" ")
  }
  

//* Ecuacion de euclides para hallar la distancia entre 2 puntos del plano carteciano.
export const distance = (a, b) => { return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))}