import axiosInstance from './axios';

export interface Question {
  id: number;
  // backend uses `question` field; keep `text` as optional alias for compatibility
  question: string;
  text?: string;
  shortForm?: string;
  description?: string;
}

export interface Challenge {
  id: string;
  challenge: string;
  description: string;
  currency_reward_points: number;
  time_variable: string;
  badge_image_theme: string;
  isActive?: boolean;
  currentStreak?: number;
  recommendationReasons?: string[];
}

export interface UserProfile {
  answers: Record<string, number>;
  activeHabits: Record<string, {
    challengeId: string;
    currentStreak: number;
    lastCompleted: string | null;
    timeHorizon: string;
  }>;
  walletBalance: number;
  totalImpact: number;
  stats: {
    currentStreak: number;
    longestStreak: number;
    totalChallengesCompleted: number;
    badges: Array<{
      id: string;
      title: string;
      icon: string;
      earnedAt: string;
      challengeId: string;
    }>;
  };
}

export interface Transaction {
  id: string;
  type: 'redeemed';
  amount: number;
  description: string;
  date: string;
}

export interface RedemptionOption {
  id: string;
  title: string;
  description: string;
  points: number;
  image: string;
}

class ApiClient {
  async getQuestions(): Promise<Question[]> {
    const response = await axiosInstance.get('/questions');
    return response.data;
  }

  async submitOnboarding(answers: Record<string, number>): Promise<void> {
    const response = await axiosInstance.post('/onboarding', { answers });
    return response.data;
  }

  async getUserProfile(): Promise<UserProfile> {
    const response = await axiosInstance.get('/user/profile');
    return response.data;
  }

  async getPersonalizedChallenges(): Promise<Challenge[]> {
    const response = await axiosInstance.get('/challenges/personalized');
    return response.data;
  }

  async getChallenge(challengeId: string): Promise<Challenge> {
    const response = await axiosInstance.get(`/challenges/${challengeId}`);
    return response.data;
  }

  async startChallenge(challengeId: string): Promise<Challenge> {
    const response = await axiosInstance.post(`/challenges/${challengeId}/start`);
    return response.data;
  }

  async completeChallenge(challengeId: string): Promise<{
    challenge: Challenge;
    reward: number;
    streak: number;
  }> {
    const response = await axiosInstance.post(`/challenges/${challengeId}/complete`);
    return response.data;
  }

  async getWalletTransactions(): Promise<Transaction[]> {
    const response = await axiosInstance.get('/wallet/transactions');
    return response.data;
  }

  async redeemReward(amount: number, description: string): Promise<Transaction> {
    const response = await axiosInstance.post('/wallet/redeem', { amount, description });
    return response.data;
  }

  async getRedemptionOptions(): Promise<RedemptionOption[]> {
    const response = await axiosInstance.get('/wallet/redemptions');
    return response.data;
  }

  async getUserStats(): Promise<UserProfile['stats']> {
    const response = await axiosInstance.get('/user/stats');
    return response.data;
  }

  async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const response = await axiosInstance.put('/user/profile', updates);
    return response.data;
  }
}

const api = new ApiClient();
export { api };
export default api;