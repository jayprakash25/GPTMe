'use client'

import { createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import axios from 'axios'

interface ConfigState {
  extractedInfo: string
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: ConfigState = {
  extractedInfo: '',
  status: 'idle',
  error: null,
}

export const fetchConfiguration = createAsyncThunk(
  'config/fetchConfiguration',
  async () => {
    const response = await axios.get('/api/configure')
    return response.data.data.extractedInfo
  }
)

export const updateConfiguration = createAsyncThunk(
  'config/updateConfiguration',
  async (extractedInfo: string) => {
    const response = await axios.put('/api/configure', { extractedInfo })
    return response.data.data.extractedInfo
  }
)

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchConfiguration.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchConfiguration.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.extractedInfo = action.payload
      })
      .addCase(fetchConfiguration.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to fetch configuration'
      })
      .addCase(updateConfiguration.fulfilled, (state, action) => {
        state.extractedInfo = action.payload
      })
  },
})

export default configSlice.reducer