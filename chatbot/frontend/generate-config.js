import { writeFileSync } from 'fs';

// Get environment variables
const LLM_MODEL_NAME = process.env.LLM_MODEL_NAME || 'ai/mistral:7B-Q4_K_M';

// Create config content
const configContent = `// This file is generated during build - do not edit manually
export const ENV = {
  LLM_MODEL_NAME: "${LLM_MODEL_NAME}",
};
`;

// Write the config file
writeFileSync('app/config.server.js', configContent);

console.log('Configuration file generated with model:', LLM_MODEL_NAME);