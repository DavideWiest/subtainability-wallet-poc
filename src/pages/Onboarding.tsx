import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { mockOnboardingQuestions, mockChallenges, Challenge } from '@/lib/mockData';
import { CheckCircle2, XCircle, SkipForward, Leaf, Sparkles, Check } from 'lucide-react';
import { toast } from 'sonner';

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, 'yes' | 'no' | 'skip'>>({});
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);

  const progress = showRecommendations 
    ? 100 
    : ((currentQuestion + 1) / mockOnboardingQuestions.length) * 100;

  // Recommend challenges based on answers
  const getRecommendedChallenges = (): Challenge[] => {
    const yesAnswers = Object.entries(answers)
      .filter(([_, answer]) => answer === 'yes')
      .map(([questionId]) => questionId);
    
    if (yesAnswers.length === 0) {
      // If no yes answers, show first 3 challenges
      return mockChallenges.slice(0, 3);
    }
    
    // Filter challenges that match any of the yes answers
    const matchedChallenges = mockChallenges.filter(challenge =>
      challenge.reasons.some(reason => yesAnswers.includes(reason))
    );
    
    return matchedChallenges.length > 0 ? matchedChallenges : mockChallenges.slice(0, 3);
  };

  const handleAnswer = (answer: 'yes' | 'no' | 'skip') => {
    const questionId = mockOnboardingQuestions[currentQuestion].id;
    setAnswers({ ...answers, [questionId]: answer });

    if (currentQuestion < mockOnboardingQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Show recommendations after last question
      setShowRecommendations(true);
      // Don't pre-select any challenges
    }
  };

  const toggleChallenge = (challengeId: string) => {
    setSelectedChallenges(prev => 
      prev.includes(challengeId) 
        ? prev.filter(id => id !== challengeId)
        : [...prev, challengeId]
    );
  };

  const handleSubmit = () => {
    localStorage.setItem('onboardingComplete', 'true');
    localStorage.setItem('onboardingAnswers', JSON.stringify(answers));
    localStorage.setItem('selectedChallenges', JSON.stringify(selectedChallenges));
    toast.success('Welcome! Your journey begins now 🌱');
    navigate('/dashboard');
  };

  const isLastQuestion = currentQuestion === mockOnboardingQuestions.length - 1;
  const recommendedChallenges = showRecommendations ? getRecommendedChallenges() : [];

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
              : `Question ${currentQuestion + 1} of ${mockOnboardingQuestions.length}`
            }
          </p>
        </div>

        {!showRecommendations ? (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-center mb-8">
                {mockOnboardingQuestions[currentQuestion].question}
              </h2>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="default"
                  onClick={() => handleAnswer('yes')}
                  className="flex-1 h-16 text-lg bg-gradient-primary hover:shadow-glow transition-all"
                >
                  <CheckCircle2 className="w-6 h-6 mr-2" />
                  Yes
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => handleAnswer('no')}
                  className="flex-1 h-16 text-lg"
                >
                  <XCircle className="w-6 h-6 mr-2" />
                  No
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => handleAnswer('skip')}
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
              <h2 className="text-2xl font-semibold text-center mb-6">
                Select Your Challenges
              </h2>

              <div className="space-y-3 mb-8">
                {recommendedChallenges.map((challenge) => (
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
                          <h3 className="font-semibold text-foreground">{challenge.title}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {challenge.recurrence}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{challenge.description}</p>
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
