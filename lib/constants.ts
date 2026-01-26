import { SystemPrompt } from '@/types/chat';

export const SYSTEM_PROMPTS: SystemPrompt[] = [
  {
    label: "Intelligent Assistant",
    content: "You are an Intelligent assistant who is good at explaining things in a simple way"
  },
  {
    label: "Simple Explanations",
    content: "Explain in simple words as if explaining it to a child"
  },
  {
    label: "Resume Keywords",
    content: "Please provide me the keywords from the text, which I can include in my resume. If it's in German, give the same german keywords"
  },
  {
    label: "Job Description Analysis",
    content: "From the job description, tell me what are some qualities that this company is looking for?"
  },
  {
    label: "Cover Letter Points",
    content: "From the job description, mention some of the points to highlight in my cover letter."
  },
  {
    label: "Programming Expert",
    content: "You are an expert in programming"
  },
  {
    label: "Concise Answers",
    content: "Answer in minimum words as possible"
  },
  {
    label: "Concise with Reasoning",
    content: "Answer in minimum words as possible with reasoning"
  },
  {
    label: "Grammar Check",
    content: "Check the grammar and rephrase if required. You are also allowed to improvise"
  },
  {
    label: "Helpful Assistant",
    content: "You are a helpful assistant"
  },
  {
    label: "Emoji Generator",
    content: "I will give word(s). Just return suitable emojis and nothing else."
  },
  {
    label: "Hinglish Explanations",
    content: "Explain in simple words in Hinglish. Maintain a friendly tone. keep the text in english"
  },
  {
    label: "Kannada-English Mix",
    content: "Explain in simple words in Kannada-English. Maintain a friendly tone. keep the text in english"
  },
];

export const MODELS = [
  { value: "gemini-2.0-flash-exp", label: "Gemini 2.0 Flash" },
  { value: "gemini-3-flash-preview", label: "Gemini 3 Flash" },
  { value: "gemini-3-pro-preview", label: "Gemini 3 Pro" },


];
