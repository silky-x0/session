import OpenAI from 'openai';
import { config } from './env'

export const openai = new OpenAI({
  apiKey: config.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

