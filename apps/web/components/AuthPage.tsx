export function AuthPage({isSignin}:{
    isSignin: boolean
}) {
    return <div className="w-screen h-screen flex justify-center items-center">
        <div>
            <input type="text" placeholder="Name"></input>
            <div></div>
            <input type="text" placeholder="Username"></input>
            <div></div>
            <input type="email" placeholder="me@example.com"></input>
            <div></div>
            <input type="password" placeholder="cutedevil"></input>

            <button onClick={()=>{

            }}>Signup</button>
        </div>
    </div>
}