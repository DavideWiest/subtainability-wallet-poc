import numpy as np
from pathlib import Path

class StaticChallengeRecommender:
    def __init__(self, questions: list[dict]):
        file_path = Path(__file__).parent.parent / "data" / "challenge_prediction.npy"
        self.weights = np.load(str(file_path))
        self.questions = questions
        self.questions_dict = {q['id']: q for q in self.questions}

    def recommend_challenges(self, answers: dict[int, int]) -> list[tuple[int, list[int]]]:
        # Convert answers to input vector
        max_questions = len(self.questions)
        input_vector = np.zeros(max_questions)
        for q_id, answer in answers.items():
            input_vector[int(q_id) - 1] = answer
        
        scores = self.weights @ input_vector
        recommended_indices = np.argsort(scores)[::-1]

        return [(i, self.weights[i].argsort()[::-1].tolist()) for i in range(len(recommended_indices))]
    
    def __call__(self, answers: dict[int, int]):
        recs_reasons = self.recommend_challenges(answers)

        return [
            (rec, [self.questions_dict[i+1]["shortForm"] for i in reasons]) for rec, reasons in recs_reasons
        ]


        

    
