'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from '@/hooks/use-toast'
import { RootState, AppDispatch } from '@/redux/store'
import { fetchConfiguration, updateConfiguration } from '@/redux/features/configSlice'
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Loader2, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import axios from 'axios'
import ReactMarkdown from 'react-markdown'

interface ConfigureInterfaceProps {
  onPreviewClick: () => void
}

const predefinedInstructions = [
  { value: "friendly", label: "Friendly and Approachable", instruction: "Respond in a friendly and approachable manner, using casual language and a positive tone." },
  { value: "professional", label: "Professional and Formal", instruction: "Maintain a professional and formal tone in all responses, using industry-standard terminology when appropriate." },
  { value: "concise", label: "Concise and Direct", instruction: "Provide brief, to-the-point responses that directly address the user's query without unnecessary elaboration." },
  { value: "detailed", label: "Detailed and Thorough", instruction: "Offer comprehensive responses that cover all aspects of the user's query, providing examples and explanations where necessary." },
]

function useDebounce(func: (...args: any[]) => void, delay: number) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
      <Card className="w-full h-[75vh] flex items-center justify-center bg-gray-900 border-gray-700">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </Card>
    )
  }

  if (status === 'failed') {
    return (
      <Card className="w-full h-[75vh] flex items-center justify-center bg-gray-900 border-gray-700">
        <CardContent>
          <p className="text-red-500">Error: {error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full h-[calc(100vh-4rem)] sm:h-[calc(100vh-8rem)] flex flex-col bg-zinc-950 border-zinc-800/50 text-zinc-100 rounded-xl overflow-hidden">
      <CardContent className="flex-grow overflow-auto p-4 space-y-6">
        <div>
          <Label htmlFor="gptName" className="text-sm font-medium text-zinc-300 mb-1 block">GPT Name</Label>
          <Input
            id="gptName"
            value={name}
            onChange={handleNameChange}
            placeholder="Enter GPT name"
            className="w-full bg-zinc-800/50 text-zinc-100 border-zinc-700/50 
              focus:border-indigo-500/50 focus:ring-indigo-500/20 
              placeholder-zinc-400 transition-colors duration-200"
          />
        </div>
        <div>
          <Label htmlFor="gptInstructions" className="text-sm font-medium text-zinc-300 mb-1 block">Instructions</Label>
          <div className="flex flex-col space-y-2">
            <Select onValueChange={handlePredefinedInstructionChange}>
              <SelectTrigger className="w-full bg-zinc-800/50 text-zinc-100 border-zinc-700/50 hover:bg-zinc-700/50">
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 text-zinc-100 border-zinc-700/50">
                {predefinedInstructions.map((instruction) => (
                  <SelectItem 
                    key={instruction.value} 
                    value={instruction.value} 
                    className="hover:bg-zinc-800/50 focus:bg-zinc-800/50"
                  >
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
              className="w-full h-32 min-h-[128px] p-2 bg-zinc-800/50 
                text-zinc-100 border-zinc-700/50 rounded-lg 
                focus:border-indigo-500/50 focus:ring-indigo-500/20 
                placeholder-zinc-400 resize-none transition-colors duration-200"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="gptInfo" className="text-sm font-medium text-zinc-300 mb-1 block">Extracted Information</Label>
          <Textarea
            id="gptInfo"
            value={info}
            onChange={handleInfoChange}
            placeholder="Enter extracted information in JSON format"
            className="w-full h-64 min-h-[256px] p-2 bg-zinc-800/50 
              text-zinc-100 border-zinc-700/50 rounded-lg 
              focus:border-indigo-500/50 focus:ring-indigo-500/20 
              placeholder-zinc-400 resize-none transition-colors duration-200
              font-mono text-sm"
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center border-t border-zinc-800/50 bg-zinc-900/30 p-4 space-y-4 sm:space-y-0 sm:space-x-4">
        <Button 
          onClick={onPreviewClick}
          className="w-full sm:w-auto bg-zinc-800/50 hover:bg-zinc-700/50 
            text-zinc-100 border border-zinc-700/50 transition-colors duration-200"
        >
          Preview 
        </Button>
        <Button 
          onClick={handleTrain} 
          disabled={!enableTraining || isTraining}
          className="w-full sm:w-auto bg-indigo-500/10 hover:bg-indigo-500/20 
            text-indigo-200 border border-indigo-500/20
            transition-colors duration-200 
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isTraining ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isTraining ? 'Training...' : 'Train Digital Twin'}
        </Button>
      </CardFooter>
    </Card>
  )
}