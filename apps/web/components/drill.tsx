"use client"
import { useEffect, useState } from "react";
import axios from "axios";

export default function Drill() {
    const [todo, setTodo] = useState<any>(null);

    useEffect(() => {
        axios.get("https://jsonplaceholder.typicode.com/todos/1").then(function (response) {
            setTodo(response.data);
        })

    }, []);

    return (
        <div>
            {todo? (
                <div> Title: {todo.title}</div>
            ): (
                <div>Loading...</div>
            )}
        </div>
    )

}

// export default function Drill() {
//     const [useToggle, setToggle] = useState(false);

//     return (
//         <>
//         <button onClick={() => setToggle(!useToggle)}> Click Me</button >
//         {useToggle && (<div>Settings open</div>)}
//         </>
//     )
// }

// export default function Drill() {
//     const [liveText, setLiveText] = useState('');

//     return (
//         <div>
//             <input type="text" className="border border-black p-2" value={liveText} onChange={(e) => setLiveText(e.target.value)}></input>
//             <h1>
//                 Mirror: {liveText}
//             </h1>

//         </div>
//     )
// }

