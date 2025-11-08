import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, SkipForward, Leaf, Sparkles, Check, Plus } from 'lucide-react';
import { toast } from 'sonner';
import api, { Question, Challenge } from '@/lib/api';

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const [recommendedChallenges, setRecommendedChallenges] = useState<Challenge[]>([]);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const questions = await api.getQuestions();
        setQuestions(questions);
      } catch (error) {
        toast.error('Failed to load questions. Please try again.');
      }
    };
    loadQuestions();
  }, []);

  const progress = showRecommendations 
    ? 100 
    : questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  const loadRecommendedChallenges = async () => {
    try {
      const challenges = await api.getPersonalizedChallenges();
      setRecommendedChallenges(challenges);
    } catch (error) {
      toast.error('Failed to load recommended challenges');
    }
  };

  const handleAnswer = async (value: -1 | 0 | 1) => {
    if (questions.length === 0) return;
    
    const questionId = questions[currentQuestion].id.toString();
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      try {
        await api.submitOnboarding(newAnswers);
        setShowRecommendations(true);
        loadRecommendedChallenges();
      } catch (error) {
        toast.error('Failed to save your answers. Please try again.');
      }
    }
  };

  const toggleChallenge = async (challengeId: string) => {
    try {
      if (selectedChallenges.includes(challengeId)) {
        setSelectedChallenges(prev => prev.filter(id => id !== challengeId));
      } else {
        await api.startChallenge(challengeId);
        setSelectedChallenges(prev => [...prev, challengeId]);
      }
    } catch (error) {
      toast.error('Failed to update challenge selection');
    }
  };

  const handleSubmit = async () => {
    try {
      for (const challengeId of selectedChallenges) {
        await api.startChallenge(challengeId);
      }
      toast.success('Welcome! Your journey begins now 🌱');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to start challenges. Please try again.');
    }
  };

  const isLastQuestion = currentQuestion === questions.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 shadow-lg bg-gradient-card animate-slide-up">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary mb-4">
            <Leaf className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to EcoChallenge</h1>
          <p className="text-muted-foreground">
            Let's personalize your experience
          </p>
        </div>

        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2 text-center">
            {showRecommendations 
              ? 'Almost done!' 
              : `Question ${currentQuestion + 1} of ${questions.length}`
            }
          </p>
        </div>

        {!showRecommendations && questions.length > 0 ? (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-center mb-8">
                {questions[currentQuestion].question}
              </h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="default"
                  onClick={() => handleAnswer(1)}
                  className="flex-1 h-16 text-lg bg-gradient-primary hover:shadow-glow transition-all"
                >
                  <CheckCircle2 className="w-6 h-6 mr-2" />
                  Yes
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => handleAnswer(-1)}
                  className="flex-1 h-16 text-lg"
                >
                  <XCircle className="w-6 h-6 mr-2" />
                  No
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => handleAnswer(0)}
                  className="flex-1 h-16 text-lg"
                >
                  <SkipForward className="w-6 h-6 mr-2" />
                  Skip
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-center mb-6">Select Your Challenges</h2>

              {/* Top-3 recommended section */}
              {recommendedChallenges.length > 0 && (
                <Card className="p-6 mb-8 bg-amber-100/20 ring-1 ring-amber-300 shadow-2xl rounded-xl">
                  <div className="mb-3 text-center">
                    <p className="text-sm uppercase tracking-wide text-muted-foreground">Recommended</p>
                  </div>
                  <div className="space-y-6 mb-4">
                    {recommendedChallenges.slice(0, 3).map((challenge, i) => (
                      <Card
                        key={challenge.id}
                        onClick={() => toggleChallenge(challenge.id)}
                        className={`p-5 md:p-6 rounded-lg cursor-pointer transform transition-all hover:scale-105 hover:shadow-xl border-2 ${
                          selectedChallenges.includes(challenge.id)
                            ? 'border-primary bg-primary/5'
                            : 'border-amber-300 bg-amber-50/5'
                        }`}
                      >
                        <div>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-colors ${
                            selectedChallenges.includes(challenge.id) ? 'bg-primary border-primary' : 'border-amber-400'
                          }`}>
                            {selectedChallenges.includes(challenge.id) && (
                              <Check className="w-4 h-4 text-primary-foreground" />
                            )}
                          </div>
                          <div>
                            <div className="mb-1">
                              <h3 className="font-semibold text-foreground inline-block mr-2">{challenge.challenge}</h3>
                              <Badge className="text-xs bg-secondary text-secondary-foreground inline-block">
                                {challenge.time_variable}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{challenge.description}</p>
                            <div className="mt-3 space-y-2">
                              {challenge.currency_reward_points > 0 && (
                                <Badge className="bg-primary/10 text-primary">{challenge.currency_reward_points} points</Badge>
                              )}
                              {challenge.recommendationReasons && challenge.recommendationReasons.length > 0 && (
                                <div className="text-xs text-muted-foreground">Why: {challenge.recommendationReasons.join(', ')}</div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <Button
                            onClick={(e) => { e.stopPropagation(); toggleChallenge(challenge.id); }}
                            variant={selectedChallenges.includes(challenge.id) ? 'secondary' : 'default'}
                            className="w-full"
                            aria-pressed={selectedChallenges.includes(challenge.id)}
                          >
                            {selectedChallenges.includes(challenge.id) ? (
                              <><Check className="w-4 h-4 mr-2" /> Selected</>
                            ) : (
                              <><Plus className="w-4 h-4 mr-2" /> Add</>
                            )}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              )}

              {/* Remaining recommendations */}
              <div className="space-y-3 mb-8">
                {recommendedChallenges.slice(3).map((challenge) => (
                  <Card
                    key={challenge.id}
                    onClick={() => toggleChallenge(challenge.id)}
                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedChallenges.includes(challenge.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-colors ${
                        selectedChallenges.includes(challenge.id)
                          ? 'border-primary bg-primary'
                          : 'border-border'
                      }`}>
                        {selectedChallenges.includes(challenge.id) && (
                          <Check className="w-4 h-4 text-primary-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{challenge.challenge}</h3>
                          <Badge className="text-xs bg-secondary text-secondary-foreground">
                            {challenge.time_variable}
                          </Badge>
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
                  </Card>
                ))}
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={selectedChallenges.length === 0}
              className="w-full bg-gradient-primary hover:shadow-glow transition-all"
            >
              Start Journey
            </Button>
          </>
        )}
      </Card>
    </div>
  );
};

export default Onboarding;
