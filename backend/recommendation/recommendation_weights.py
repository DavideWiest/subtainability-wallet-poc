# Creating a conservative correlation matrix (14 challenges x 10 questions),
# scaling each row so the maximum absolute value per row is 1,
# and saving to /mnt/data/challenge_prediction.npy

import numpy as np

# Raw conservative correlation estimates (rows = challenges, cols = questions Q1..Q10)
raw = np.array([
    # Q1  Q2   Q3   Q4   Q5   Q6   Q7   Q8   Q9   Q10
    [ 0.75, -0.20,  0.30,  0.25,  0.10,  0.05,  0.40,  0.10,  0.20,  0.05],  # 1 DIY / thrifting
    [ 0.60, -0.70,  0.70,  0.00,  0.60, -0.30,  0.20,  0.10,  0.50,  0.00],  # 2 Cycle to work
    [ 0.40, -0.50,  0.50,  0.10,  0.20, -0.10,  0.00,  0.00,  0.10,  0.10],  # 3 Walk to supermarket
    [ 0.50, -0.10,  0.20,  0.85,  0.00,  0.00,  0.00,  0.00,  0.00,  0.30],  # 4 Plant / compost
    [ 0.20, -0.60,  0.70,  0.00,  0.75, -0.20,  0.10,  0.00,  0.20,  0.00],  # 5 Public transport
    [ 0.00,  0.85, -0.40,  0.00, -0.10,  0.00,  0.30,  0.60,  0.40,  0.00],  # 6 Charge EV at night
    [ 0.10,  0.40, -0.10,  0.00,  0.20,  0.00,  0.50,  0.10,  0.00,  0.00],  # 7 Carpool to work
    [ 0.00,  0.40, -0.20,  0.00,  0.10,  0.00,  0.40,  0.30,  0.00,  0.00],  # 8 Carpool children
    [ 0.40, -0.30,  0.60,  0.00,  0.20,  0.00,  0.30,  0.00,  0.70,  0.00],  # 9 Use rented bike
    [ 0.10, -0.10,  0.10,  0.20,  0.00,  0.00,  0.60,  0.00,  0.00,  0.95],  # 10 Eat plant-based
    [ 0.20, -0.10,  0.10,  0.20,  0.00,  0.95,  0.50,  0.00,  0.00,  0.10],  # 11 Separate household waste
    [ 0.00, -0.10,  0.00,  0.00,  0.00,  0.20,  0.60,  0.20,  0.20,  0.00],  # 12 Turn off unused appliances
    [ 0.00,  0.20,  0.00,  0.20,  0.00,  0.00,  0.30,  0.70,  0.90,  0.00],  # 13 Maintain home solar panels
    [ 0.30, -0.10,  0.10,  0.20,  0.10,  0.40,  0.60,  0.00,  0.00,  0.90],  # 14 Riverside/community cleanup
], dtype=float)

# Scale each row so that the maximum absolute value in the row is 1 (conservative scaling for softmax)
row_max = np.max(np.abs(raw), axis=1, keepdims=True)
row_max[row_max == 0] = 1.0
scaled = raw / row_max

# Save to file
np.save('challenge_prediction.npy', scaled)

# Show summary
print('Saved /mnt/data/challenge_prediction.npy with shape', scaled.shape)
scaled

