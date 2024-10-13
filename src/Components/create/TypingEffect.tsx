import React, { useState, useEffect } from 'react'

interface TypingEffectProps {
  text: string
}

const TypingEffect: React.FC<TypingEffectProps> = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prevText => prevText + text[currentIndex])
        setCurrentIndex(prevIndex => prevIndex + 1)
      }, 20) // Adjust the typing speed here

      return () => clearTimeout(timer)
    }
  }, [currentIndex, text])

  return <span>{displayedText}</span>
}

export default TypingEffect