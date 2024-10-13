'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Textarea } from "@/Components/ui/textarea"
import { Button } from "@/Components/ui/button"
import { Send, User, Bot } from "lucide-react"
import { ScrollArea } from "@/Components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { RootState, AppDispatch } from '@/redux/store'
import { fetchConversationHistory, sendMessage, addMessage, setConversationStatus } from  '@/redux/features/chatSlice'
import TypingEffect from './TypingEffect'
import FloatingCard from './FloatingCard'

interface ChatInterfaceProps {
  onConfigureClick: () => void
}

export default function ChatInterface({onConfigureClick}: ChatInterfaceProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { messages, status, conversationStatus } = useSelector((state: RootState) => state.chat)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchConversationHistory())
    }
  }, [dispatch, status])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, conversationStatus])

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isTyping) {
      dispatch(addMessage({ role: 'user', content: input }))
      setInput('')
      setIsTyping(true)

      try {
        await dispatch(sendMessage(input)).unwrap()
      } catch (error) {
        console.error('Error processing message:', error)
        dispatch(addMessage({ role: 'assistant', content: "I'm sorry, I encountered an error. Can you please try again?" }))
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
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
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

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col bg-background border rounded-lg shadow-sm">
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex items-start space-x-2 transition-all duration-300 ease-in-out",
                message.role === 'user' ? "justify-end" : "justify-start",
                "animate-in fade-in-0 slide-in-from-bottom-4"
              )}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[70%] p-3 rounded-lg",
                  message.role === 'user' ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                )}
              >
                {message.role === 'assistant' && message.isNew ? (
                  <TypingEffect text={message.content} />
                ) : (
                  message.content
                )}
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="bg-secondary p-3 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          {conversationStatus === 'completed' && (
            <div className="py-4">
              <FloatingCard onAddNewInfo={handleAddNewInfo} onConfigureClick={onConfigureClick} />
            </div>
          )}
        </div>
      </ScrollArea>
      <form onSubmit={handleSend} className="p-4 border-t">
        <div className="flex space-x-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={conversationStatus === 'completed' ? "Add new information..." : "Type your message..."}
            className="flex-1 min-h-[40px] max-h-[120px] p-2 rounded-md border resize-none"
            disabled={isTyping}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!input.trim() || isTyping}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}