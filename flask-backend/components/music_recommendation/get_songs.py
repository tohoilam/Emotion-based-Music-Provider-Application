import json
import numpy as np
import math
from scipy.spatial import minkowski_distance

# this is used to combine audio and text v-a
def combine_values(audio_result, text_result, domain, text_weighting):
    v_audio = 0
    a_audio = 0
    v_text = 0
    a_text = 0
    if domain == 'music':
        v_audio, a_audio = audio_result
        v_text, a_text = text_result
    if domain == 'speech':
        prob_happiness, prob_anger, prob_sadness, prob_calm = audio_result
        v_audio = (prob_happiness + prob_calm)*2 - 1
        a_audio = (prob_happiness + prob_anger)*2 - 1
        v_text = (text_result[0] + text_result[3])*2 - 1
        a_text = (text_result[0] + text_result[1])*2 - 1
    v_weighted = (v_audio*(1-text_weighting) + v_text*text_weighting)/2
    a_weighted = (a_audio*(1-text_weighting) + a_text*text_weighting)/2
    confidence = (1-(abs(v_audio - v_text) + abs(a_audio - a_text))/2)
    return v_weighted, a_weighted, confidence

# call this to get song
def getSongList(mode, json_path, speech_audio_prob, speech_text_prob: dict = {}, text_weighting: float = 0.5, output_no=-1):
    def last_entry(entry, mode):
        if (mode == 'audio'):
            return entry['audio']['similarity']
        else:
            return entry['combined']['similarity']

    def emotion_label(valence, arousal):
        if valence >= 0 and arousal >= 0:
            return 'Happiness'
        elif valence < 0 and arousal >= 0:
            return 'Anger'
        elif valence < 0 and arousal < 0:
            return 'Sadness'
        elif valence >= 0 and arousal < 0:
            return 'Calmness'
    
    with open(json_path, 'r') as f:
        song_data = json.load(f)

    # Convert audio emotion probability to VA value
    speech_audio_happy = speech_audio_prob['Happiness']
    speech_audio_neutral = speech_audio_prob['Calmness']
    speech_audio_anger = speech_audio_prob['Anger']
    speech_audio_sadness = speech_audio_prob['Sadness']
    Happy = np.array([1, 1])
    Neutral = np.array([1, -1])
    Anger = np.array([-1, 1])
    Sadness = np.array([-1, -1])
    speech_audio_VA = Happy * speech_audio_happy + Neutral * speech_audio_neutral + Anger * speech_audio_anger + Sadness * speech_audio_sadness
    
    # Make song list
    nearest_neighbour = []
    for i in song_data:
        v_audio = i['audio']['valence']
        a_audio = i['audio']['arousal']
        distance_audio = math.sqrt((speech_audio_VA[0] - v_audio) ** 2 + (speech_audio_VA[1] - a_audio) ** 2)
        entry = i
        entry['audio']['emotion'] = emotion_label(v_audio, a_audio)
        entry['audio']['distance'] = distance_audio
        audio_similarity = math.sqrt(8) / (math.sqrt(8) + distance_audio)
        entry['audio']['similarity'] = audio_similarity
        text_similarity=0

        # audio mode: only use audio information
        if mode == 'audio':
            nearest_neighbour.append(entry)
            continue

        # lyrics mode: use both audio & text information
        else:
            speech_text_happy = speech_text_prob['Happiness']
            speech_text_neutral = speech_text_prob['Calmness']
            speech_text_anger = speech_text_prob['Anger']
            speech_text_sadness = speech_text_prob['Sadness']
            music_text_happy = i['lyrics']['percentage']['Happiness']
            music_text_neutral = i['lyrics']['percentage']['Calmness']
            music_text_anger = i['lyrics']['percentage']['Anger']
            music_text_sadness = i['lyrics']['percentage']['Sadness']
            speech_text_4d = [speech_text_happy, speech_text_neutral, speech_text_anger, speech_text_sadness]
            music_text_4d = [music_text_happy, music_text_neutral, music_text_anger, music_text_sadness]
            distance = minkowski_distance(speech_text_4d, music_text_4d, p=2) # == Euclidean distance
            entry['lyrics']['distance'] = distance
            text_similarity = (math.sqrt(2) - distance) / math.sqrt(2) # sqrt 2 is the largest distance
            entry['lyrics']['similarity'] = text_similarity

            # combined
            similarity_combined = audio_similarity*(1-text_weighting) + text_similarity*(text_weighting)
            entry['lyrics']['weighting'] = text_weighting
            entry['audio']['weighting'] = 1 - text_weighting
            entry['combined']['similarity'] = similarity_combined

            nearest_neighbour.append(entry)

    nearest_neighbour = sorted(nearest_neighbour, key=lambda x: last_entry(x, mode), reverse=True)
    if output_no == -1:
        return nearest_neighbour
    else:
        return nearest_neighbour[:output_no]


# ################## EXAMPLE & SPECIFICATION #####################
# # mode: "audio" or "combined"
# mode = "combined"

# # speech_audio_prob: dictionary of 4 emotion prob
# speech_audio_prob = {'Happiness': 0.5,
#                      'Anger': 0.2,
#                      'Sadness': 0.2,
#                      'Calmness': 0.1}

# # speech_text_prob: dictionary of 4 emotion prob
# speech_text_prob = {'Happiness': 0.7,
#                      'Anger': 0.1,
#                      'Sadness': 0.1,
#                      'Calmness': 0.1}

# # text_weighting: weigting of text default = 0.5
# text_weighting = 0.7

# # output_no=-1

# neighbours = getSongList(mode, speech_audio_prob, speech_text_prob, text_weighting)
# with open('neighbour_list.json', 'w') as f:
#     json.dump(neighbours, f)
