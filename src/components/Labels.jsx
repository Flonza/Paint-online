

export function Labels({children, For}) {
    return (
        <label htmlFor={For} className="inline-flex items-center p-2 text-black bg-gray-700 border border-slate-600 rounded-lg cursor-pointer 
        dark:hover:text-gray-900 dark:border-slate-700 dark:peer-checked:text-black peer-checked:bg-gray-300 peer-checked:border-gray-700 
        peer-checked:text-black hover:text-gray-800 hover:bg-gray-100 dark:text-black dark:bg-gray-50 dark:hover:bg-gray-400
         peer-checked:fill-gray-700">
                { children }
        </label>
    )
}