'use client'

import { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Textarea } from "@/Components/ui/textarea"
import { Button } from "@/Components/ui/button"
import { useToast } from '@/hooks/use-toast'
import ReactMarkdown from 'react-markdown'
import { RootState, AppDispatch } from '@/redux/store'
import { fetchConfiguration, updateConfiguration } from '@/redux/features/configSlice'
import { Card, CardContent, CardFooter, } from "@/Components/ui/card"
import { Loader2, Upload } from "lucide-react"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
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
  const [gptName, setGptName] = useState('')
  const [gptPhoto, setGptPhoto] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchConfiguration())
    }
  }, [dispatch, status])

  useEffect(() => {
    setEditedInfo(extractedInfo)
    setEnableTraining(!extractedInfo)
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
      setEnableTraining(true)
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
      const formData = new FormData()
      formData.append('gptName', gptName)
      if (gptPhoto) {
        formData.append('gptPhoto', gptPhoto)
      }
      formData.append('gptConfig', 'true')

      const response = await axios.post('/api/configure', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.status === 200) {
        toast({
          title: "Training Complete",
          description: "Your digital twin has been successfully trained.",
        })
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setGptPhoto(e.target.files[0])
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
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
      <CardFooter className="flex flex-col items-start border-t border-blue-24 pt-4 space-y-4">
        {!isEditing ? (
          <>
            <div className="flex justify-between w-full">
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
            </div>
            {enableTraining && (
              <div className="w-full space-y-4">
                <div>
                  <Label htmlFor="gptName">GPT Name</Label>
                  <Input
                    id="gptName"
                    value={gptName}
                    onChange={(e) => setGptName(e.target.value)}
                    placeholder="Enter GPT name"
                    className="bg-blue-12 text-body-normal border-blue-24"
                  />
                </div>
                <div>
                  <Label htmlFor="gptPhoto">GPT Photo</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="gptPhoto"
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      ref={fileInputRef}
                    />
                    <Button
                      type="button"
                      onClick={triggerFileInput}
                      className="bg-blue-24 hover:bg-blue-90 text-body-loud"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Photo
                    </Button>
                    {gptPhoto && <span className="text-body-normal">{gptPhoto.name}</span>}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex justify-between w-full">
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
          </div>
        )}
      </CardFooter>
    </Card>
  )
}