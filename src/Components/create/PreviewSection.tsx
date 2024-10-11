import { useState } from 'react'
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { MessageCircle } from "lucide-react"

export default function PreviewSection({ avatarConfig }) {
  const [isTestingConversation, setIsTestingConversation] = useState(false)

  const handleTestConversation = () => {
    setIsTestingConversation(true)
    // Here you would typically initiate a test conversation
    // For now, we'll just toggle the state
    setTimeout(() => setIsTestingConversation(false), 3000)
  }

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Avatar Preview</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
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
        <Button 
          onClick={handleTestConversation} 
          disabled={isTestingConversation}
          className="mt-4"
        >
          {isTestingConversation ? 'Testing...' : 'Test Conversation'}
          <MessageCircle className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}