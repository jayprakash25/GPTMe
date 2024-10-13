'use client';

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs"
import { Button } from "@/Components/ui/button"
import { Moon, Sun } from "lucide-react"
import ChatInterface from '@/Components/create/ChatInterface'
import ConfigureInterface from '@/Components/create/ConfigureInterface'
import PreviewSection from '@/Components/create/PreviewSection'

export default function DigitalCreator() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [avatarConfig, setAvatarConfig] = useState({
    name: '',
    interests: '',
    personality: ''
  })

  const [activeTab, setActiveTab] = useState('chat')

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="container mx-auto p-4 flex flex-col lg:flex-row">
        <div className="lg:w-1/2 lg:pr-4 mb-4 lg:mb-0">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">GPTMe</h1>
            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {isDarkMode ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
            </Button>
          </div>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="configure">Configure</TabsTrigger>
            </TabsList>
            <TabsContent value="chat">
              <ChatInterface  onConfigureClick={() => handleTabChange('configure')}/>
            </TabsContent>
            <TabsContent value="configure">
              <ConfigureInterface />
            </TabsContent>
          </Tabs>
        </div>
        <div className="lg:w-1/2 lg:pl-4">
          <PreviewSection avatarConfig={avatarConfig} />
        </div>
      </div>
    </div>
  )
}