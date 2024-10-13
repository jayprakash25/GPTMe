'use client'

import React from 'react'
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/Components/ui/card"

interface InChatFloatingCardProps {
  onAddNewInfo: () => void
  onConfigureClick: () => void
}

export default function FloatingCard({ onAddNewInfo, onConfigureClick }: InChatFloatingCardProps) {


  return (
    <div className="animate-fade-in-up">
      <Card className="w-full max-w-md mx-auto bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-sm border-primary/20 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-primary">Conversation Completed</CardTitle>
          <CardDescription>What would you like to do next?</CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm text-muted-foreground">
            You can add more information or finalize your configuration.
          </p>
        </CardContent>
        <CardFooter className="flex justify-between pt-2">
          <Button variant="outline" onClick={onAddNewInfo} className="flex-1 mr-2">
            Add New Information
          </Button>
          <Button onClick={onConfigureClick} className="flex-1 ml-2">
            Configure
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}