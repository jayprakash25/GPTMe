'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Textarea } from "@/Components/ui/textarea"
import { Button } from "@/Components/ui/button"
import { ScrollArea } from "@/Components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"
import { Send, User, Paperclip } from "lucide-react"
import { cn } from "@/lib/utils"
import { RootState, AppDispatch } from '@/redux/store'
import { fetchConversationHistory, sendMessage, addMessage, setConversationStatus } from '@/redux/features/chatSlice'
import TypingEffect from './TypingEffect'

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
    <div className="h-[75vh] flex flex-col bg-gradient-to-b from-dark-bg to-blue-6 border border-blue-24 text-body-loud rounded-xl overflow-hidden shadow-lg">
     
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
                <Avatar className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 ring-2 ring-blue-90">
                  <AvatarFallback>AI</AvatarFallback>
                  <AvatarImage src="/ai-avatar.png" alt="AI Avatar" />
                </Avatar>
              )}
              <div className={cn(
                "max-w-[70%] p-3 rounded-lg shadow-md",
                message.role === 'user' ? "bg-blue-24 text-body-loud" : " text-body-normal",
                "transform transition-all duration-300 ease-in-out hover:scale-[1.02]",
                "border border-blue-90/30"
              )}>
                {message.role === 'assistant' && message.isNew ? (
                  <TypingEffect text={message.content} />
                ) : (
                  <p className="text-sm leading-relaxed">{message.content}</p>
                )}
              </div>
              {message.role === 'user' && (
                <Avatar className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 ring-2 ring-blue-90">
                  <AvatarFallback>
                    <User className="w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <div className="border-t border-blue-24 bg-gradient-to-t from-blue-12 to-blue-6 p-4">
        {conversationStatus === 'completed' ? (
          <div className="flex justify-between items-center">
            <Button onClick={handleAddNewInfo} className="bg-blue-24 hover:bg-blue-90 text-body-loud transition-all duration-200 hover:text-black shadow-lg hover:shadow-blue-90/50">
              Add New Information
            </Button>
            <Button onClick={onConfigureClick} className="bg-blue-24 hover:bg-blue-90 text-body-loud transition-all duration-200 shadow-lg hover:text-black hover:shadow-blue-90/50">
              Go to Configure
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="flex space-x-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="flex-1 min-h-[40px] max-h-[120px] resize-none bg-blue-12 text-body-loud border-blue-24 focus:border-blue-90 focus:ring-1 focus:ring-blue-90 placeholder-body-muted rounded-lg transition-all duration-200 shadow-inner"
              disabled={isTyping}
            />
            <div className="flex flex-col space-y-2">
              <Button
                type="button"
                size="icon"
                onClick={handleAttachFile}
                className="bg-blue-24 hover:bg-blue-90 text-body-loud transition-colors duration-200 focus:ring-2 focus:ring-blue-90 shadow-lg hover:shadow-blue-90/50"
                aria-label="Attach file"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button 
                type="submit" 
                size="icon" 
                disabled={!input.trim() || isTyping}
                className="bg-blue-24 hover:bg-blue-90 text-body-loud transition-colors duration-200 focus:ring-2 focus:ring-blue-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-90/50"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
