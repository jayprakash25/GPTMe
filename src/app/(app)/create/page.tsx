'use client';

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs"
import ChatInterface from '@/Components/create/ChatInterface'
import ConfigureInterface from '@/Components/create/ConfigureInterface'
import PreviewSection from '@/Components/create/PreviewSection'

export default function DigitalCreator() {
 

  const [activeTab, setActiveTab] = useState('chat')

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

 

  return (
    <div className="min-h-screen bg-dark-bg text-body-normal">
      <div className="container mx-auto p-6 flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
        <div className="lg:w-1/2">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-loud-100">GPTMe</h1>
          </div>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-blue-6 rounded-lg p-1">
              <TabsTrigger value="chat" className="data-[state=active]:bg-blue-12 data-[state=active]:text-body-loud transition-all duration-200">Chat</TabsTrigger>
              <TabsTrigger value="configure" className="data-[state=active]:bg-blue-12 data-[state=active]:text-body-loud transition-all duration-200">Configure</TabsTrigger>
            </TabsList>
            <TabsContent value="chat">
              <ChatInterface onConfigureClick={() => handleTabChange('configure')}/>
            </TabsContent>
            <TabsContent value="configure">
              <ConfigureInterface />
            </TabsContent>
          </Tabs>
        </div>
        <div className="lg:w-1/2">
          <PreviewSection />
        </div>
      </div>
    </div>
  )
}
