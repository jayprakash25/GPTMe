import React, { useEffect, useState } from 'react'

const TypingEffect = ({ text }: { text: string }) => {
    const [displayedText, setDisplayedText] = useState('')
    const [currentIndex, setCurrentIndex] = useState(0)
  
    useEffect(() => {
      if (currentIndex < text.length) {
        const timeout = setTimeout(() => {
          setDisplayedText(prev => prev + text[currentIndex])
          setCurrentIndex(prev => prev + 1)
        }, 30) // Adjust the typing speed here (lower value = faster)
  
        return () => clearTimeout(timeout)
      }
    }, [text, currentIndex])
  
    return <>{displayedText}</>
}

export default TypingEffect