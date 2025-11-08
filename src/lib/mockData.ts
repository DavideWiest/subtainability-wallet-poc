// Mock data types
export interface OnboardingQuestion {
  id: string;
  question: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  recurrence: 'daily' | 'weekly' | 'monthly';
  reward: number;
  streak: number;
  icon: string;
  category: string;
  lastCompleted?: string;
}

export interface RewardItem {
  id: string;
  title: string;
  description: string;
  cost: number;
  icon: string;
  type: 'tree' | 'discount' | 'other';
}

// Mock onboarding questions
export const mockOnboardingQuestions: OnboardingQuestion[] = [
  { id: '1', question: 'Are you interested in reducing your carbon footprint?' },
  { id: '2', question: 'Do you want to develop sustainable daily habits?' },
  { id: '3', question: 'Would you like to track your environmental impact?' },
  { id: '4', question: 'Are you interested in community challenges?' },
  { id: '5', question: 'Do you want to earn rewards for eco-friendly actions?' },
];

// Mock challenges
export const mockChallenges: Challenge[] = [
  {
    id: '1',
    title: 'Zero Waste Day',
    description: 'Avoid single-use plastics for an entire day',
    recurrence: 'daily',
    reward: 50,
    streak: 7,
    icon: 'Recycle',
    category: 'Waste Reduction',
  },
  {
    id: '2',
    title: 'Plant-Based Meals',
    description: 'Eat only plant-based meals today',
    recurrence: 'daily',
    reward: 30,
    streak: 3,
    icon: 'Leaf',
    category: 'Diet',
  },
  {
    id: '3',
    title: 'Public Transport',
    description: 'Use public transport or bike instead of driving',
    recurrence: 'daily',
    reward: 40,
    streak: 12,
    icon: 'Bus',
    category: 'Transportation',
  },
  {
    id: '4',
    title: 'Energy Conservation',
    description: 'Reduce electricity usage by 20%',
    recurrence: 'weekly',
    reward: 100,
    streak: 4,
    icon: 'Zap',
    category: 'Energy',
  },
  {
    id: '5',
    title: 'Local Shopping',
    description: 'Buy from local farmers markets',
    recurrence: 'weekly',
    reward: 80,
    streak: 2,
    icon: 'ShoppingBag',
    category: 'Shopping',
  },
];

// Mock reward items
export const mockRewards: RewardItem[] = [
  {
    id: '1',
    title: 'Plant a Tree',
    description: 'Plant a real tree through our partner organizations',
    cost: 500,
    icon: 'TreePine',
    type: 'tree',
  },
  {
    id: '2',
    title: '10% Discount',
    description: 'Get 10% off eco-friendly products',
    cost: 200,
    icon: 'Tag',
    type: 'discount',
  },
  {
    id: '3',
    title: 'Carbon Offset',
    description: 'Offset 100kg of CO2 emissions',
    cost: 300,
    icon: 'Cloud',
    type: 'other',
  },
  {
    id: '4',
    title: '20% Discount',
    description: 'Get 20% off sustainable brands',
    cost: 400,
    icon: 'Percent',
    type: 'discount',
  },
];
