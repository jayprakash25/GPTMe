'use client'

import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import axios from 'axios'
import { getSession } from 'next-auth/react'


interface Message {
    role: 'user' | 'assistant' | 'system',
    content: string,
    isNew?: boolean
    name?: string,
}

interface ChatState {
    messages: Message[],
    status: 'idle' | 'loading' | 'succeeded' | 'failed',
    error: string | null,
    conversationStatus: 'in_progress' | 'completed',
}

const initialState: ChatState = {
    messages: [],
    status: 'idle',
    error: null,
    conversationStatus: 'in_progress',
}

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL

const getAuthToken = async () => {
  const session = await getSession()

  if (!session || !session.accessToken) {
    console.log('No active session found')
    throw new Error('No active session found')
  }

  return session.accessToken
}
export const fetchConversationHistory = createAsyncThunk(
  'chat/fetchConversationHistory',
  async (_, { rejectWithValue }) => {
    try {
      const token = await getAuthToken()
      const response = await axios.post(`${WORKER_URL}/api/conversation`, 
        { action: 'fetch_history' },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      return response.data.data
    } catch (error) {
      return rejectWithValue('Failed to fetch conversation history')
    }
  }
)

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (message: string, { rejectWithValue }) => {
    try {
      const token = await getAuthToken()
      if (!token) {
        throw new Error('No active session found')
      }

      console.log('Sending message with token: ', token)
      const response = await axios.post(`${WORKER_URL}/api/conversation`, 
        { message },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      return response.data.data
    } catch (error) {
        console.error('Error sending message:', error)
      return rejectWithValue('Failed to send message')
    }
  }
)

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        addMessage(state, action: PayloadAction<Message>){
            state.messages.push(action.payload)
        },
            setConversationStatus(state, action: PayloadAction<'in_progress' | 'completed'>){
                state.conversationStatus = action.payload
        },
    },
    extraReducers: (builder) => {
        builder
          .addCase(fetchConversationHistory.pending, (state) => {
            state.status = 'loading'
          })
          .addCase(fetchConversationHistory.fulfilled, (state, action) => {
            state.status = 'succeeded'
            state.messages = action.payload.messages || []
            state.conversationStatus = action.payload.status
            if (state.messages.length === 0) {
              state.messages.push({
                role: 'assistant',
                content: "Hey there! I'm here to learn all about you, so I can become your digital twin. Ready to start this journey together?",
                isNew: false,
              })
            }
          })
          .addCase(fetchConversationHistory.rejected, (state, action) => {
            state.status = 'failed'
            state.error = action.error.message || 'Failed to fetch conversation history'
          })
          .addCase(sendMessage.fulfilled, (state, action) => {
            state.messages.push({
              role: 'assistant',
              content: action.payload.aiResponse,
              isNew: true,
            })
            state.conversationStatus = action.payload.status
          })
      },
})

export const { addMessage, setConversationStatus } = chatSlice.actions
export default chatSlice.reducer