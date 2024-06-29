import { useEffect, useState } from "react";
import { OptionsTypes } from "../constants/options-svg";


export const OptionsText = ({ DecorationActive, Decoration }) => {
    const [textDecoration, setTextDecoration] = useState({
        bold: false,
        italic: false, 
        underline: false
    })

    const sendDecoration = (data) => {
        let decoracion = []
    
        if(data.bold === true) {
            decoracion.push("bold");
        }
        if (data.italic === true) {
            decoracion.push("italic");
        }
        if (data.underline) {
            decoracion.push("underline");
        }        
        Decoration(decoracion)
    }

    const handledChangeInput = (data) => {
        if (data === "bold" || data == "italic" || data === "underline") {
            setTextDecoration(prevState => {
                const newState = { ...prevState, [data]: !prevState[data] };
                sendDecoration(newState);
                return newState;
            });
        } else {
            return;
        }
    }

    useEffect(() => {
        if(DecorationActive && DecorationActive.length > 0){
            DecorationActive.forEach(element => {
                handledChangeInput(element)
            });
        }
    }, [])

    // TODO crear la funcion para el subrayado y por ultimo acomodar las coordenadas del textarea
    

    return (
        <>
            <div className="w-full my-2">
                <ul className="flex justify-around items-center">
                    <li>
                        <input type="checkbox" id="negrita" className="hidden peer w-5 h-5" 
                            onChange={() => handledChangeInput('bold')}
                            checked={textDecoration.bold === true}
                        />
                        <label htmlFor="negrita" className="inline-flex items-center justify-center 
                        w-full p-1 bg-white border border-gray-800 rounded-lg cursor-pointer 
                        hover:text-gray-300  peer-checked:border-black peer-checked:bg-slate-300
                        peer-checked:text-black hover:bg-gray-100 duration-100">
                            { OptionsTypes.bold }
                        </label>
                    </li>
                    <li>
                        <input type="checkbox" id="italic" className="hidden peer" 
                        onChange={() => handledChangeInput('italic')}
                        checked={textDecoration.italic === true}/>
                        <label htmlFor="italic" className="inline-flex items-center justify-center 
                        w-full p-0.5 bg-white border border-gray-800 rounded-lg cursor-pointer 
                        hover:text-gray-300  peer-checked:border-black peer-checked:bg-slate-300
                        peer-checked:text-black hover:bg-gray-100 duration-100">
                            { OptionsTypes.italic }
                        </label>
                    </li>
                    <li>
                        <input type="checkbox" id="underline" className="hidden peer" 
                        onChange={() => handledChangeInput('underline')}
                        checked={textDecoration.underline === true}/>
                        <label htmlFor="underline" className="inline-flex items-center justify-center 
                        w-full p-1 bg-white border border-gray-800 rounded-lg cursor-pointer 
                        hover:text-gray-300  peer-checked:border-black peer-checked:bg-slate-300
                        peer-checked:text-black hover:bg-gray-100 duration-100">
                            { OptionsTypes.underline }
                        </label>
                    </li>
                </ul>
            </div>
        </>
    )
}