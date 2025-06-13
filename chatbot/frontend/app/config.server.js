export function getConfig() {
  return {
    LLM_MODEL_NAME: typeof process !== 'undefined' ? 
      process.env.LLM_MODEL_NAME || 'ai/mistral:7B-Q4_K_M' : 
      'ai/mistral:7B-Q4_K_M'
  };
}