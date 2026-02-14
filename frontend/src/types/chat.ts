export type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export type SessionResponse = {
  session_id: string;
};

export type ChatResponse = {
  message: string;
};
