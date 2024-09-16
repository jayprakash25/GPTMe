import { signIn } from "next-auth/react";

export default function Signup() {

    return(
        <>

        <button onClick={()=> signIn('google')}>Sign Up</button> 
        
        
        </>
    );
}