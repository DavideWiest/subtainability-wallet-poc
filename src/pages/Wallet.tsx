import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockRewards } from '@/lib/mockData';
import {
  ArrowLeft,
  Wallet as WalletIcon,
  Coins,
  TreePine,
  Tag,
  Cloud,
  Percent,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

const iconMap: Record<string, any> = {
  TreePine,
  Tag,
  Cloud,
  Percent,
};

const Wallet = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(450);
  const [claimableRewards, setClaimableRewards] = useState<string[]>([]);

  useEffect(() => {
    const savedBalance = localStorage.getItem('walletBalance');
    if (savedBalance) {
      setBalance(parseInt(savedBalance));
    }
    const saved = localStorage.getItem('claimableRewards');
    if (saved) {
      setClaimableRewards(JSON.parse(saved));
    }
  }, []);

  const handleRedeem = (reward: any) => {
    if (balance < reward.cost) {
      toast.error('Insufficient balance!');
      return;
    }

    const newBalance = balance - reward.cost;
    setBalance(newBalance);
    localStorage.setItem('walletBalance', newBalance.toString());

    // Add to claimable rewards
    const newClaimable = [...claimableRewards, reward.id];
    setClaimableRewards(newClaimable);
    localStorage.setItem('claimableRewards', JSON.stringify(newClaimable));

    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#10b981', '#f59e0b', '#3b82f6'],
    });

    toast.success(
      <div>
        <p className="font-semibold">Reward Redeemed! 🎉</p>
        <p className="text-sm">{reward.title} is now ready to claim</p>
      </div>,
      { duration: 4000 }
    );
  };

  const handleClaimReward = (rewardId: string) => {
    const newClaimable = claimableRewards.filter((id) => id !== rewardId);
    setClaimableRewards(newClaimable);
    localStorage.setItem('claimableRewards', JSON.stringify(newClaimable));

    toast.success('Reward claimed successfully! Check your email for details.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
      <div className="container mx-auto p-4 md:p-8 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="animate-slide-up">
          {/* Balance Card */}
          <Card className="p-8 mb-8 bg-gradient-primary text-primary-foreground shadow-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-2">Your Balance</p>
                <div className="flex items-center gap-3">
                  <Coins className="w-12 h-12 animate-coin-flip" />
                  <p className="text-5xl font-bold">{balance}</p>
                  <span className="text-2xl opacity-90">coins</span>
                </div>
              </div>
              <WalletIcon className="w-16 h-16 opacity-50" />
            </div>
          </Card>

          {/* Claimable Rewards Section */}
          {claimableRewards.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-accent" />
                Ready to Claim
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockRewards
                  .filter((r) => claimableRewards.includes(r.id))
                  .map((reward) => {
                    const Icon = iconMap[reward.icon] || Tag;
                    return (
                      <Card
                        key={reward.id}
                        className="p-6 bg-gradient-accent border-accent shadow-lg"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 rounded-full bg-accent-foreground/10 flex items-center justify-center">
                            <Icon className="w-6 h-6 text-accent-foreground" />
                          </div>
                          <Badge className="bg-accent-foreground text-accent">
                            Ready
                          </Badge>
                        </div>
                        <h3 className="text-xl font-semibold text-accent-foreground mb-2">
                          {reward.title}
                        </h3>
                        <p className="text-sm text-accent-foreground/80 mb-4">
                          {reward.description}
                        </p>
                        <Button
                          onClick={() => handleClaimReward(reward.id)}
                          variant="secondary"
                          className="w-full"
                        >
                          Claim Now
                        </Button>
                      </Card>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Available Rewards */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">Available Rewards</h2>
            <p className="text-muted-foreground mb-6">
              Redeem your coins for real-world impact and exclusive offers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockRewards.map((reward, index) => {
              const Icon = iconMap[reward.icon] || Tag;
              const canAfford = balance >= reward.cost;
              const isClaimed = claimableRewards.includes(reward.id);

              return (
                <Card
                  key={reward.id}
                  className={`p-6 bg-gradient-card hover:shadow-lg transition-all animate-slide-up ${
                    isClaimed ? 'opacity-50' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <Badge variant={canAfford ? 'default' : 'secondary'}>
                      <Coins className="w-3 h-3 mr-1" />
                      {reward.cost}
                    </Badge>
                  </div>

                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {reward.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 min-h-[3rem]">
                    {reward.description}
                  </p>

                  <Button
                    onClick={() => handleRedeem(reward)}
                    disabled={!canAfford || isClaimed}
                    className="w-full"
                    variant={canAfford ? 'default' : 'outline'}
                  >
                    {isClaimed ? 'Claimed' : canAfford ? 'Redeem' : 'Not Enough Coins'}
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
