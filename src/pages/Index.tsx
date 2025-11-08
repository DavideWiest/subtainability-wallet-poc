import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const onboardingComplete = localStorage.getItem('onboardingComplete');
    if (onboardingComplete === 'true') {
      navigate('/dashboard');
    } else {
      navigate('/onboarding');
    }
  }, [navigate]);

  return null;
};

export default Index;
