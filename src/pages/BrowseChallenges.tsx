import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api, { Challenge } from '@/lib/api';
import { ArrowLeft, Check, Plus } from 'lucide-react';
import { toast } from 'sonner';

const BrowseChallenges = () => {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const topRecommendations = challenges.slice(0, 3);
  const otherChallenges = challenges.slice(3);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getPersonalizedChallenges();
        setChallenges(res);
        // pre-select already active habits
        const activeIds = res.filter((c) => c.isActive).map((c) => c.id);
        setSelectedChallenges(activeIds as string[]);
      } catch (err) {
        toast.error('Failed to load challenges');
      }
    };
    load();
  }, []);

  const toggleChallenge = async (challengeId: string) => {
    try {
      if (selectedChallenges.includes(challengeId)) {
        await api.stopChallenge(challengeId);
        setSelectedChallenges((prev) => prev.filter((id) => id !== challengeId));
        toast.success('Challenge removed');
      } else {
        await api.startChallenge(challengeId);
        setSelectedChallenges((prev) => [...prev, challengeId]);
        toast.success('Challenge started');
      }
    } catch (err) {
      toast.error('Failed to update challenge');
    }
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
          <p className="text-muted-foreground">Add new challenges to your journey</p>
        </div>

        {/* Top-3 recommended section */}
        {topRecommendations.length > 0 && (
          <Card className="p-6 mb-8 bg-amber-100/20 ring-1 ring-amber-300 shadow-2xl rounded-xl">
            <p className="text-sm uppercase tracking-wide text-muted-foreground mb-3">Recommended</p>
            <div className="space-y-6 mb-6">
              {topRecommendations.map((challenge) => {
                const isSelected = selectedChallenges.includes(challenge.id);
                return (
                  <Card
                    key={challenge.id}
                    className={`p-5 md:p-6 rounded-lg cursor-pointer transform transition-all hover:scale-105 hover:shadow-xl ${isSelected ? 'border-primary bg-primary/5' : 'border-amber-300 bg-amber-50/5'}`}
                    onClick={() => toggleChallenge(challenge.id)}
                  >
                      <div>
                        <div className={`w-7 h-7 rounded-full inline-flex items-center justify-center mt-1 transition-colors ${isSelected ? 'bg-primary border-primary' : 'border-amber-400'}`}>
                          {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{challenge.challenge}</h3>
                            {challenge.time_variable && (
                              <Badge className="text-xs bg-secondary text-secondary-foreground">{challenge.time_variable}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{challenge.description}</p>
                          <div className="mt-3 flex items-center gap-3 flex-wrap">
                            {challenge.currency_reward_points > 0 && (
                              <Badge className="bg-primary/10 text-primary">{challenge.currency_reward_points} points</Badge>
                            )}
                            {challenge.recommendationReasons && challenge.recommendationReasons.length > 0 && (
                              <div className="text-xs text-muted-foreground">Why: {challenge.recommendationReasons.join(', ')}</div>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={(e) => { e.stopPropagation(); toggleChallenge(challenge.id); }}
                        variant={isSelected ? 'secondary' : 'default'}
                        className="w-full mt-4"
                      >
                        {isSelected ? <><Check className="w-4 h-4 mr-2" /> Active</> : <><Plus className="w-4 h-4 mr-2" /> Add Challenge</>}
                      </Button>
                  </Card>
                );
              })}
            </div>
          </Card>
        )}

        <div className="space-y-6">
          {otherChallenges.map((challenge) => {
            const isSelected = selectedChallenges.includes(challenge.id);
            return (
              <Card
                key={challenge.id}
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'border-primary bg-primary/5' : 'border-border'
                }`}
                onClick={() => toggleChallenge(challenge.id)}
              >
                <div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-colors ${
                    isSelected ? 'border-primary bg-primary' : 'border-border'
                  }`}>
                    {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{challenge.challenge}</h3>
                      {challenge.time_variable && (
                        <Badge className="text-xs bg-secondary text-secondary-foreground">
                          {challenge.time_variable}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{challenge.description}</p>
                    {challenge.currency_reward_points > 0 && (
                      <div className="mt-2">
                        <Badge className="bg-primary/10 text-primary">
                          {challenge.currency_reward_points} points
                        </Badge>
                      </div>
                    )}
                    {challenge.recommendationReasons && challenge.recommendationReasons.length > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        <span className="font-medium">Why this challenge: </span>
                        {challenge.recommendationReasons.join(', ')}
                      </div>
                    )}
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
                      <Check className="w-4 h-4 mr-2" /> Active
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" /> Add Challenge
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
