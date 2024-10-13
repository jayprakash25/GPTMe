import { useState } from 'react'
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Input } from "@/Components/ui/input"
import { MessageCircle, Send } from "lucide-react"
import axios from 'axios'
import { useToast } from "@/hooks/use-toast"

export default function PreviewSection({ avatarConfig }) {
  const [isTestingConversation, setIsTestingConversation] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleTestConversation = () => {
    setIsTestingConversation(true)
    setMessages([{ role: 'system', content: 'Hello! How can I assist you today?' }])
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = { role: 'user', content: inputMessage }
    setMessages(prevMessages => [...prevMessages, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await axios.post('/api/preview', {
        message: inputMessage
      })

      if (response.data.statusCode === 200 && response.data.data.choices) {
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
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle>Avatar Preview</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4 flex-grow">
        <div className="w-32 h-32 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold">
          {avatarConfig.name ? avatarConfig.name[0].toUpperCase() : '?'}
        </div>
        <h2 className="text-2xl font-bold">{avatarConfig.name || 'Unnamed Avatar'}</h2>
        <p className="text-center text-muted-foreground">
          {avatarConfig.interests ? `Interests: ${avatarConfig.interests}` : 'No interests specified'}
        </p>
        <p className="text-center text-muted-foreground">
          {avatarConfig.personality ? `Personality: ${avatarConfig.personality}` : 'No personality specified'}
        </p>
        {!isTestingConversation && (
          <Button 
            onClick={handleTestConversation} 
            className="mt-4"
          >
            Start Conversation
            <MessageCircle className="ml-2 h-4 w-4" />
          </Button>
        )}
        {isTestingConversation && (
          <div className="w-full flex-grow flex flex-col space-y-4 overflow-y-auto p-4 bg-secondary rounded-md">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] p-2 rounded-lg ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {isTestingConversation && (
        <div className="p-4 mt-auto">
          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading}
            />
            <Button onClick={handleSendMessage} disabled={isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}