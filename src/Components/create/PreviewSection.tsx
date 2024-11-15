'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Send, Loader2, User, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import axios from 'axios'
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import TypingEffect from '@/components/create/TypingEffect'

interface PreviewSectionProps {
  onEditConfigClick: () => void
}

export default function PreviewSection({ onEditConfigClick }: PreviewSectionProps) {
  const [isTestingConversation, setIsTestingConversation] = useState(false)
  const [messages, setMessages] = useState<Array<{ role: string; content: string; isNew?: boolean }>>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }

  const handleTestConversation = () => {
    setIsTestingConversation(true)
    setMessages([{ 
      role: 'assistant', 
      content: 'Hello! How can I assist you today?',
      isNew: true 
    }])
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading) return

    const userMessage = { role: 'user', content: inputMessage }
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await axios.post('/api/chat', {
        message: inputMessage,
      })

      if (response.data.statusCode === 200 && response.data.data) {
        const assistantMessage = { 
          role: 'assistant', 
          content: response.data.data.choices[0].message.content,
          isNew: true
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (error) {
      console.error('Error in conversation:', error)
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  return (
    <div className="h-[calc(100vh-4rem)] sm:h-[calc(100vh-8rem)] flex flex-col bg-zinc-950 border border-zinc-800/50 text-zinc-100 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="border-b border-zinc-800/50 bg-zinc-900/30 px-4 py-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8 bg-zinc-800 ring-1 ring-zinc-700/50">
            <AvatarFallback>AI</AvatarFallback>
            <AvatarImage src="/ai-avatar.png" alt="AI Avatar" />
          </Avatar>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-zinc-100">Digital Twin Preview</h2>
            <p className="text-xs text-zinc-400">Test your AI's responses</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <ScrollArea className="flex-1 px-4 py-4">
        {!isTestingConversation ? (
          <div className="h-full flex flex-col items-center justify-center space-y-4 p-4">
            <Avatar className="h-16 w-16 bg-zinc-800 ring-1 ring-zinc-700/50">
              <AvatarFallback>AI</AvatarFallback>
              <AvatarImage src="/ai-avatar.png" alt="AI Avatar" />
            </Avatar>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-zinc-100">Ready to Test</h3>
              <p className="text-sm text-zinc-400">Start a conversation to test your digital twin</p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              <Button
                onClick={handleTestConversation}
                className="w-full bg-indigo-500/10 hover:bg-indigo-500/20 
                  text-indigo-200 border border-indigo-500/20"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Start Conversation
              </Button>
              <Button
                onClick={onEditConfigClick}
                variant="ghost"
                className="w-full bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-200"
              >
                <Settings className="w-4 h-4 mr-2" />
                Edit Configuration
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-end space-x-2 transition-all duration-300 ease-in-out",
                  message.role === 'user' ? "justify-end" : "justify-start",
                  "animate-in fade-in-0 slide-in-from-bottom-4"
                )}
              >
                {message.role === 'assistant' && (
                  <Avatar className="w-8 h-8 bg-zinc-800 ring-1 ring-zinc-700/50">
                    <AvatarFallback>AI</AvatarFallback>
                    <AvatarImage src="/ai-avatar.png" alt="AI Avatar" />
                  </Avatar>
                )}
                <div className={cn(
                  "max-w-[80%] sm:max-w-[70%] p-3 rounded-xl",
                  message.role === 'user' 
                    ? "bg-indigo-500/10 text-indigo-100 border border-indigo-500/20" 
                    : "bg-zinc-800/50 text-zinc-100 border border-zinc-700/50",
                  "transform transition-all duration-300 ease-in-out hover:scale-[1.02]"
                )}>
                  {message.role === 'assistant' && message.isNew ? (
                    <TypingEffect text={message.content} />
                  ) : (
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  )}
                </div>
                {message.role === 'user' && (
                  <Avatar className="w-8 h-8 bg-zinc-800 ring-1 ring-zinc-700/50">
                    <AvatarFallback>
                      <User className="w-4 h-4 text-zinc-300" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      {isTestingConversation && (
        <div className="border-t border-zinc-800/50 bg-zinc-900/30 p-4">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => {
                  setInputMessage(e.target.value)
                  adjustTextareaHeight()
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="w-full min-h-[40px] max-h-[120px] py-2.5 px-4 resize-none 
                  bg-zinc-800/50 hover:bg-zinc-700/50 focus:bg-zinc-700/80 
                  text-zinc-100 border-0 focus:ring-1 focus:ring-indigo-500/50 
                  placeholder-zinc-400 rounded-lg transition-all duration-200"
                disabled={isLoading}
              />
            </div>
            <Button 
              type="submit" 
              size="icon"
              disabled={!inputMessage.trim() || isLoading}
              className="h-10 w-10 bg-indigo-500/10 hover:bg-indigo-500/20 
                text-indigo-200 border border-indigo-500/20
                transition-colors duration-200 
                disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
