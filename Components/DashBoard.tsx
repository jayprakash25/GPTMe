"use client";    

import { useSession } from "next-auth/react";
import React from "react";  
import Signup from "./Signup";


export default function DashBoard() {

    const { data: session } = useSession();  

    return (
        <>

        {session? (
        
        <>
        <h1> Welcome to GPT ME </h1>
        
        </> 
        
        ) 
        : 
        (
        <>

        <Signup/> 
        
        </> 
        ) 
        }
        
        
        </>
    );
}
