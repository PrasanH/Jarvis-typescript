## How It Works

### Dynamic API Formatting

The application automatically detects which provider to use based on the selected model:

1. **Model Selection**: When a user selects a model, the system determines the provider:
   - Models starting with `gpt-`, `chatgpt-`, or `o` → OpenAI
   - Models starting with `gemini-` → Gemini
   - **Default Model**: GPT-4.1 Mini

2. **System Prompt Handling**:

   The application handles system prompts differently based on the provider:

   **OpenAI Models:**
   - System prompts are sent as separate `system` role messages
   - User messages remain clean without system prompt prepended
   - System messages are added at the beginning of the conversation
   - System messages are filtered from the UI display

   **Gemini Models:**
   - System prompts are prepended to user messages
   - Users can optionally click "Apply" button to add system prompt to their input
   - System prompt becomes part of the user's message content

3. **API Format Adaptation**:

   **OpenAI Format:**
   ```typescript
   {
     model: "gpt-4.1-mini",
     messages: [
       { role: "system", content: "You are a helpful assistant" },
       { role: "user", content: "Hello" },
       { role: "assistant", content: "Hi there!" }
     ]
   }
   ```

   **Gemini Format:**
   ```typescript
   {
     history: [
       { role: "user", parts: [{ text: "You are a helpful assistant\n\nHello" }] },
       { role: "model", parts: [{ text: "Hi there!" }] }
     ],
     message: "Latest message"
   }
   ```

4. **Response Handling**: Both APIs return responses in a unified format to the frontend.

### UI Features

- **Apply Button**: Only visible for Gemini models, allows users to manually prepend system prompt to their message
- **System Prompt Selector**: Available for all models with predefined prompts and custom prompt option
- **Model Selector**: Grouped by provider (OpenAI Models and Gemini Models)


