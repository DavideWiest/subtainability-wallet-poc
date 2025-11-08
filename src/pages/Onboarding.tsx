import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { mockOnboardingQuestions } from '@/lib/mockData';
import { CheckCircle2, XCircle, SkipForward, Leaf } from 'lucide-react';
import { toast } from 'sonner';

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, 'yes' | 'no' | 'skip'>>({});

  const progress = ((currentQuestion + 1) / mockOnboardingQuestions.length) * 100;

  const handleAnswer = (answer: 'yes' | 'no' | 'skip') => {
    const questionId = mockOnboardingQuestions[currentQuestion].id;
    setAnswers({ ...answers, [questionId]: answer });

    if (currentQuestion < mockOnboardingQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleSubmit = () => {
    localStorage.setItem('onboardingComplete', 'true');
    localStorage.setItem('onboardingAnswers', JSON.stringify(answers));
    toast.success('Welcome! Your journey begins now 🌱');
    navigate('/dashboard');
  };

  const isLastQuestion = currentQuestion === mockOnboardingQuestions.length - 1;

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
            Question {currentQuestion + 1} of {mockOnboardingQuestions.length}
          </p>
        </div>

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

        {isLastQuestion && (
          <Button
            size="lg"
            onClick={handleSubmit}
            className="w-full bg-gradient-accent hover:shadow-glow transition-all"
          >
            Complete Setup & Start Your Journey
          </Button>
        )}
      </Card>
    </div>
  );
};

export default Onboarding;
