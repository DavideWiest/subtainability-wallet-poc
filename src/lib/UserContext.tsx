import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { UserProfile, api } from '@/lib/api';
import { toast } from 'sonner';
import useAuthStore from '@/lib/useAuthStore';

interface UserContextType {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
  error: null,
  updateUser: async () => {},
  refreshUser: async () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOnboarded } = useAuthStore();

  const loadUser = async () => {
    if (!isOnboarded) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const profile = await api.getUserProfile();
      setUser(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
      setError('Failed to load user profile');
      toast.error('Failed to load user profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [isOnboarded]);

  const updateUser = async (updates: Partial<UserProfile>) => {
    try {
      const updatedProfile = await api.updateUserProfile(updates);
      setUser(updatedProfile);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
      throw error;
    }
  };

  const value = useMemo(() => ({
    user,
    isLoading,
    error,
    updateUser,
    refreshUser: loadUser,
  }), [user, isLoading, error]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}