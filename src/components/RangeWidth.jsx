import { useEffect, useState } from "react"
import "./Components.css"

export function RangeWidth({ SendWidth, WidthActive, Range }) {

    const [value, setValue] = useState(1) 
    const handledChangeValue = (event) => {
        const newValue = event.target.value;
        setValue(newValue)
        sendValue(value)
    }

    const sendValue = (data) => {
        SendWidth(data)
    }

    useEffect(() => {
        if(WidthActive) {
            setValue(WidthActive)
        }
    }, [])

    return ( 
        <input id="default-range" type="range" value={value} min={-0.5} max={Range} onChange={handledChangeValue} step={0.5}
        className="w-full h-2 bg-[#d8dcd8] rounded-lg appearance-none cursor-pointer range sombra-input" /> 
    )
}