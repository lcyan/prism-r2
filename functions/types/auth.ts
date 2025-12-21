export interface GitHubUser {
  id: number;
  login: string;
  name: string;
  avatar_url: string;
  email?: string;
}

export interface JWTPayload {
  userId: number;
  login: string;
  name: string;
  avatar: string;
  exp: number;
}

export interface SessionResponse {
  authenticated: boolean;
  user?: {
    id: number;
    login: string;
    name: string;
    avatar: string;
  };
  error?: string;
}
