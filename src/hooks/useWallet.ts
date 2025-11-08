import { useState, useEffect, useCallback } from 'react';
import { api, Transaction, RedemptionOption } from '@/lib/api';
import { toast } from 'sonner';

export function useWallet() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [redemptionOptions, setRedemptionOptions] = useState<RedemptionOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadWalletData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [profile, transactionsRes, redemptionsRes] = await Promise.all([
        api.getUserProfile(),
        api.getWalletTransactions(),
        api.getRedemptionOptions()
      ]);
      
      setBalance(profile.walletBalance || 0);
      setTransactions(transactionsRes);
      setRedemptionOptions(redemptionsRes);
    } catch (error) {
      toast.error('Failed to load wallet data');
      console.error('Error loading wallet data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWalletData();
  }, [loadWalletData]);

  const redeem = async (option: RedemptionOption) => {
    if (balance < option.points) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      await api.redeemReward(option.points, option.title);
      toast.success('Reward redeemed successfully!');
      loadWalletData(); // Reload wallet data
    } catch (error) {
      toast.error('Failed to redeem reward');
      console.error('Error redeeming reward:', error);
    }
  };

  const getAvailableRedemptions = () => {
    return redemptionOptions.filter(option => option.points <= balance);
  };

  return {
    balance,
    transactions,
    redemptionOptions,
    isLoading,
    redeem,
    getAvailableRedemptions,
    loadWalletData
  };
}