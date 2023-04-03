import json
import numpy as np
import ast
def lastEntry(entry):
    return entry[-1]
def getSongList(json_path, happy_predicted, neutral_predicted, anger_predicted, sadness_predicted, output_no=-1):
    # change json file path!!!!!!!!!
    with open(json_path, 'r') as x_path:
        song_data = json.load(x_path)
    song_data = ast.literal_eval(song_data)
    # print(song_data['valence'])   
    song_data = song_data['data']
    # print(song_data)
    Happy = np.array([1, 1])
    Neutral = np.array([-1, 1])
    Anger = np.array([1, -1])
    Sadness = np.array([-1, -1])
    VA = Happy * happy_predicted + Neutral * neutral_predicted + Anger * anger_predicted + Sadness * sadness_predicted
    import math
    nearest_neighbour = []
    for i in song_data:
        valence = i[3][0]
        arousal = i[4][0]
        distance = math.sqrt((VA[0] - valence) ** 2 + (VA[1] - arousal) ** 2)
        entry = i
        entry.append(distance)
        nearest_neighbour.append(entry)
    nearest_neighbour = sorted(nearest_neighbour, key=lastEntry)
    # print(nearest_neighbour)
    if output_no == -1:
        return nearest_neighbour
    else:
        return nearest_neighbour[:output_no]

# SONGS_JSON_PATH = "./songs.json"

# songs = getSongList(SONGS_JSON_PATH, 0.1, 0.2, 0.6, 0.1, output_no=1)

# print(songs[0])