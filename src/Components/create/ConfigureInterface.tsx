'use client'

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Textarea } from "@/Components/ui/textarea"
import { Button } from "@/Components/ui/button"
import { useToast } from '@/hooks/use-toast'
import ReactMarkdown from 'react-markdown'
import { RootState, AppDispatch } from '@/redux/store'
import { fetchConfiguration, updateConfiguration } from '@/redux/features/configSlice'

export default function ConfigureInterface() {
  const dispatch = useDispatch<AppDispatch>()
  const { extractedInfo, status, error } = useSelector((state: RootState) => state.config)
  const [isEditing, setIsEditing] = useState(false)
  const [editedInfo, setEditedInfo] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchConfiguration())
    }
  }, [dispatch, status])

  useEffect(() => {
    setEditedInfo(extractedInfo)
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
    } catch (error) {
      console.error("Error updating configuration:", error)
      toast({
        title: "Update Failed",
        description: "There was an error updating your configuration.",
        variant: "destructive"
      })
    }
  }

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (status === 'failed') {
    return <div>Error: {error}</div>
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={editedInfo}
            onChange={handleChange}
            placeholder="Enter your configuration in Markdown format"
            rows={20}
            className="w-full p-2 border rounded"
          />
          <div className="flex space-x-4">
            <Button type="submit" className="flex-1">Update Configuration</Button>
            
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>Cancel</Button>
          </div>
        </form>
      )}
    </div>
  )
}