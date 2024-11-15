'use client';

import { useState, useEffect } from 'react'
import ChatInterface from '@/components/create/ChatInterface'
import ConfigureInterface from '@/components/create/ConfigureInterface'
import PreviewSection from '@/components/create/PreviewSection'
import { Button } from "@/components/ui/button"
import { MessageCircle, Settings, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

type View = 'chat' | 'configure' | 'preview'

export default function DigitalCreator() {
  const [activeView, setActiveView] = useState<View>('chat')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 1024)
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  const handleViewChange = (view: View) => {
    setActiveView(view)
  }

  const renderContent = () => {
    switch (activeView) {
      case 'chat':
        return <ChatInterface onConfigureClick={() => handleViewChange('configure')} />
      case 'configure':
        return <ConfigureInterface onPreviewClick={() => handleViewChange('preview')} />
      case 'preview':
        return <PreviewSection onEditConfigClick={() => handleViewChange('configure')} />
    }
  }

  const renderNavButtons = (className: string) => (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleViewChange('chat')}
        className={cn(
          className,
          activeView === 'chat' && "bg-zinc-700/50"
        )}
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        {!isMobile && <span>Chat</span>}
        <span className="sr-only">Chat</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleViewChange('configure')}
        className={cn(
          className,
          activeView === 'configure' && "bg-zinc-700/50"
        )}
      >
        <Settings className="w-4 h-4 mr-2" />
        {!isMobile && <span>Configure</span>}
        <span className="sr-only">Configure</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleViewChange('preview')}
        className={cn(
          className,
          activeView === 'preview' && "bg-zinc-700/50"
        )}
      >
        <Eye className="w-4 h-4 mr-2" />
        {!isMobile && <span>Preview</span>}
        <span className="sr-only">Preview</span>
      </Button>
    </>
  )

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 flex flex-col">
      <nav className="bg-zinc-900/50 backdrop-blur-lg border-b border-zinc-800/50 px-4 py-3 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-zinc-100">GPTMe</h1>
          {isMobile ? (
            <div className="flex space-x-2">
              {renderNavButtons("bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-200 p-2 rounded-full")}
            </div>
          ) : (
            <div className="flex space-x-2">
              {renderNavButtons("bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-200 px-4 py-2 rounded-md")}
            </div>
          )}
        </div>
      </nav>

      <div className="container mx-auto px-2 sm:px-4 flex-grow flex overflow-hidden">
        {!isMobile && (
          <div className="w-1/5 border-r border-zinc-800/50 pr-4 pt-6 hidden lg:block">
            <h2 className="text-xl font-semibold mb-4">Navigation</h2>
            <div className="flex flex-col space-y-2">
              {renderNavButtons("justify-start text-left w-full")}
            </div>
          </div>
        )}
        <div className={cn(
          "transition-all duration-300 ease-in-out",
          isMobile ? "w-full" : "w-4/5 pl-6 pt-6"
        )}>
          {renderContent()}
        </div>
      </div>
    </div>
  )
}