import { useState, useEffect, useCallback } from 'react';
import { api, Challenge } from '@/lib/api';
import { toast } from 'sonner';

export function useChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeHabits, setActiveHabits] = useState<Record<string, {
    currentStreak: number;
    lastCompleted: string | null;
  }>>({});

  const loadChallenges = useCallback(async () => {
    setIsLoading(true);
    try {
      const [challengesRes, profileRes] = await Promise.all([
        api.getPersonalizedChallenges(),
        api.getUserProfile()
      ]);
      
      setChallenges(challengesRes);
      setActiveHabits(profileRes.activeHabits || {});
    } catch (error) {
      toast.error('Failed to load challenges');
      console.error('Error loading challenges:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  const markChallengeComplete = async (challengeId: string) => {
    try {
      const result = await api.completeChallenge(challengeId);
      toast.success(`Challenge completed! +${result.reward} points`);
      
      // Optimistically update the streak
      setActiveHabits(prev => ({
        ...prev,
        [challengeId]: {
          ...prev[challengeId],
          currentStreak: result.streak,
          lastCompleted: new Date().toISOString()
        }
      }));
      
      // Reload the challenges to get the latest state
      loadChallenges();
      
      return result;
    } catch (error) {
      toast.error('Failed to complete challenge');
      console.error('Error completing challenge:', error);
      throw error;
    }
  };

  const getStreakInfo = (challengeId: string) => {
    const habit = activeHabits[challengeId];
    if (!habit) return { currentStreak: 0, lastCompleted: null };
    return {
      currentStreak: habit.currentStreak,
      lastCompleted: habit.lastCompleted
    };
  };

  const isStreakActive = (challengeId: string) => {
    const { lastCompleted } = getStreakInfo(challengeId);
    if (!lastCompleted) return true;

    const lastCompletedDate = new Date(lastCompleted);
    const now = new Date();
    const daysSinceLastCompleted = (now.getTime() - lastCompletedDate.getTime()) / (1000 * 60 * 60 * 24);

    return daysSinceLastCompleted <= 7; // Allow 7 days before breaking streak
  };

  return {
    challenges,
    isLoading,
    markChallengeComplete,
    getStreakInfo,
    isStreakActive,
    loadChallenges
  };
}