'use client'

import {configureStore} from '@reduxjs/toolkit'
import  chatReducer  from './features/chatSlice'
import configReducer  from './features/configSlice'

export const store = configureStore({
    reducer: {
        chat: chatReducer,
        config: configReducer,
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch