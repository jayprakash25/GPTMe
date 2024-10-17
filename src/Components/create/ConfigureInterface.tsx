'use client'

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Textarea } from "@/Components/ui/textarea"
import { Button } from "@/Components/ui/button"
import { useToast } from '@/hooks/use-toast'
import ReactMarkdown from 'react-markdown'
import { RootState, AppDispatch } from '@/redux/store'
import { fetchConfiguration, updateConfiguration } from '@/redux/features/configSlice'
import { Card, CardContent, CardFooter, } from "@/Components/ui/card"
import { Loader2 } from "lucide-react"
import axios from 'axios'

interface ConfigureInterfaceProps {
  onPreviewClick: () => void
}

export default function ConfigureInterface({ onPreviewClick }: ConfigureInterfaceProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { extractedInfo, status, error } = useSelector((state: RootState) => state.config)
  const [isEditing, setIsEditing] = useState(false)
  const [editedInfo, setEditedInfo] = useState('')
  const [isTraining, setIsTraining] = useState(false)
  const [enableTraining, setEnableTraining] = useState(false)
  const { toast } = useToast()
  // const [isGPTTrained, setIsGPTTrained] = useState(false)

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchConfiguration())
    }
  }, [dispatch, status])

  useEffect(() => {
    setEditedInfo(extractedInfo)
    setEnableTraining(!extractedInfo) // Enable training if there's no configuration.
  }, [extractedInfo])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedInfo(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editedInfo.trim()) {
      toast({
        title: "Error",
        description: "Configuration cannot be empty.",
        variant: "destructive"
      })
      return
    }

    try {
      await dispatch(updateConfiguration(editedInfo)).unwrap()
      toast({
        title: "Configuration Updated",
        description: "Your configuration has been successfully updated.",
      })
      setIsEditing(false)
      setEnableTraining(true) // Enable training after updating the configuration.
    } catch (error) {
      console.error("Error updating configuration:", error)
      toast({
        title: "Update Failed",
        description: "There was an error updating your configuration.",
        variant: "destructive"
      })
    }
  }

  const handleTrain = async () => {
    setIsTraining(true)
    setEnableTraining(false)
    try {
      const response = await axios.get('/api/configure?gptConfig=true')
      if (response.status === 200) {
        toast({
          title: "Training Complete",
          description: "Your digital twin has been successfully trained.",
        })
        // setIsGPTTrained(true)
      }
    } catch (error) {
      console.error("Error training digital twin:", error)
      toast({
        title: "Training Failed",
        description: "There was an error training your digital twin.",
        variant: "destructive"
      })
    } finally {
      setIsTraining(false)
    }
  }

  if (status === 'loading') {
    return (
      <Card className="w-full h-[75vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </Card>
    )
  }

  if (status === 'failed') {
    return (
      <Card className="w-full h-[75vh] flex items-center justify-center">
        <CardContent>
          <p className="text-destructive">Error: {error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full h-[calc(100vh-12rem)] flex flex-col bg-gradient-bg-6 border-blue-24 text-body-normal">
   
      <CardContent className="flex-grow overflow-auto p-4">
        {!isEditing ? (
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown>{extractedInfo || "No configuration available."}</ReactMarkdown>
          </div>
        ) : (
          <Textarea
            value={editedInfo}
            onChange={handleChange}
            placeholder="Enter your configuration in Markdown format"
            className="w-full h-full min-h-[400px] p-2 bg-blue-12 text-body-normal border-blue-24 rounded focus:border-blue-90 focus:ring-1 focus:ring-blue-90"
          />
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t border-blue-24 pt-4">
        {!isEditing ? (
          <>
            <Button 
              onClick={() => setIsEditing(true)} 
              className="bg-blue-24 hover:bg-blue-90 hover:text-black text-body-loud"
            >
              Edit Configuration
            </Button>
            {!enableTraining ? (
              <Button 
                onClick={onPreviewClick}
                className="bg-blue-24 hover:text-black hover:bg-blue-90 text-body-loud"
              >
                Preview 
              </Button>
            ) : (
              <Button 
                onClick={handleTrain} 
                disabled={!enableTraining || isTraining}
                className="bg-blue-24 hover:bg-blue-90 text-body-loud disabled:opacity-50"
              >
                {isTraining ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isTraining ? 'Training...' : 'Train Digital Twin'}
              </Button>
            )}
          </>
        ) : (
          <>
            <Button 
              onClick={handleSubmit} 
              className="bg-blue-24 hover:text-black hover:bg-blue-90 text-body-loud"
            >
              Update Configuration
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(false)} 
              className="border-blue-24 hover:text-white text-body-normal hover:bg-blue-12"
            >
              Cancel
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}
