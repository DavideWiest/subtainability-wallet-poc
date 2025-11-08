import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import api from '@/lib/api';
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

const ChallengeDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);

  const fetchChallenge = async (challengeId?: string) => {
    if (!challengeId) return;
    setIsLoading(true);
    try {
      const res = await api.getChallenge(challengeId);
      setChallenge(res);
    } catch (err) {
      console.error('Failed to load challenge', err);
      setChallenge(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenge(id as string);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading challenge…</p>
      </div>
    );
  }

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

  const title = challenge.challenge || challenge.title || 'Untitled Challenge';
  const reward = challenge.currency_reward_points ?? challenge.reward ?? 0;
  const currentStreak = challenge.currentStreak ?? challenge.streak ?? 0;
  const timeVariable = challenge.time_variable ?? challenge.timeVariable ?? '';

  const handleComplete = async () => {
    if (!id) return;
    setIsCompleting(true);
    try {
      await api.completeChallenge(id);

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
            <p className="text-sm">+{reward} coins added to your wallet</p>
          </div>
        </div>,
        { duration: 4000 }
      );

      // Refresh challenge data (backend is source-of-truth)
      await fetchChallenge(id);
      // Optionally you could also refresh user profile here if you have global state
    } catch (err) {
      console.error('Complete failed', err);
      toast.error('Failed to complete challenge. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  const progressPercentage = (currentStreak / 30) * 100; // 30 days milestone

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
                  <h1 className="text-3xl font-bold text-foreground">{title}</h1>
                  <Badge variant="secondary" className="capitalize">
                    {timeVariable}
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-4">{challenge.description || challenge.summary}</p>
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="text-sm">
                    <Calendar className="w-4 h-4 mr-1" />
                    {challenge.category || 'General'}
                  </Badge>
                  <Badge variant="outline" className="text-sm text-secondary">
                    <Coins className="w-4 h-4 mr-1" />
                    {reward} coins per completion
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
              <p className="text-4xl font-bold text-primary mb-2">{currentStreak} days</p>
              <p className="text-sm text-muted-foreground">Keep it going! 🔥</p>
            </Card>

            <Card className="p-6 bg-gradient-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Total Earned</h3>
                <Coins className="w-8 h-8 text-secondary" />
              </div>
              <p className="text-4xl font-bold text-secondary mb-2">{currentStreak * reward}</p>
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
              <span className="text-muted-foreground">{currentStreak} / 30 days</span>
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

