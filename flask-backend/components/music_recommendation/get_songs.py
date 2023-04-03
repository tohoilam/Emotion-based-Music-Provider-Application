import json
import numpy as np
import math

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
def getSongList(speech_prob, mode, json_path, lyrics_weighting: float = 0.5, output_no=-1):
    def last_entry(entry, mode):
        return entry[mode]['distance']

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
    song_data[0]
    happy_predicted = speech_prob['Happiness']
    neutral_predicted = speech_prob['Calmness']
    anger_predicted = speech_prob['Anger']
    sadness_predicted = speech_prob['Sadness']
    Happy = np.array([1, 1])
    Neutral = np.array([-1, 1])
    Anger = np.array([1, -1])
    Sadness = np.array([-1, -1])
    VA = Happy * happy_predicted + Neutral * neutral_predicted + Anger * anger_predicted + Sadness * sadness_predicted
    nearest_neighbour = []
    for i in song_data:
        v_audio = None
        a_audio = None
        v_lyrics = None
        a_lyrics = None
        if mode != 'lyrics':
            # audio
            v_audio = i['audio']['valence']
            a_audio = i['audio']['arousal']
            distance_audio = math.sqrt((VA[0] - v_audio) ** 2 + (VA[1] - a_audio) ** 2)
            entry = i
            entry['audio']['emotion'] = emotion_label(v_audio, a_audio)
            entry['audio']['distance'] = distance_audio
            entry['audio']['similarity'] = math.sqrt(8) / (math.sqrt(8) + distance_audio)
            if mode == 'audio':
                nearest_neighbour.append(entry)
                continue

        if mode != 'audio':
            # lyrics
            v_lyrics = i['lyrics']['valence']
            a_lyrics = i['lyrics']['arousal']
            distance_lyrics = math.sqrt((VA[0] - v_lyrics) ** 2 + (VA[1] - a_lyrics) ** 2)
            entry = i
            entry['lyrics']['distance'] = distance_lyrics
            entry['lyrics']['similarity'] = math.sqrt(8) / (math.sqrt(8) + distance_lyrics)
            if mode == 'lyrics':
                nearest_neighbour.append(entry)
                continue

        # combined
        v_combined, a_combined, confidence = combine_values([v_audio,a_audio], [v_lyrics, a_lyrics], 'music', lyrics_weighting)
        distance_combined = math.sqrt((VA[0] - v_combined) ** 2 + (VA[1] - a_combined) ** 2)
        entry = i
        entry['lyrics']['weighting'] = lyrics_weighting
        entry['audio']['weighting'] = 1 - lyrics_weighting
        entry['audio_lyrics_similarity'] = confidence
        entry['combined']['valence'] = v_combined
        entry['combined']['arousal'] = a_combined
        entry['combined']['emotion'] = emotion_label(v_combined, a_combined)
        entry['combined']['distance'] = distance_combined
        entry['combined']['similarity'] = math.sqrt(8) / (math.sqrt(8) + distance_combined)
        nearest_neighbour.append(entry)

    nearest_neighbour = sorted(nearest_neighbour, key=lambda x: last_entry(x, mode))
    if output_no == -1:
        return nearest_neighbour
    else:
        return nearest_neighbour[:output_no]

"""
################## EXAMPLE & SPECIFICATION #####################
# lyrics_weighting takes value between 0 and 1
lyrics_weighting = 0.5
# mode can be 'audio', 'lyrics' or 'combined'
mode = 'audio'
# speech_prob should be [happiness, anger, sadness, calmness]
speech_prob = [0.7, 0.2, 0.05, 0.05]
# path to song_list
json_path = 'song_lyrics.json'

neighbours = getSongList(speech_prob, mode, json_path)
with open('neighbour_list.json', 'w') as f:
    json.dump(neighbours, f)
"""