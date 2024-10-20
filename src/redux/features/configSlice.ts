"use client";

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getSession } from "next-auth/react";

interface GptConfig {
  name: string;
  instructions: string;
  extractedInfo: Record<string, any>;
}

interface ConfigState {
  config: GptConfig | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ConfigState = {
  config: null,
  status: "idle",
  error: null,
};

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL;

const getAuthToken = async () => {
  const session = await getSession();

  if (!session || !session.accessToken) {
    console.log("No active session found");
    throw new Error("No active session found");
  }

  return session.accessToken;
};

export const fetchConfiguration = createAsyncThunk(
  "config/fetchConfiguration",
  async (_, { rejectWithValue }) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("No active session found");
      }
      const response = await axios.get(`${WORKER_URL}/api/gpt-config`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.data;
    } catch (error) {
      return rejectWithValue("Failed to fetch configuration");
    }
  }
);

export const updateConfiguration = createAsyncThunk(
  "config/updateConfiguration",
  async (config: GptConfig, { rejectWithValue }) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("No active session found");
      }

      const response = await axios.put(
        `${WORKER_URL}/api/gpt-config`,
        config,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue("Failed to update configuration");
    }
  }
);

const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchConfiguration.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchConfiguration.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.config = action.payload;
      })
      .addCase(fetchConfiguration.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch configuration";
      })
      .addCase(updateConfiguration.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateConfiguration.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.config = action.payload;
      })
      .addCase(updateConfiguration.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to update configuration";
      });
  },
});

export default configSlice.reducer;
