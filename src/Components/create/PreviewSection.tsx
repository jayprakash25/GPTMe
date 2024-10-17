'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/Components/ui/card"
import { Input } from "@/Components/ui/input"
import { MessageCircle, Send, Loader2, User } from "lucide-react"
import axios from 'axios'
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/Components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"

interface PreviewSectionProps {
  onEditConfigClick: () => void
}

export default function PreviewSection({ onEditConfigClick }: PreviewSectionProps) {
  const [isTestingConversation, setIsTestingConversation] = useState(false)
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }

  useEffect(() => {
    if (isTestingConversation) {
      scrollToBottom()
      inputRef.current?.focus()
    }
  }, [isTestingConversation, messages])

  const handleTestConversation = () => {
    setIsTestingConversation(true)
    setMessages([{ role: 'assistant', content: 'Hello! How can I assist you today?' }])
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = { role: 'user', content: inputMessage }
    setMessages(prevMessages => [...prevMessages, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await axios.post('/api/chat', {
        message: inputMessage,
      })

      if (response.data.statusCode === 200 && response.data.data) {
        const assistantMessage = { 
          role: 'assistant', 
          content: response.data.data.choices[0].message.content
        }
        setMessages(prevMessages => [...prevMessages, assistantMessage])
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

  return (
    <Card className="w-full h-[calc(100vh-8rem)] flex flex-col bg-gradient-bg-6 border-blue-24 text-body-normal">
      <CardHeader className="border-b border-blue-24 px-6 py-4">
        <CardTitle className="text-2xl font-bold flex items-center text-body-loud">
          <Avatar className="w-8 h-8 mr-2">
            <AvatarImage src={''} alt={''} />
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold">
              { '?'}
            </AvatarFallback>
          </Avatar>
          { 'Unnamed Avatar'}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow p-0 overflow-hidden">
        {!isTestingConversation ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4 p-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={''} alt={''} />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-4xl font-bold">
                {'?'}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold">{'Unnamed Avatar'}</h2>
            <p className="text-center text-gray-400">
              {`Interests: `}
            </p>
            <p className="text-center text-gray-400">
              {`Personality:`}
            </p>
            <Button 
              onClick={handleTestConversation} 
              className="mt-4 bg-blue-24 hover:bg-blue-90 text-body-loud"
            >
              Start Conversation
              <MessageCircle className="ml-2 h-4 w-4" />
            </Button>
            <Button
              onClick={onEditConfigClick}
              className="mt-2 bg-blue-24 hover:bg-blue-90 text-body-loud"
            >
              Edit Configuration
            </Button>
          </div>
        ) : (
          <ScrollArea className="flex-grow px-6 py-4">
            <div ref={scrollAreaRef}>
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                  <div className={`flex items-start space-x-2 max-w-[70%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {message.role === 'assistant' ? (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={''} alt={''} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold">
                          {'?'}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-100" />
                      </div>
                    )}
                    <div className={`p-3 rounded-lg ${
                      message.role === 'user' 
                        ? 'bg-blue-24 text-body-loud' 
                        : 'bg-blue-12 text-body-normal'
                    }`}>
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        {isTestingConversation && (
          <div className="p-4 border-t border-blue-24">
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex space-x-2">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-grow bg-blue-12 text-body-normal border-blue-24 focus:border-blue-90 focus:ring-1 focus:ring-blue-90"
              />
              <Button type="submit" disabled={isLoading} className="bg-blue-24 hover:bg-blue-90 text-body-loud">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        )}
      </CardContent>
      {isTestingConversation && (
        <CardFooter className="border-t border-blue-24 p-4">
          <Button
            onClick={onEditConfigClick}
            className="w-full bg-blue-24 hover:bg-blue-90 text-body-loud"
          >
            Not satisfied? Edit Configuration
          </Button>
        </CardFooter>
      )}
    </Card>
    // </Card>
  )
}
