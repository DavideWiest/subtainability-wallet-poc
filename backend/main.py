# app.py
from flask import Flask, request, jsonify, abort
from flask_cors import CORS
from datetime import datetime
from pathlib import Path
import logging
import json
import traceback
import os

# import your recommender (keeps same API)
from recommendation.recommendation import StaticChallengeRecommender

# --- Setup ---

app = Flask(__name__, static_folder=None, static_url_path=None)

# Configure CORS (same allowed origins as original)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:8080", "http://localhost:5173"]}},
     supports_credentials=True)

# Configure logging to stdout
logger = logging.getLogger("eco_rewards")
logger.setLevel(logging.INFO)
stream_handler = logging.StreamHandler()
stream_formatter = logging.Formatter(
    fmt="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
stream_handler.setFormatter(stream_formatter)
logger.handlers = []  # clear other handlers
logger.addHandler(stream_handler)

# Badge theme emoji mappings
badgeThemeEmojis = {
    'crafting_tools_icon': '🛠️',
    'bicycle_silhouette': '🚲',
    'footprints_pathway': '👣',
    'leaf_plant_sprout': '🌱',
    'bus_train_icon': '🚌',
    'electric_plug_moon': '🔌',
    'car_group_icon': '🚗',
    'car_group_icon_children': '🚗',
    'bike_icon': '🚲',
    'leaf_plate_carrot': '🥕',
    'recycling_bins': '♻️',
    'power_button_icon': '⚡',
    'solar_panel_sun_icon': '☀️',
    'clean_riverside_icon': '🌊'
}

# Helper to load JSON data from data/ directory next to this file
def load_json_data(filename: str):
    filepath = Path(__file__).parent / "data" / filename
    if not filepath.exists():
        logger.error(f"Data file not found: {filepath}")
        raise FileNotFoundError(str(filepath))
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

# Load static data (on startup)
challenges_data = load_json_data("challenge.json")
questions_data = load_json_data("question.json")
user_data = load_json_data("user.json")

recommender = StaticChallengeRecommender(questions_data)

# --- Error handler to log unexpected exceptions ---
@app.errorhandler(Exception)
def handle_unexpected_error(error):
    logger.error("Unhandled exception: %s", error)
    traceback.print_exc()
    response = {"error": "Internal server error", "message": str(error)}
    return jsonify(response), 500

# --- Routes ---
@app.route("/", methods=["GET"])
def root():
    return jsonify({"message": "EcoRewards API is running", "docs": "/docs"})

@app.route("/api/questions", methods=["GET"])
def get_questions():
    """Get onboarding questions"""
    return jsonify(questions_data)

@app.route("/api/onboarding", methods=["POST"])
def submit_onboarding():
    """
    Store user onboarding responses and use them for personalization.
    Expects JSON with {"answers": {"1": 1, "2": -1, ...}} or with integer keys.
    """
    try:
        payload = request.get_json(silent=False)
        print("Received payload:", payload)
        if not payload:
            return jsonify({"error": "Invalid or empty JSON payload"}), 400
    except Exception as e:
        print("JSON parsing error:", str(e))
        return jsonify({"error": f"Failed to parse JSON: {str(e)}"}), 400

    raw_answers = payload.get("answers")
    if raw_answers is None:
        return jsonify({"error": "Missing 'answers' in payload"}), 400

    # Convert keys to int if possible and validate values
    answer_dict = {}
    try:
        for k, v in raw_answers.items():
            # keys may come as strings from JSON; try to convert to int
            try:
                qid = int(k)
            except Exception:
                logger.debug("Question id key could not be converted to int: %s", k)
                return jsonify({"error": f"Question ID must be an integer-like string or int, got {k}"}), 422

            # Validate answer type and value
            if not isinstance(v, int) or v not in (-1, 0, 1):
                return jsonify({"error": f"Answer for question {qid} must be -1, 0, or 1, got {v}"}), 422

            answer_dict[qid] = v

    except Exception as e:
        logger.exception("Error parsing onboarding answers")
        return jsonify({"error": "Failed to parse answers", "details": str(e)}), 400

    # Logging and print
    logger.info("Received onboarding answers: %s", answer_dict)
    print("Onboarding answers received:", answer_dict)

    # Update in-memory user_data
    user_data["answers"] = answer_dict

    if "activeHabits" not in user_data:
        user_data["activeHabits"] = {}

    # Get personalized challenge recommendations (recommender returns indices)
    try:
        recommended_challenges = recommender.recommend_challenges(answer_dict)
    except Exception:
        logger.exception("Recommender failed; returning empty recommendations")
        recommended_challenges = []

    user_data["recommendedChallenges"] = recommended_challenges

    return jsonify({"status": "success", "message": "Onboarding completed"})

@app.route("/api/user/profile", methods=["GET"])
def get_user_profile():
    return jsonify(user_data)

@app.route("/api/user/profile", methods=["PUT"])
def update_user_profile():
    payload = request.get_json(silent=True)
    if not payload:
        return jsonify({"error": "Invalid or empty JSON payload"}), 400
    # merge provided fields into user_data
    for field, value in payload.items():
        user_data[field] = value
    logger.info("User profile updated: %s", list(payload.keys()))
    return jsonify(user_data)

@app.route("/api/challenges/personalized", methods=["GET"])
def get_personalized_challenges():
    print("Recommending personalized challenges")
    if "answers" not in user_data or not user_data["answers"]:
        raise RuntimeError("User has not completed onboarding with answers yet")
        # Return all challenges with IDs when no personalization is available
        # return jsonify([
        #     {**challenge, "id": str(idx + 1)}
        #     for idx, challenge in enumerate(challenges_data)
        # ])

    # Get recommendations and reasons from the recommender
    recommendations = recommender(user_data["answers"])

    personalized_challenges = []

    for rec in recommendations:
        idx, reasons = rec
        if 0 <= idx < len(challenges_data):
            challenge = dict(challenges_data[idx])  # shallow copy so we don't mutate original unexpectedly
            challenge_id = str(idx + 1)
            
            # Add ID and recommendation reasons
            challenge["id"] = challenge_id
            challenge["recommendationReasons"] = reasons

            streak_info = user_data.get("activeHabits", {}).get(challenge_id)
            challenge["isActive"] = True if streak_info else False
            challenge["currentStreak"] = 0 if not streak_info else streak_info.get("currentStreak", 0)

            # last_completed_iso = 0 if not streak_info else streak_info.get("lastCompleted")
            # time_horizon = streak_info.get("timeHorizon")
            # if last_completed_iso:
            #     last_completed = datetime.fromisoformat(last_completed_iso)

            personalized_challenges.append(challenge)

    return jsonify(personalized_challenges)

@app.route("/api/challenges/<challenge_id>", methods=["GET"])
def get_challenge(challenge_id):
    """Return a single challenge with user-specific fields (isActive, currentStreak)"""
    if not challenge_id.isdigit() or not (0 <= int(challenge_id) - 1 < len(challenges_data)):
        return jsonify({"error": "Challenge not found"}), 404

    idx = int(challenge_id) - 1
    challenge = dict(challenges_data[idx])
    challenge_id_str = str(idx + 1)

    # Ensure id and recommendation reasons are available
    challenge["id"] = challenge_id_str
    challenge["recommendationReasons"] = challenge.get("recommendationReasons", [])

    streak_info = user_data.get("activeHabits", {}).get(challenge_id_str)
    challenge["isActive"] = True if streak_info else False
    challenge["currentStreak"] = 0 if not streak_info else streak_info.get("currentStreak", 0)

    return jsonify(challenge)

@app.route("/api/challenges/<challenge_id>/start", methods=["POST"])
def start_challenge(challenge_id):
    if not challenge_id.isdigit() or not (0 <= int(challenge_id) - 1 < len(challenges_data)):
        return jsonify({"error": "Challenge not found"}), 404

    idx = int(challenge_id) - 1
    challenge = challenges_data[idx]

    if "activeHabits" not in user_data:
        user_data["activeHabits"] = {}

    if challenge_id not in user_data["activeHabits"]:
        user_data["activeHabits"][challenge_id] = {
            "challengeId": challenge_id,
            "currentStreak": 0,
            "lastCompleted": None,
            "timeHorizon": challenge.get("time_variable")
        }

    # reflect back some state
    result = dict(challenge)
    result["isActive"] = True
    result["currentStreak"] = user_data["activeHabits"][challenge_id]["currentStreak"]
    logger.info("Started challenge %s for user", challenge_id)
    return jsonify(result)

@app.route("/api/challenges/<challenge_id>/complete", methods=["POST"])
def complete_challenge(challenge_id):
    if not challenge_id.isdigit() or not (0 <= int(challenge_id) - 1 < len(challenges_data)):
        return jsonify({"error": "Challenge not found"}), 404

    idx = int(challenge_id) - 1
    challenge = challenges_data[idx]
    now = datetime.now()

    if "activeHabits" not in user_data:
        user_data["activeHabits"] = {}

    streak_info = user_data["activeHabits"].get(challenge_id)
    if not streak_info:
        streak_info = {
            "challengeId": challenge_id,
            "currentStreak": 0,
            "lastCompleted": None,
            "timeHorizon": challenge.get("time_variable")
        }

    last_completed = None
    if streak_info.get("lastCompleted"):
        try:
            last_completed = datetime.fromisoformat(streak_info["lastCompleted"])
        except Exception:
            last_completed = None

    if last_completed:
        days_since_last = (now - last_completed).days
        if days_since_last > 7:
            streak_info["currentStreak"] = 1
        else:
            streak_info["currentStreak"] = streak_info.get("currentStreak", 0) + 1
    else:
        streak_info["currentStreak"] = 1

    streak_info["lastCompleted"] = now.isoformat()
    user_data["activeHabits"][challenge_id] = streak_info

    # Safely update numeric fields in user_data
    user_data["walletBalance"] = user_data.get("walletBalance", 0) + challenge.get("currency_reward_points", 0)
    user_data["totalImpact"] = user_data.get("totalImpact", 0) + challenge.get("currency_reward_points", 0)
    if "stats" not in user_data:
        user_data["stats"] = {
            "currentStreak": 0,
            "longestStreak": 0,
            "totalChallengesCompleted": 0,
            "badges": []
        }
    user_data["stats"]["totalChallengesCompleted"] = user_data["stats"].get("totalChallengesCompleted", 0) + 1

    if streak_info["currentStreak"] > user_data["stats"].get("longestStreak", 0):
        user_data["stats"]["longestStreak"] = streak_info["currentStreak"]

    # Create a badge on milestone streaks
    if streak_info["currentStreak"] in [1, 5, 10, 25, 50, 100]:
        new_badge = {
            "id": f"badge_{len(user_data['stats'].get('badges', [])) + 1}",
            "title": f"{challenge.get('challenge')} - {streak_info['currentStreak']} Streak",
            "icon": badgeThemeEmojis.get(challenge.get("badge_image_theme", ""), "🏆"),
            "earnedAt": now.isoformat(),
            "challengeId": challenge_id
        }
        user_data["stats"].setdefault("badges", []).append(new_badge)

    logger.info("Completed challenge %s (streak=%s). Reward=%s",
                challenge_id, streak_info["currentStreak"], challenge.get("currency_reward_points", 0))

    return jsonify({
        "challenge": challenge,
        "reward": challenge.get("currency_reward_points", 0),
        "streak": streak_info["currentStreak"]
    })

@app.route("/api/wallet/transactions", methods=["GET"])
def get_transactions():
    transactions = user_data.get("transactions", [])
    if transactions is None:
        user_data["transactions"] = []
        transactions = []
    return jsonify(transactions)

@app.route("/api/wallet/redeem", methods=["POST"])
def redeem_reward():
    payload = request.get_json(silent=True)
    if not payload:
        return jsonify({"error": "Invalid or empty JSON payload"}), 400

    amount = payload.get("amount")
    description = payload.get("description", "")

    if amount is None or not isinstance(amount, int):
        return jsonify({"error": "Missing or invalid 'amount' (must be integer)"}), 400

    if user_data.get("walletBalance", 0) < amount:
        return jsonify({"error": "Insufficient balance"}), 400

    user_data["walletBalance"] = user_data.get("walletBalance", 0) - amount

    transaction = {
        "id": str(datetime.now().timestamp()),
        "type": "redeemed",
        "amount": -amount,
        "description": description,
        "date": datetime.now().isoformat()
    }

    user_data.setdefault("transactions", []).append(transaction)
    logger.info("Redeemed %s coins: %s", amount, description)
    print("Redeem transaction:", transaction)

    return jsonify(transaction)

@app.route("/api/wallet/redemptions", methods=["GET"])
def get_redemption_options():
    try:
        redemptions = load_json_data("redemptions.json")
    except Exception:
        logger.exception("Failed to load redemptions.json")
        redemptions = []
    return jsonify(redemptions)

@app.route("/api/user/stats", methods=["GET"])
def get_user_stats():
    # Return something reasonable; in production compute from DB
    return jsonify({
        "currentStreak": user_data.get("stats", {}).get("currentStreak", 7),
        "longestStreak": user_data.get("stats", {}).get("longestStreak", 14),
        "totalChallengesCompleted": user_data.get("stats", {}).get("totalChallengesCompleted", 12),
        "badges": [
            {
                "id": "badge_1",
                "title": "Cycle to work or university",
                "icon": "🚴",
                "earnedAt": datetime.now().isoformat(),
                "challengeId": "challenge_2",
            },
        ],
    })


if __name__ == "__main__":
    # When running directly, start flask development server
    logger.info("Starting EcoRewards Flask API on 0.0.0.0:8000")
    # debug=True enables auto-reload and more verbose errors; set to False in prod
    app.run(host="0.0.0.0", port=8000, debug=True)
