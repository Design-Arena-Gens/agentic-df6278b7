export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'taskflow-secret',
  expiresIn: '12h'
}

export const openAIConfig = {
  model: process.env.OPENAI_MODEL || 'gpt-4o-mini'
}
