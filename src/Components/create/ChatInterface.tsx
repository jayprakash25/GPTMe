'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, User, Paperclip, Plus, Settings, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { RootState, AppDispatch } from '@/redux/store'
import { fetchConversationHistory, sendMessage, addMessage, setConversationStatus } from '@/redux/features/chatSlice'
import TypingEffect from '@/components/create/TypingEffect'

interface ChatInterfaceProps {
  onConfigureClick: () => void
}

export default function ChatInterface({ onConfigureClick }: ChatInterfaceProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { messages, status, conversationStatus } = useSelector((state: RootState) => state.chat)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchConversationHistory())
    }
  }, [dispatch, status])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isTyping) {
      dispatch(addMessage({ role: 'user', content: input }))
      setInput('')
      setIsTyping(true)

      try {
        const response = await dispatch(sendMessage(input)).unwrap()
        dispatch(addMessage({ role: 'assistant', content: response, isNew: true }))
      } catch (error) {
        console.error('Error processing message:', error)
        dispatch(addMessage({ 
          role: 'assistant', 
          content: "I'm sorry, I encountered an error. Can you please try again?",
          isNew: true 
        }))
      } finally {
        setIsTyping(false)
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    adjustTextareaHeight()
  }

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(e)
    }
  }

  const handleAddNewInfo = () => {
    dispatch(setConversationStatus('in_progress'))
    dispatch(addMessage({
      role: 'assistant',
      content: "Great! What additional information would you like to share?",
      isNew: true
    }))
  }

  const handleAttachFile = () => {
    // Implement file attachment logic here
    console.log('File attachment clicked')
  }

  return (
    <div className="h-[calc(100vh-4rem)] sm:h-[calc(100vh-8rem)] flex flex-col bg-zinc-950 border border-zinc-800/50 text-zinc-100 rounded-xl overflow-hidden">
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 pt-4">
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
          
          {isTyping && (
            <div className="flex items-end space-x-2">
              <Avatar className="w-8 h-8 bg-zinc-800 ring-1 ring-zinc-700/50">
                <AvatarFallback>AI</AvatarFallback>
                <AvatarImage src="/ai-avatar.png" alt="AI Avatar" />
              </Avatar>
              <div className="max-w-[80%] sm:max-w-[70%] p-3 rounded-xl bg-zinc-800/50 text-zinc-100 border border-zinc-700/50">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                  <span className="text-sm text-zinc-400">GPTMe is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="border-t border-zinc-800/50 bg-zinc-900/30 p-4">
        {conversationStatus === 'completed' ? (
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleAddNewInfo} 
              variant="ghost"
              className="flex-1 bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-200 h-10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Information
            </Button>
            <Button 
              onClick={onConfigureClick} 
              variant="ghost"
              className="flex-1 bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-200 h-10"
            >
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="w-full min-h-[40px] max-h-[120px] py-2.5 px-4 resize-none 
                  bg-zinc-800/50 hover:bg-zinc-700/50 focus:bg-zinc-700/80 
                  text-zinc-100 border-0 focus:ring-1 focus:ring-indigo-500/50 
                  placeholder-zinc-400 rounded-lg transition-all duration-200"
                disabled={isTyping}
              />
            </div>
            <Button 
              type="submit" 
              size="icon"
              disabled={!input.trim() || isTyping}
              className="h-10 w-10 bg-indigo-500/10 hover:bg-indigo-500/20 
                text-indigo-200 border border-indigo-500/20
                transition-colors duration-200 
                disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}