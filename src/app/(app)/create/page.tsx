'use client';

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs"
import ChatInterface from '@/Components/create/ChatInterface'
import ConfigureInterface from '@/Components/create/ConfigureInterface'
import PreviewSection from '@/Components/create/PreviewSection'
import { Button } from "@/Components/ui/button"
import { MessageCircle, Settings, Eye } from "lucide-react"

export default function DigitalCreator() {
  const [activeTab, setActiveTab] = useState('chat')
  const [showPreview, setShowPreview] = useState(false)

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  const togglePreview = () => {
    setShowPreview(!showPreview)
  }

  return (
    <div className="min-h-screen bg-dark-bg text-body-normal flex flex-col">
      <nav className="bg-blue-6 p-4 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-loud-100">GPTMe</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={togglePreview}
            className="lg:hidden"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
        </div>
      </nav>

      <div className="container mx-auto p-4 flex-grow flex flex-col lg:flex-row lg:space-x-4 overflow-hidden">
        <div className={`flex flex-col ${showPreview ? 'hidden' : 'flex-grow'} lg:flex lg:w-1/2`}>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full flex flex-col flex-grow">
            <TabsList className="grid w-full grid-cols-2 bg-blue-6 rounded-lg p-1 mb-4">
              <TabsTrigger value="chat" className="data-[state=active]:bg-blue-12 data-[state=active]:text-body-loud transition-all duration-200">
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="configure" className="data-[state=active]:bg-blue-12 data-[state=active]:text-body-loud transition-all duration-200">
                <Settings className="w-4 h-4 mr-2" />
                Configure
              </TabsTrigger>
            </TabsList>
            <TabsContent value="chat" className="flex-grow">
              <ChatInterface onConfigureClick={() => handleTabChange('configure')}/>
            </TabsContent>
            <TabsContent value="configure" className="flex-grow">
              <ConfigureInterface onPreviewClick={togglePreview} />
            </TabsContent>
          </Tabs>
        </div>

        <div className={`${showPreview ? 'flex-grow' : 'hidden'} lg:flex lg:w-3/5`}>
          <PreviewSection onEditConfigClick={() => {
            handleTabChange('configure')
            setShowPreview(false)
          }} />
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-blue-6 border-t border-blue-24 p-2">
        <div className="flex justify-around items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              handleTabChange('chat')
              setShowPreview(false)
            }}
            className={activeTab === 'chat' && !showPreview ? 'text-body-loud' : 'text-body-normal'}
          >
            <MessageCircle className="w-5 h-5" />
            <span className="sr-only">Chat</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              handleTabChange('configure')
              setShowPreview(false)
            }}
            className={activeTab === 'configure' && !showPreview ? 'text-body-loud' : 'text-body-normal'}
          >
            <Settings className="w-5 h-5" />
            <span className="sr-only">Configure</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePreview}
            className={showPreview ? 'text-body-loud' : 'text-body-normal'}
          >
            <Eye className="w-5 h-5" />
            <span className="sr-only">Preview</span>
          </Button>
        </div>
      </div>
    </div>
  )
}