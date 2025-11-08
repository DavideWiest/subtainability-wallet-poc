from pathlib import Path
import sys
import json

# Add the parent directory to sys.path so we can import from main.py
parent_dir = str(Path(__file__).parent.parent)
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

# Import the recommender and data from main.py
from main import recommender, load_json_data, user_data, questions_data, challenges_data

def main():
    print("\nLoaded user profile:")
    print(f"Name: {user_data.get('name', 'Unknown')}")
    
    # Get the user's existing answers from onboarding
    existing_answers = user_data["answers"]

    # Create example answers combining user's real answers with some additional ones
    example_answers = {int(k): v for k, v in existing_answers.items()}
    
    print("\nCombined answers (existing + example):")
    for qid, answer in example_answers.items():
        question = next((q for q in questions_data if q['id'] == int(qid)), None)
        if question:
            answer_text = "Yes" if answer == 1 else "No" if answer == -1 else "Skip"
            print(f"\nQuestion {qid}: {question['question']}")
            print(f"Answer: {answer_text}")
    
    # Get personalized challenge recommendations based on combined answers
    print("\nGetting challenge recommendations...")
    recommendations = recommender(example_answers)
    
    print("\nRecommended challenges:")
    
    # Get user's active and completed challenges
    active_habits = user_data.get('activeHabits', [])
    completed_challenges = user_data.get('completedChallenges', [])
    
    for challenge_idx, reasons in recommendations[:4]:
        if 0 <= challenge_idx < len(challenges_data):
            challenge = challenges_data[challenge_idx]
            challenge_id = str(challenge_idx + 1)
            
            status = ""
            if challenge_id in active_habits:
                status = "(Currently Active)"
            elif challenge_id in completed_challenges:
                status = "(Already Completed)"
            
            print(f"\nChallenge {challenge_id} {status}:")
            print(f"Description: {challenge['challenge']}")
            print(f"Time: {challenge['time_variable']}")
            print(f"Impact: {challenge['impact']}")
            print(f"Reward: {challenge['currency_reward_points']} points")
            
            print("Top influencing questions:")
            for q_short_form in reasons[:3]:  # Show top 3 reasons
                print(f"- {q_short_form}")

if __name__ == "__main__":
    main()
