const API_BASE_URL = '';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  isAdmin: boolean;
}

export const api = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Login error:', errorText);
      throw new Error(errorText || 'Invalid credentials');
    }

    return response.json();
  },

  async getRounds(token: string) {
    const response = await fetch(`${API_BASE_URL}/api/v1/rounds`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch rounds');
    }

    return response.json();
  },

  async getRoundById(token: string, roundId: string) {
    const response = await fetch(`${API_BASE_URL}/api/v1/rounds/${roundId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch round');
    }

    return response.json();
  },

  async createRound(token: string) {
    const response = await fetch(`${API_BASE_URL}/api/v1/rounds`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to create round');
    }

    return response.json();
  },

  async tapGoose(token: string, roundId: string) {
    const response = await fetch(`${API_BASE_URL}/api/v1/rounds/${roundId}/tap`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to tap goose');
    }

    return response.json();
  },

  async getRoundStats(token: string, roundId: string) {
    const response = await fetch(`${API_BASE_URL}/api/v1/rounds/${roundId}/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }

    return response.json();
  },
};
