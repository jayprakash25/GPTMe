'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Textarea } from "@/Components/ui/textarea"
import { Button } from "@/Components/ui/button"
import { useToast } from '@/hooks/use-toast'
import { RootState, AppDispatch } from '@/redux/store'
import { fetchConfiguration, updateConfiguration } from '@/redux/features/configSlice'
import { Card, CardContent, CardFooter } from "@/Components/ui/card"
import { Loader2 } from "lucide-react"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import axios from 'axios'

interface ConfigureInterfaceProps {
  onPreviewClick: () => void
}

const predefinedInstructions = [
  { value: "friendly", label: "Friendly and Approachable", instruction: "Respond in a friendly and approachable manner, using casual language and a positive tone." },
  { value: "professional", label: "Professional and Formal", instruction: "Maintain a professional and formal tone in all responses, using industry-standard terminology when appropriate." },
  { value: "concise", label: "Concise and Direct", instruction: "Provide brief, to-the-point responses that directly address the user's query without unnecessary elaboration." },
  { value: "detailed", label: "Detailed and Thorough", instruction: "Offer comprehensive responses that cover all aspects of the user's query, providing examples and explanations where necessary." },
]

function useDebounce(func: Function, delay: number) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const debouncedFunc = useCallback((...args: any[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      func(...args)
    }, delay)
  }, [func, delay])

  return debouncedFunc
}

export default function ConfigureInterface({ onPreviewClick }: ConfigureInterfaceProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { config, status, error } = useSelector((state: RootState) => state.config)
  const [name, setName] = useState('')
  const [instructions, setInstructions] = useState('')
  const [info, setInfo] = useState('')
  const [isTraining, setIsTraining] = useState(false)
  const [enableTraining, setEnableTraining] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchConfiguration())
    }
  }, [dispatch, status])

  useEffect(() => {
    if (config) {
      setName(config.name || '')
      setInstructions(config.instructions || '')
      setInfo(JSON.stringify(config.extractedInfo, null, 2))
      setEnableTraining(!!config.extractedInfo)
    }
  }, [config])

  const updateConfig = useCallback(async (newName: string, newInstructions: string, newInfo: string) => {
    if (!newName.trim() || !newInstructions.trim() || !newInfo.trim()) {
      return
    }

    try {
      await dispatch(updateConfiguration({
        name: newName,
        instructions: newInstructions,
        extractedInfo: JSON.parse(newInfo)
      })).unwrap()
      setEnableTraining(true)
    } catch (error) {
      console.error("Error updating configuration:", error)
      toast({
        title: "Update Failed",
        description: "There was an error updating your configuration.",
        variant: "destructive"
      })
    }
  }, [dispatch, toast])

  const debouncedUpdateConfig = useDebounce(updateConfig, 500)

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setName(newName)
    debouncedUpdateConfig(newName, instructions, info)
  }

  const handleInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newInstructions = e.target.value
    setInstructions(newInstructions)
    debouncedUpdateConfig(name, newInstructions, info)
  }

  const handleInfoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newInfo = e.target.value
    setInfo(newInfo)
    debouncedUpdateConfig(name, instructions, newInfo)
  }

  const handlePredefinedInstructionChange = (value: string) => {
    const selectedInstruction = predefinedInstructions.find(i => i.value === value)
    if (selectedInstruction) {
      setInstructions(selectedInstruction.instruction)
      debouncedUpdateConfig(name, selectedInstruction.instruction, info)
    }
  }

  const handleTrain = async () => {
    setIsTraining(true)
    setEnableTraining(false)
    try {
      const formData = new FormData()
      formData.append('gptName', name)
      formData.append('gptInstructions', instructions)
      formData.append('gptConfig', info)

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

  if (status === 'loading' && !name && !instructions && !info) {
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
      <CardContent className="flex-grow overflow-auto p-4 space-y-4">
        <div>
          <Label htmlFor="gptName">GPT Name</Label>
          <Input
            id="gptName"
            value={name}
            onChange={handleNameChange}
            placeholder="Enter GPT name"
            className="bg-blue-12 text-body-normal border-blue-24"
          />
        </div>
        <div>
          <Label htmlFor="gptInstructions">Instructions</Label>
          <div className="flex space-x-2">
            <Select onValueChange={handlePredefinedInstructionChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                {predefinedInstructions.map((instruction) => (
                  <SelectItem key={instruction.value} value={instruction.value}>
                    {instruction.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              id="gptInstructions"
              value={instructions}
              onChange={handleInstructionsChange}
              placeholder="Enter instructions for your GPT"
              className="flex-grow h-20 min-h-[80px] p-2 bg-blue-12 text-body-normal border-blue-24 rounded focus:border-blue-90 focus:ring-1 focus:ring-blue-90"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="gptInfo">Extracted Information</Label>
          <Textarea
            id="gptInfo"
            value={info}
            onChange={handleInfoChange}
            placeholder="Enter extracted information in JSON format"
            className="w-full h-64 min-h-[256px] p-2 bg-blue-12 text-body-normal border-blue-24 rounded focus:border-blue-90 focus:ring-1 focus:ring-blue-90"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t border-blue-24 pt-4">
        <Button 
          onClick={onPreviewClick}
          className="bg-blue-24 hover:text-black hover:bg-blue-90 text-body-loud"
        >
          Preview 
        </Button>
        <Button 
          onClick={handleTrain} 
          disabled={!enableTraining || isTraining}
          className="bg-blue-24 hover:bg-blue-90 text-body-loud disabled:opacity-50"
        >
          {isTraining ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isTraining ? 'Training...' : 'Train Digital Twin'}
        </Button>
      </CardFooter>
    </Card>
  )
}