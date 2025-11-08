import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockChallenges } from '@/lib/mockData';
import {
  ArrowLeft,
  Plus,
  Check,
  Coins,
  Recycle,
  Leaf,
  Bus,
  Zap,
  ShoppingBag,
  Award,
} from 'lucide-react';
import { toast } from 'sonner';

const iconMap: Record<string, any> = {
  Recycle,
  Leaf,
  Bus,
  Zap,
  ShoppingBag,
};

const BrowseChallenges = () => {
  const navigate = useNavigate();
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('selectedChallenges');
    if (saved) {
      setSelectedChallenges(JSON.parse(saved));
    }
  }, []);

  const toggleChallenge = (challengeId: string) => {
    const newSelected = selectedChallenges.includes(challengeId)
      ? selectedChallenges.filter((id) => id !== challengeId)
      : [...selectedChallenges, challengeId];
    
    setSelectedChallenges(newSelected);
    localStorage.setItem('selectedChallenges', JSON.stringify(newSelected));
    
    const action = selectedChallenges.includes(challengeId) ? 'removed' : 'added';
    toast.success(`Challenge ${action}`);
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

        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl font-bold text-foreground mb-2">Browse Challenges</h1>
          <p className="text-muted-foreground">
            Add new challenges to your journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockChallenges.map((challenge, index) => {
            const Icon = iconMap[challenge.icon] || Award;
            const isSelected = selectedChallenges.includes(challenge.id);

            return (
              <Card
                key={challenge.id}
                className={`p-6 bg-gradient-card transition-all cursor-pointer animate-slide-up ${
                  isSelected ? 'border-primary shadow-lg' : 'hover:shadow-lg'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => toggleChallenge(challenge.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs capitalize">
                      {challenge.recurrence}
                    </Badge>
                    {isSelected && (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-5 h-5 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {challenge.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 min-h-[3rem]">
                  {challenge.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-sm text-muted-foreground">{challenge.category}</span>
                  <div className="flex items-center gap-1 text-primary font-semibold">
                    <Coins className="w-4 h-4" />
                    {challenge.reward}
                  </div>
                </div>

                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleChallenge(challenge.id);
                  }}
                  variant={isSelected ? 'secondary' : 'default'}
                  className="w-full mt-4"
                >
                  {isSelected ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Active
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Challenge
                    </>
                  )}
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BrowseChallenges;
