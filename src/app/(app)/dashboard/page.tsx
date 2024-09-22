'use client'

import { signOut } from 'next-auth/react'
import React from 'react'

const Dashboard = () => {
  return (
    <div>Dashboard

      <button onClick={() => signOut()}>Signout</button>
    </div>
  )
}

export default Dashboard