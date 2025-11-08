import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockChallenges } from '@/lib/mockData';
import {
  ArrowLeft,
  Flame,
  Coins,
  CheckCircle2,
  Calendar,
  TrendingUp,
  Award,
  Recycle,
  Leaf,
  Bus,
  Zap,
  ShoppingBag,
} from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

const iconMap: Record<string, any> = {
  Recycle,
  Leaf,
  Bus,
  Zap,
  ShoppingBag,
};

const ChallengeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const challenge = mockChallenges.find((c) => c.id === id);
  const [localStreak, setLocalStreak] = useState(challenge?.streak || 0);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    if (challenge) {
      const savedStreak = localStorage.getItem(`challenge_${id}_streak`);
      if (savedStreak) {
        setLocalStreak(parseInt(savedStreak));
      }
    }
  }, [id, challenge]);

  if (!challenge) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-muted-foreground mb-4">Challenge not found</p>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const Icon = iconMap[challenge.icon] || Award;

  const handleComplete = async () => {
    setIsCompleting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newStreak = localStreak + 1;
    setLocalStreak(newStreak);
    localStorage.setItem(`challenge_${id}_streak`, newStreak.toString());

    const currentBalance = parseInt(localStorage.getItem('walletBalance') || '450');
    const newBalance = currentBalance + challenge.reward;
    localStorage.setItem('walletBalance', newBalance.toString());

    // Celebration!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#f59e0b', '#3b82f6'],
    });

    toast.success(
      <div className="flex items-center gap-2">
        <Award className="w-5 h-5" />
        <div>
          <p className="font-semibold">Challenge Completed!</p>
          <p className="text-sm">+{challenge.reward} coins added to your wallet</p>
        </div>
      </div>,
      { duration: 4000 }
    );

    setIsCompleting(false);
  };

  const progressPercentage = (localStreak / 30) * 100; // 30 days milestone

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
      <div className="container mx-auto p-4 md:p-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="animate-slide-up">
          {/* Header Card */}
          <Card className="p-8 mb-6 bg-gradient-card shadow-lg">
            <div className="flex items-start gap-6 mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
                <Icon className="w-10 h-10 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-foreground">{challenge.title}</h1>
                  <Badge variant="secondary" className="capitalize">
                    {challenge.recurrence}
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-4">{challenge.description}</p>
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="text-sm">
                    <Calendar className="w-4 h-4 mr-1" />
                    {challenge.category}
                  </Badge>
                  <Badge variant="outline" className="text-sm text-accent">
                    <Coins className="w-4 h-4 mr-1" />
                    {challenge.reward} coins per completion
                  </Badge>
                </div>
              </div>
            </div>

            {/* Complete Button */}
            <Button
              size="lg"
              onClick={handleComplete}
              disabled={isCompleting}
              className="w-full bg-gradient-primary hover:shadow-glow transition-all text-lg h-14"
            >
              {isCompleting ? (
                'Completing...'
              ) : (
                <>
                  <CheckCircle2 className="w-6 h-6 mr-2" />
                  Complete Challenge
                </>
              )}
            </Button>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="p-6 bg-gradient-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Current Streak</h3>
                <Flame className="w-8 h-8 text-primary animate-streak-glow" />
              </div>
              <p className="text-4xl font-bold text-primary mb-2">{localStreak} days</p>
              <p className="text-sm text-muted-foreground">Keep it going! 🔥</p>
            </Card>

            <Card className="p-6 bg-gradient-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Total Earned</h3>
                <Coins className="w-8 h-8 text-accent" />
              </div>
              <p className="text-4xl font-bold text-accent mb-2">{localStreak * challenge.reward}</p>
              <p className="text-sm text-muted-foreground">coins from this challenge</p>
            </Card>
          </div>

          {/* Progress Card */}
          <Card className="p-6 bg-gradient-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Progress to Milestone</h3>
              <TrendingUp className="w-6 h-6 text-secondary" />
            </div>
            <Progress value={progressPercentage} className="h-3 mb-3" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{localStreak} / 30 days</span>
              <span className="text-foreground font-semibold">
                {Math.round(progressPercentage)}% complete
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChallengeDetail;
