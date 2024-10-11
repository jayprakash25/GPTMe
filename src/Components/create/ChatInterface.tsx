import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Textarea } from "@/Components/ui/textarea"
import { Button } from "@/Components/ui/button"
import { Send, User, Bot } from "lucide-react"
import { ScrollArea } from "@/Components/ui/scroll-area"
import { cn } from "@/lib/utils"
import axios from 'axios'
import TypingEffect from './TypingEffect'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [conversationStatus, setConversationStatus] = useState<'in_progress' | 'completed'>('in_progress')
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const fetchConversationHistory = useCallback(async () => {
    setIsTyping(true)
    try {
      const response = await axios.post('/api/conversation', { action: 'fetch_history' })
      if (response.data.data.messages && response.data.data.messages.length > 0) {
        setMessages(response.data.data.messages)
        setConversationStatus(response.data.data.status)
      } else {
        // If no history, start a new conversation
        const initialMessage: Message = {
          role: 'assistant',
          content: "Hey there! I'm here to learn all about you, so I can become your digital twin. Ready to start this journey together?"
        }
        setMessages([initialMessage])
      }
    } catch (error) {
      console.error('Error fetching conversation history:', error)
      // Handle error (e.g., show an error message to the user)
    } finally {
      setIsTyping(false)
    }
  }, [])

  useEffect(() => {
    fetchConversationHistory()
  }, [fetchConversationHistory])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isTyping) {
      const userMessage: Message = { role: 'user', content: input }
      setMessages(prev => [...prev, userMessage])
      setInput('')
      setIsTyping(true)

      try {
        const response = await axios.post('/api/conversation', { 
          message: input,
        })
        const aiResponse: Message = { role: 'assistant', content: response.data.data.aiResponse }
        setMessages(prev => [...prev, aiResponse])
        
        if (response.data.data.status === "completed") {
          setConversationStatus('completed')
        }
      } catch (error) {
        console.error('Error processing message:', error)
        setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error. Can you please try again?" }])
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

                {message.role === 'assistant' ? (
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