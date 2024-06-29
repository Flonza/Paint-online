import { useState } from "react"


export const useHistory = initialState => {
    // Crea dos estados locales: index para seguir la posición actual en el historial y history para almacenar el historial de estados.
    const [index, setIndex] = useState(0);
    const [history, setHistory] = useState([initialState]);

    const setState = (action, overwrite = false) => {
        const newState = typeof action === "function" ? action(history[index]) : action;
        if(overwrite === true){
            const historyCopy = [...history];
            historyCopy[index] = newState;
            setHistory(historyCopy);
        } else {
            const updatedHistory = history.slice(0, index + 1); // Elimina los estados futuros
            setHistory([...updatedHistory, newState]); // Agrega el nuevo estado al final
            setIndex(prevState => prevState + 1); // Incrementa el índice del historial
        }
    }
    const removeElement = indexToRemove => {
        setState(prevState => prevState.filter(element => element.id !== indexToRemove));
    };
    

    const redo = () => {
        if(index > 0) {
            setIndex(index - 1)
        }
    } 
    const undo = () => {
        if(index < history.length - 1) {
            setIndex(prevState => prevState + 1)
        }
    }

    const clearAll = () => {
        setState(prevState => {
            const updatedState = history[0] // Filtra el elemento con el ID a eliminar
            return updatedState;
        });
    };
    // Retorna un array que contiene el estado actual y la función setState para actualizarlo.
    return [history[index], setState, redo, undo, removeElement, clearAll]
} 

