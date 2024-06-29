import { getSvgPathFromStroke, distance } from "./Utils";
import { getStroke } from "perfect-freehand";



//? Encargado de la creacion de elementos con rough y FreeHAND
export const DrawElement = (rough, element, ctx) => {
    const {roughtElement, x1, y1, type, text, points, options} = element

       if(type === "line"){
           rough.draw(roughtElement)
       } else if (type === "rect") {
           rough.draw(roughtElement)
       } else if(type === "pencil") {
            const fillStyle = options ? options.fill : "#000000"
            const line = getStroke(points, options);
            const stroke = getSvgPathFromStroke(line);
            if(options.hasFill === true){  
                ctx.fillStyle = fillStyle             
                ctx.fill(new Path2D(stroke));        
            } else {
                ctx.strokeStyle = options.stroke;
                ctx.lineWidth = options.strokeWidth;
                ctx.stroke(new Path2D(stroke));
            }
       } else if(type === "elipse"){
            rough.draw(roughtElement)
       } else if(type === "text"){
            let val = options.fontSize >= 15 ? 1.2 : 1.4
            ctx.fillStyle = options.fontColor;
            ctx.font = `${options.fontDecoration} ${options.fontSize}px ${options.fontFamily}`
            ctx.fillText(text, x1, y1 + options.fontSize / val)

            if(options.fontUnderline){
                let anchoTexto = ctx.measureText(text).width;
                ctx.lineWidth = 1
                ctx.strokeStyle = options.fontColor
                ctx.beginPath();
                ctx.moveTo(x1, (y1 + options.fontSize) - 1 ); // 5 pixeles debajo del texto
                ctx.lineTo(x1 + anchoTexto, (y1 + options.fontSize) - 1 );
                ctx.stroke();
            }
       }
        else {
            throw new Error(`The type is not recognised:  ${type}`)
       }
}


//? Revisar si el tipo esta dentro del array
export const CheckAdjustElement = (type) => {
    const arr = ["rect", "line", "circle"]
    if ( arr.includes(type)){
        return true
    }
}

//? Funcion encargada de la verificacion de los guntos de corte de las lineas o dibujos a lapiz
export const onLine = (x1, y1, x2, y2, x, y, maxOffset = 1) => {
    const a = {x: x1, y: y1};
    const b = {x: x2, y: y2};
    const c = {x, y};
    const offSet = distance(a, b) - (distance(a, c) + distance(b, c));
    return Math.abs(offSet) < maxOffset ? "inside" : null;
}