'use client';

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Brain, Share2, MessageSquare, Sparkles, ChevronRight, ArrowRightIcon, Star } from 'lucide-react'
import { cn } from "@/lib/utils"
import AnimatedShinyText from '@/components/ui/animated-shiny-text';

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [isIntersecting, setIsIntersecting] = useState(false)
  const featuresRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      { threshold: 0.1 }
    )

    if (featuresRef.current) {
      observer.observe(featuresRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const features = [
    { 
      icon: <Brain className="w-6 h-6" />, 
      title: 'Personal Memory AI', 
      description: 'Store and retrieve your memories, important dates, and knowledge through natural conversations.' 
    },
    { 
      icon: <Share2 className="w-6 h-6" />, 
      title: 'Digital Twin', 
      description: 'Create an AI version of yourself that others can chat with, sharing your thoughts and personality.' 
    },
    { 
      icon: <MessageSquare className="w-6 h-6" />, 
      title: 'Shareable Chat', 
      description: 'Share your AI twin with friends through a simple link, letting them interact with your digital self.' 
    },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 overflow-hidden antialiased">
      {/* Subtle Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] 
          bg-indigo-500/5 rounded-full blur-[150px] opacity-20" />
        <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] 
          bg-purple-500/5 rounded-full blur-[150px] opacity-20" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-indigo-400" />
            <span className="text-xl font-semibold">MemoryAI</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" className="hidden sm:inline-flex">How it Works</Button>
            <Button variant="ghost" className="hidden sm:inline-flex">Examples</Button>
            <Button 
              className="bg-zinc-900 hover:bg-zinc-800 
                text-zinc-100 border border-zinc-800 transition-colors duration-300"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 space-y-24 md:space-y-32">
        {/* Hero Section - Adjusted to be higher on the page */}
        <section className="relative text-center pt-16 md:pt-24 pb-16 space-y-8">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] 
            bg-indigo-500/5 rounded-full blur-[120px] opacity-20 pointer-events-none" />
          
          <div className="relative space-y-4">
            <div className="z-10 flex min-h-32 items-center justify-center">
              <div
                className={cn(
                  "group rounded-full border border-zinc-800 bg-zinc-900/80 text-base backdrop-blur-sm",
                )}
              >
                <AnimatedShinyText className="inline-flex bg-white items-center justify-center px-4 py-1">
                  <span>✨ Your Personal AI Memory Assistant</span>
                </AnimatedShinyText>
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-200 to-zinc-400">
              Never Forget,<br />Always Connected
            </h1>
            <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto">
              Create your digital twin that remembers everything and can chat with your friends, 
              while keeping your personal memories private and accessible.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Input 
              type="email" 
              placeholder="Enter your email" 
              className="w-full sm:w-64 bg-zinc-900/50 border-zinc-800 
                focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all duration-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button className="w-full sm:w-auto bg-indigo-500/10 hover:bg-indigo-500/20 
              text-indigo-200 border border-indigo-500/20 transition-all duration-300 group">
              Start for Free 
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </div>
        </section>

        {/* Demo Section - Now closer to the hero section */}
        <section className="relative rounded-xl overflow-hidden">
          <div className="aspect-[16/9] relative rounded-xl overflow-hidden 
            bg-zinc-900/80 border border-zinc-800/50 backdrop-blur-sm">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full max-w-2xl space-y-4 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-zinc-400">When's John's birthday?</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-indigo-300" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-zinc-200">John's birthday is on March 15th. You added this to your memories last month.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section ref={featuresRef} className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className={`bg-zinc-900/50 border-zinc-800/50 backdrop-blur-sm 
                hover:bg-zinc-800/50 transition-all duration-500
                group relative overflow-hidden
                ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 
                group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-lg bg-zinc-800/80 ring-1 ring-zinc-700/50 
                    group-hover:bg-indigo-500/10 group-hover:ring-indigo-500/20 transition-colors duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-transparent bg-gradient-to-r bg-clip-text from-zinc-200 to-zinc-400">{feature.title}</h3>
                </div>
                <p className="text-zinc-400">{feature.description}</p>
              </div>
            </Card>
          ))}
        </section>

        {/* Testimonial Section */}
        <section className="relative">
          <div className="absolute inset-0 bg-indigo-500/5 rounded-2xl blur-3xl opacity-30" />
          <div className="relative bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm rounded-xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <Image
                  src="/placeholder.svg"
                  alt="User Avatar"
                  width={100}
                  height={100}
                  className="rounded-full"
                />
              </div>
              <div className="text-center md:text-left">
                <p className="text-lg md:text-xl italic mb-4">
                  "MemoryAI has revolutionized the way I manage my personal and professional life. 
                  It's like having a digital twin that remembers everything for me!"
                </p>
                <div className="font-semibold">Sarah Johnson</div>
                <div className="text-zinc-400">CEO, TechInnovate</div>
                <div className="flex items-center justify-center md:justify-start mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center space-y-8">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            Ready to Build Your Digital Twin?
          </h2>
          <p className="text-zinc-400">Join thousands of users who trust their memories to AI</p>
          <Button 
            size="lg"
            className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-200 
              border border-indigo-500/20 group transition-all duration-300"
          >
            Get Started Now 
            <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </section>
      </main>

      <footer className="border-t border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm mt-32">
        <div className="container mx-auto px-4 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-400" />
            <span className="font-semibold">MemoryAI</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="text-zinc-400 hover:text-zinc-200 transition-colors duration-300">Privacy</a>
            <a href="#" className="text-zinc-400 hover:text-zinc-200 transition-colors duration-300">Terms</a>
            <a href="#" className="text-zinc-400 hover:text-zinc-200 transition-colors duration-300">Contact</a>
          </div>
          <p className="text-sm text-zinc-400">&copy; 2024 MemoryAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}