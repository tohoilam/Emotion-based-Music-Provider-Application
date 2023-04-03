import json
import numpy as np
import ast
def lastEntry(entry):
    return entry['distance']
def getSong(happy_predicted, neutral_predicted, anger_predicted, sadness_predicted, output_no=-1):
    # change json file path!!!!!!!!!
    with open('song_audio.json', 'r') as x_path:
        song_data = json.load(x_path)
    Happy = np.array([1, 1])
    Neutral = np.array([-1, 1])
    Anger = np.array([1, -1])
    Sadness = np.array([-1, -1])
    VA = Happy * happy_predicted + Neutral * neutral_predicted + Anger * anger_predicted + Sadness * sadness_predicted
    import math
    nearest_neighbour = []
    for i in song_data:
        valence = i['audio']['valence']
        arousal = i['audio']['arousal']
        distance = math.sqrt((VA[0] - valence) ** 2 + (VA[1] - arousal) ** 2)
        entry = i
        entry['audio']['distance'] = distance
        entry['audio']['similarity'] = math.sqrt(8) / (math.sqrt(8) + distance)
        nearest_neighbour.append(entry)
    nearest_neighbour = sorted(nearest_neighbour, key=lastEntry)
    print(nearest_neighbour)
    if output_no == -1:
        return nearest_neighbour
    else:
        return nearest_neighbour[:output_no]

getSong(0.1, 0.1, 0.7, 0.1)