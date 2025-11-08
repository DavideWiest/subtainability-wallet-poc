import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api, { Challenge } from '@/lib/api';
import { 
  Flame, 
  Coins, 
  TrendingUp, 
  Wallet,
  Award,
  Plus
} from 'lucide-react';

// Dashboard now uses backend Challenge shape; icons are not currently mapped

const Dashboard = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [selectedChallengeIds, setSelectedChallengeIds] = useState<string[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [chals, profile] = await Promise.all([
          api.getPersonalizedChallenges(),
          api.getUserProfile()
        ]);
        setChallenges(chals);
        setBalance(profile.walletBalance || 0);
        const activeIds = Object.keys(profile.activeHabits || {});
        setSelectedChallengeIds(activeIds);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      }
    };
    load();
  }, []);

  const activeChallenges = challenges.filter(c =>
    selectedChallengeIds.length === 0 || selectedChallengeIds.includes(c.id)
  );

  const totalStreak = activeChallenges.reduce((sum, c) => sum + (c.currentStreak || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
      <div className="container mx-auto p-4 md:p-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Your Challenges</h1>
              <p className="text-muted-foreground">Keep up the great work! 🌱</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate('/browse-challenges')}
                className="gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Challenge
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/wallet')}
                className="gap-2"
              >
                <Wallet className="w-5 h-5" />
                Wallet
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-6 bg-gradient-card border-primary/20 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Streak</p>
                  <p className="text-3xl font-bold text-primary">{totalStreak} days</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-primary animate-streak-glow" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-card border-secondary/20 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Wallet Balance</p>
                  <p className="text-3xl font-bold text-secondary">{balance} coins</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Coins className="w-6 h-6 text-secondary" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-card border-secondary/20 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Challenges</p>
                  <p className="text-3xl font-bold text-secondary">{activeChallenges.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-secondary" />
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Challenges Grid */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Your Active Challenges</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeChallenges.length === 0 ? (
            <Card className="col-span-full p-12 bg-gradient-card text-center">
              <p className="text-lg text-muted-foreground mb-4">No active challenges yet</p>
              <Button onClick={() => navigate('/browse-challenges')} className="bg-gradient-primary">
                <Plus className="w-5 h-5 mr-2" />
                Browse Challenges
              </Button>
            </Card>
          ) : (
            activeChallenges.map((challenge, index) => {
            return (
              <Card
                key={challenge.id}
                className="p-6 bg-gradient-card hover:shadow-lg transition-all cursor-pointer group animate-slide-up border-l-4 border-l-primary"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => navigate(`/challenge/${challenge.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <span className="text-primary font-medium">{challenge.challenge?.charAt(0) ?? '?'}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {challenge.time_variable}
                  </Badge>
                </div>

                <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {challenge.challenge}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {challenge.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-foreground">{challenge.currentStreak || 0} day streak</span>
                  </div>
                  <div className="flex items-center gap-1 text-secondary font-semibold">
                    <Coins className="w-5 h-5" />
                    {challenge.currency_reward_points}
                  </div>
                </div>
              </Card>
            );
          })
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
