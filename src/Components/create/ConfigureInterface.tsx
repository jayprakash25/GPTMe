'use client'

import { useEffect, useState } from 'react'
import { Textarea } from "@/Components/ui/textarea"
import { Button } from "@/Components/ui/button"
import { useToast } from '@/hooks/use-toast'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'

export default function ConfigureInterface() {
  const [extractedInfo, setExtractedInfo] = useState<string>('')
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setExtractedInfo(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!extractedInfo.trim()) {
      toast({
        title: "Error",
        description: "Configuration cannot be empty.",
        variant: "destructive"
      })
      return
    }

    try {
      const response = await axios.put('/api/configure', { extractedInfo })
      if (response.data.statusCode === 200) {
        toast({
          title: "Configuration Updated",
          description: "Your configuration has been successfully updated.",
        })
        setIsEditing(false)
      } else {
        throw new Error(response.data.message)
      }
    } catch (error) {
      console.error("Error updating configuration:", error)
      toast({
        title: "Update Failed",
        description: "There was an error updating your configuration.",
        variant: "destructive"
      })
    }
  }

  const fetchConfiguration = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get('/api/configure')
      if (response.data.statusCode === 200) {
        setExtractedInfo(response.data.data.extractedInfo)
      } else if (response.data.statusCode === 404) {
        toast({
          title: "No Configuration Found",
          description: "It seems you haven't set up your configuration yet.",
          variant: "destructive"
        })
        setExtractedInfo('')
      } else {
        throw new Error(response.data.message)
      }
    } catch (error) {
      console.error("Error fetching configuration:", error)
      toast({
        title: "Fetch Failed",
        description: "There was an error fetching your configuration.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchConfiguration()
  }, [])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      {!isEditing ? (
        <>
          <div className="prose max-w-none">
            <ReactMarkdown>{extractedInfo || "No configuration available."}</ReactMarkdown>
          </div>
          <Button onClick={() => setIsEditing(true)}>Edit Configuration</Button>
        </>
      ) : (
        <form  className="space-y-4">
          <Textarea
            value={extractedInfo}
            onChange={handleChange}
            placeholder="Enter your configuration in Markdown format"
            rows={20}
            className="w-full p-2 border rounded"
          />
          <div className="flex space-x-4">
            <Button  onClick={handleSubmit} className="flex-1">Update Configuration</Button>
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>Cancel</Button>
          </div>
        </form>
      )}
    </div>
  )
}