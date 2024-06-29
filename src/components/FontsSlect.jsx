import { useEffect, useState } from "react";
import { OptionsTypes } from "../constants/options-svg";

const fontOptions = [
    { id: 1 , value: "Arial", label: "Arial", className: "font-[Arial]" },
    { id: 2 , value: "Verdana", label: "Verdana", className: "font-[Verdana]" },
    { id: 3 , value: "Georgia", label: "Georgia", className: "font-[Georgia]" },
    { id: 4 , value: "Times New Roman", label: "Times New Roman", className: "font-[Times]" },
    { id: 5 , value: "Courier New", label: "Courier New", className: "font-[Courier]" },
    { id: 6 , value: "Lucida Sans Unicode", label: "Lucida Sans Unicode", className: "font-[Lucida]" },
    { id: 7 , value: "Tahoma", label: "Tahoma", className: "font-[Tahoma]" },
    { id: 8 , value: "Trebuchet MS", label: "Trebuchet MS", className: "font-[Trebuchet]" },
    { id: 9 , value: "Arial Black", label: "Arial Black", className: "font-[Arial-black]" },
    { id: 10 , value: "Impact", label: "Impact", className: "font-[Impact]" },
    { id: 11 , value: "Gloria Hallelujah, cursive", label: "Gloria Hallelujah", className: "font-gloria" },
    { id: 12 , value: "Montserrat, sans-serif", label: "Montserrat", className: "font-montserrat" },
    { id: 13 , value: "Nunito Sans, sans-serif", label: "Nunito", className: "font-nunito" },
    { id: 14 , value: "Josefin Sans, sans-serif", label: "Josefin sans", className: "font-josefin" },
    { id: 15 , value: "Pacifico, cursive", label: "Pacifico", className: "font-pacifico" },
    { id: 16, value: "Open Sans", label: "Open Sans", className: "font-[open]" },
    { id: 17, value: "Roboto", label: "Roboto", className: "font-[roboto]" },
    { id: 18, value: "Lato", label: "Lato", className: "font-[lato]" }
  ];


export function FontsSelect ( { FontFamily, FontFamilyActive } ) {
    const [active, setActive] = useState(false)
    const [ fontActive, setFontActive ] = useState({ id: 1 , 
        value: "Arial", 
        label: "Arial", 
        className: "font-[Arial]" 
    })


    const handledChangeInput = (value) => {
        setActive(false)
        const activa = fontOptions.find(item => item.id === value)
        setFontActive(activa)
        SendFontFamily(activa)
    }

    const SendFontFamily = (data) => {
        FontFamily(data)
    }

    useEffect(() => {
        if(FontFamilyActive) {
            const fuenteActiva = fontOptions.find(item => item.value === FontFamilyActive)
            setFontActive(fuenteActiva)
        }
    }, [FontFamilyActive])

    return (
        <>
        <hr />
            <div className="flex">
                <button className={`flex-shrink-0 z-10 inline-flex justify-between items-center py-2.5 px-4 text-sm font-medium 
                text-center text-gray-800 bg-gray-50 w-full ${fontActive.className}`} type="button"
                onClick={() => setActive(prevState => !prevState)}>
                    {fontActive.label}
                    {
                        active ? (
                            <>
                                { OptionsTypes.upList }
                            </>
                        ) : (
                            <>
                                { OptionsTypes.downList }
                            </>
                        )
                    }
                </button>
            </div>  
        <hr />
            <div className={`z-10 bg-white divide-y divide-gray-600 rounded-lg shadow w-44  ${active ? "" : "hidden"}
            duration-200 absolute sombra-input`}
            style={{ maxHeight: "10rem", overflowY: "auto" }}>
               <ul className="py-2 text-sm text-gray-700 w-full">
               {
                    fontOptions.map(item => (
                        <li key={item.id}>
                            <button type="button"
                            className={`inline-flex w-full px-4 py-2 text-sm text-gray-800 
                            hover:bg-gray-800 hover:text-white ${item.className} cursor-pointer`}
                            onClick={() => handledChangeInput(item.id)}>
                                <div className="inline-flex items-center">
                                    {item.label}
                                </div>
                            </button>
                        </li>
                    ))
                }
               </ul>
            </div>
        </>
    )
}
