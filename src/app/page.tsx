'use client';

import { signOut } from "next-auth/react";

export default function Home() {
  
  return (
   <main> 
 <h1> This is Landing Page</h1>
 <button onClick={() => signOut()}>Logout</button>
   </main>
  );
}
