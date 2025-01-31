export function sanitizeInput(input: string): string {
  return (
    input
      // Remove any HTML tags
      .replace(/<[^>]*>/g, '')
      // Remove special characters but keep basic punctuation
      .replace(/[^\w\s.,!?'"()-]/g, '')
      // Remove multiple spaces
      .replace(/\s+/g, ' ')
      // Trim whitespace
      .trim()
      // Limit length
      .slice(0, 1000)
  );
}

export function sanitizePrompt(prompt: string): string {
  return (
    prompt
      // Remove potential prompt injection attempts
      .replace(/(system:|assistant:|user:)/gi, '')
      // Remove markdown formatting
      .replace(/[`*_~]/g, '')
      // Remove URLs
      .replace(/https?:\/\/\S+/g, '')
      // Remove email addresses
      .replace(/[\w.-]+@[\w.-]+\.\w+/g, '')
      // Remove multiple newlines
      .replace(/\n{3,}/g, '\n\n')
      // Trim whitespace
      .trim()
  );
}
