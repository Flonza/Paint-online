import { useEffect, useState } from "react"
import { OptionsTypes } from "../constants/options-svg"

export function FillMenu({ SendFill, TypeActive }) {
    const [fillType, setFill] = useState("solid")

    const handledChangeInput = (val) => {
        setFill(val)
        SendFill(val)
    }

    const SendData = (val) => {
        SendFill(val)
    }

    useEffect(() => {
        if(TypeActive) {
            handledChangeInput(TypeActive)
        }
    }, [])
    

    return (
        <>
            <div className="mt-2">
                <ul className="flex gap-2">
                    <li>
                        <input type="radio" id="full" className="w-4 h-4 hidden peer"
                        onChange={() => handledChangeInput("solid")}
                        checked={fillType === "solid"}
                        onClick={ () => SendData("solid") }
                        />
                        <label htmlFor="full" className={`text-gray-600 border-black inline-flex items-center cursor-pointer  
                            peer-checked:border-2 peer-checked:rounded-md
                            hover:scale-[110%] duration-75`}>
                        { OptionsTypes.full }
                        </label>
                    </li>
                    <li>
                        <input type="radio" id="zig-zag" className="w-4 h-4 hidden peer"
                        onChange={() => handledChangeInput("zigzag")}
                        checked={fillType === "zigzag"} 
                        onClick={ () => SendData("zigzag") }
                        />
                        <label htmlFor="zig-zag" className={`text-gray-600 border-black inline-flex items-center cursor-pointer  
                            peer-checked:border-2 peer-checked:rounded-md
                            hover:scale-[110%] duration-75`}>
                        { OptionsTypes.zigzag }
                        </label>
                    </li>
                    <li>
                        <input type="radio" id="dots" className="w-4 h-4 hidden peer"
                        onChange={() => handledChangeInput("dots")}
                        checked={fillType === "dots"}
                        onClick={ () => SendData("dots") }
                        />
                        <label htmlFor="dots" className={`text-gray-600 border-black inline-flex items-center cursor-pointer  
                            peer-checked:border-2 peer-checked:rounded-md
                            hover:scale-[110%] duration-75`}>
                        { OptionsTypes.dots }
                        </label>
                    </li>
                    <li>
                        <input type="radio" id="crossed" className="w-4 h-4 hidden peer"
                        onChange={() => handledChangeInput("cross-hatch")}
                        checked={fillType === "cross-hatch"}
                        onClick={ () => SendData("cross-hatch") }
                        />
                        <label htmlFor="crossed" className={`text-gray-600 border-black inline-flex items-center cursor-pointer  
                            peer-checked:border-2 peer-checked:rounded-md
                            hover:scale-[110%] duration-75`}>
                        { OptionsTypes.crossed }
                        </label>
                    </li>
                </ul>
            </div>
        </>
    )
}