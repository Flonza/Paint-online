import { useEffect, useState } from "react"
import { OptionsTypes } from "../constants/options-svg"
import './Components.css'

export function RangeButtons({ Range, SendRoungh, RoughnessActive, StepsValue, MinRange }) {

    const [value, setValue] = useState(1)

    const handledClickButtons = (val) => {
        setValue(prevState => Math.max(Math.min((prevState + val), Range), MinRange ? MinRange : 0.1) )
        sendData(value)
    }

    const HandledChangeInput = (event) => {
        const newValue = event.target.value;
            setValue(newValue);
            sendData(newValue);
    }

    const handledBlurInput = (event) => {
        const newValue = event.target.value;
        if(newValue > Range) {
            setValue(Range);
            sendData(Range);
        } else if(newValue == 0 || newValue == null || newValue == undefined || newValue == '' || !newValue){
            setValue(MinRange );
            sendData(MinRange );
        }
    }

    const sendData = (val) => {
        SendRoungh(val)
    }

    useEffect(() => {
        if(RoughnessActive) {
            setValue(RoughnessActive)
        }
    }, [])

    return (
        <div className="flex justify-between items-center h-full">
            <div className="w-10"> 
                <button className="text-gray-600 w-full flex justify-center"
                onClick={() => handledClickButtons( StepsValue ? -StepsValue : -0.1)}>
                    {OptionsTypes.minus}
                </button> 
            </div>
            <p className="text-gray-300">|</p>
            <div className="text-black w-7 text-center -mt-1 cursor-pointer">
                <input type="number" 
                value={value && value % 1 === 0 ? value : (value ? value.toFixed(1) : null)} 
                className="w-full text-center bg-transparent focus:outline-none "
                onChange={(event) => HandledChangeInput(event)}
                onBlur={(event) => handledBlurInput(event)}
                />
            </div>
            <p className="text-gray-300">|</p>
            <div className="w-10"> 
                <button className="text-gray-600 w-full flex justify-center"
                onClick={() => handledClickButtons(StepsValue ? StepsValue : 0.1)}>
                    {OptionsTypes.plus}
                </button> 
            </div>
        </div>
    )
}