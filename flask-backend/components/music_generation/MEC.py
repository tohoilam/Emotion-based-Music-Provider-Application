import numpy as np
import math
import pandas as pd
import os
import shutil
import muspy #RMB INSTALL!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
import warnings
warnings.filterwarnings('ignore')

import tensorflow as tf
from sklearn.preprocessing import StandardScaler



"""
List of functions used to prepare xs, including: _get_scale(), pitch_in_scale_rate(), main_scale(), partial_pitch_range()
"""
def _get_scale(root: int, mode: str): # MUSPY SOURCE CODE, used in pitch_in_scale_rate()
    """Return the scale mask for a specific root."""
    if mode == "major":
        c_scale = np.array([1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1], bool)
    elif mode == "minor":
        c_scale = np.array([1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1], bool)
    else:
        raise ValueError("`mode` must be either 'major' or 'minor'.")
    return np.roll(c_scale, root)

def pitch_in_scale_rate(music, root, mode): # MUSPY SOURCE CODE, used in main_scale()
    r"""Return the ratio of pitches in a certain musical scale.

    The pitch-in-scale rate is defined as the ratio of the number of
    notes in a certain scale to the total number of notes. Drum tracks
    are ignored. Return NaN if no note is found. This metric is used in
    [1].

    .. math::
        pitch\_in\_scale\_rate = \frac{\#(notes\_in\_scale)}{\#(notes)}

    Parameters
    ----------
    music : :class:`muspy.Music`
        Music object to evaluate.
    root : int
        Root of the scale.
    mode : str, {'major', 'minor'}
        Mode of the scale.

    Returns
    -------
    float
        Pitch-in-scale rate.

    See Also
    --------
    :func:`muspy.scale_consistency` :
        Compute the largest pitch-in-class rate.

    References
    ----------
    1. Hao-Wen Dong, Wen-Yi Hsiao, Li-Chia Yang, and Yi-Hsuan Yang,
       "MuseGAN: Multi-track sequential generative adversarial networks
       for symbolic music generation and accompaniment," in Proceedings
       of the 32nd AAAI Conference on Artificial Intelligence (AAAI),
       2018.

    """
    scale = _get_scale(root, mode.lower())
    note_count = 0
    in_scale_count = 0
    for track in music.tracks:
        if track.is_drum:
            continue
        for note in track.notes:
            note_count += 1
            if scale[note.pitch % 12]:
                in_scale_count += 1
    if note_count < 1:
        return math.nan
    return in_scale_count / note_count

def main_scale(music): # To find the main scale used in song, used in prepare_xs()
  scale = []
  max_in_scale_rate = 0.0
  for mode in ("minor", "major"):
      # print("now testing " + mode)
      for root in range(12):
          rate = pitch_in_scale_rate(music, root, mode)
          # print(mode, root, rate)
          if math.isnan(rate):
              return math.nan
          if rate > max_in_scale_rate:
              max_in_scale_rate = rate
              scale = [root, mode]
              
  return scale

def partial_pitch_range(song, coverage): # To find the partial pitch range in song, used in prepare_xs()
  coverage = coverage
  pitch_list = []
  upper = 0
  lower = 0
  in_range = 1
  for note in song.tracks[0]:
    pitch_list.append(note.pitch)
  upper = max(pitch_list)
  lower = min(pitch_list)
  while (in_range > coverage):
    upper -= 1
    lower += 1
    out_range_count = 0
    for i in pitch_list:
      if (upper < i or lower > i):
        out_range_count += 1
    in_range = 1 - (out_range_count/len(pitch_list))
  return (upper - lower)


"""
Functions to prepare dataset, including: prepare_xs(), prepare_dataset()
"""
def prepare_xs(df):
    # constructing xs
    xs = []
    for song in df['midi']:
        sample = []
        notes_per_beat_list = []
        beat = 0
        notes_per_beat = 0
        note_length_list = []
        note_velocity_list = []
        pitch_list = []

        # measure metrics
        for note in song.tracks[0]:
            # density
            if (note.time//song.resolution == beat):
                notes_per_beat += 1
            elif (note.time//song.resolution > beat):
                notes_per_beat_list.append(notes_per_beat)
                notes_per_beat = 1
                beat += 1
            # length
            note_length_list.append((note.duration*60)/(song.tempos[0].qpm*song.resolution))
            # velocity
            note_velocity_list.append(note.velocity)
            # pitch
            pitch_list.append(note.pitch)

        if (len(notes_per_beat_list) == 0):
            print("Empty notes per beat detected")
            xs.append(None)
            continue

        # construct feature set
        # density
        notes_per_beat_avg = sum(notes_per_beat_list) / len(notes_per_beat_list)
        sample.append(notes_per_beat_avg)
        sample.append(np.std(notes_per_beat_list))
        # length
        note_length_avg = sum(note_length_list) / len(note_length_list)
        sample.append(note_length_avg)
        sample.append(np.std(note_length_list))
        # velocity
        note_velocity_avg = sum(note_velocity_list) / len(note_velocity_list)
        sample.append(note_velocity_avg)
        sample.append(np.std(note_velocity_list))
        # pitch
        pitch_avg = np.mean(pitch_list)
        sample.append(pitch_avg)
        sample.append(np.std(pitch_list))
        # major-minor tonality
        tonality = main_scale(song)
        if tonality[1] == 'minor':
            tonality_transformed = 0
        elif tonality[1] == 'major':
            tonality_transformed = 1
        sample.append(tonality[0])
        sample.append(tonality_transformed)
        # pitch_range
        sample.append(partial_pitch_range(song, 0.8))
        # polyphony
        sample.append(muspy.polyphony(song))
        # pitch_entropy
        sample.append(muspy.pitch_entropy(song))
        # groove_consistency
        sample.append(muspy.groove_consistency(song, song.resolution))
        # Add feature set of single sample to xs
        xs.append(sample)

    # formatting
    xs = np.array(xs)
    
    return xs

def prepare_dataset(midi_file_folder_path, mode, sample_size=None):
    if (not os.path.isabs(midi_file_folder_path)):
        midi_file_folder_path = os.path.abspath(midi_file_folder_path)

    paths = []
    count = 0

    # storing midi paths & labels
    if mode == 0:
        paths.append(midi_file_folder_path)
    else:
        for dirname, _, filenames in os.walk(midi_file_folder_path):
            for filename in filenames:
                if filename == ".DS_Store":
                    continue

                paths.append(os.path.join(dirname, filename))
                
                count += 1
                if (sample_size and count >= sample_size):
                    break
            if (sample_size and count >= sample_size):
                break

    # creating dataframe to store paths, labels, and interpreted midi files
    df = pd.DataFrame()
    df['clip'] = paths
    midis = []
    for path in df['clip']:
        midis.append(muspy.read_midi(path))
    df['midi'] = midis
    
    #construct xs and ys
    xs = prepare_xs(df)

    # Removed None type midi
    # none_indices = [ i for i, element in enumerate(xs) if element == None ]   
    # if (none_indices):
    #     xs = np.delete(xs, none_indices)
    #     df = df.drop(none_indices)

    return df, xs

def path_converter(path_windows): # To convert windows path string to usable format, used in defining model path
  return path_windows.replace("\\", "/")


"""
CALL THIS!! Get Features
"""
def get_MIDI_features(midi_file_folder_path, mode, sample_size=None):
    df, xs = prepare_dataset(path_converter(midi_file_folder_path), mode, sample_size=sample_size)
    return _get_MIDI_features(df, xs)

def _get_MIDI_features(df, xs):
    feature_dict_list = []
    # build dictionary
    for sample in xs:
        if (sample.any() == None):
            feature_dict_list.append(None)
            continue

        feature_dict = dict({'note_density_avg': sample[0],
                             'note_density_sd': sample[1],
                             'note_length_avg': sample[2],
                             'note_length_sd': sample[3],
                             'note_velocity_avg': sample[4],
                             'note_velocity_sd': sample[5],
                             'pitch_avg': sample[6],
                             'pitch_sd': sample[7],
                             'scale': sample[8],
                             'major_minor': sample[9],
                             '80%_pitch_range': sample[10],
                             'polyphony': sample[11],
                             'pitch_entropy': sample[12],
                             'groove_consistency': sample[13],})
        feature_dict_list.append(feature_dict)
    # return
    if len(feature_dict_list) == 1:
        return feature_dict_list[0]
    else: return feature_dict_list

"""
CALL THIS!! Predict Emotion
"""
def MEC_predict(model_path, midi_file_folder_path, mode, sample_size=None):
    df, xs = prepare_dataset(path_converter(midi_file_folder_path), mode, sample_size=sample_size)
    return _MEC_predict(model_path, df, xs)

def _MEC_predict(model_path, df, xs):
    if (not os.path.isabs(model_path)):
        model_path = os.path.abspath(model_path)

    xs_std = []
    samples_mean = [3.80456035, 1.66635806, 1.06050362, 0.90151069, 65.17817575, 11.93683611,
                    61.84661383, 11.62760856, 4.9869281, 0.8627451, 30.83660131, 5.90405837,
                    4.2685172, 0.98417935]
    samples_var = [3.90129903e+00,6.15830323e-01,3.23346676e-01,1.28103584e-01,
                    2.62087400e+02,7.39402826e+00,3.30157156e+01,8.65289472e+00,
                    1.13499692e+01,1.18415994e-01,7.03309106e+01,2.80418405e+00,
                    2.35288458e-01,6.08599219e-05]
    for sample in xs:
        sample_features = []
        for i in range(len(sample)):
            sample_features.append((sample[i] - samples_mean[i])/np.sqrt(samples_var[i]))
        xs_std.append(sample_features)
    xs_std = np.array(xs_std)
    model = tf.keras.models.load_model(model_path)
    ys_pred = model.predict(xs_std, verbose=0)
    return ys_pred

def get_info2(model_path, midi, emotion_class):
    df = pd.DataFrame()
    midis = []
    midis.append(muspy.from_pretty_midi(midi))
    df['midi'] = midis
    
    #construct xs and ys
    xs = prepare_xs(df)
    return _get_info(model_path, df, xs, 0, emotion_class)

def get_info(model_path, midi_file_folder_path, mode, emotion_class, sample_size=None):
    df, xs = prepare_dataset(path_converter(midi_file_folder_path), mode, sample_size=sample_size)
    return _get_info(model_path, df, xs, mode, emotion_class)

def _get_info(model_path, df, xs, mode, emotion_class):
    feature_dict_list = _get_MIDI_features(df, xs)
    ys_pred = _MEC_predict(model_path, df, xs)
    ys_class = [ np.argmax(ys) for ys in ys_pred ]
    

    if (mode == 0):
        # path = df.iloc[[0]]['clip'].item()
        emotion = emotion_class[ys_class[0]]
        feature_dict_list['emotion_percentages'] = ys_pred.tolist()
        feature_dict_list['emotion'] = emotion
        # feature_dict_list['filename'] = os.path.basename(path)
        # feature_dict_list['file_path'] = path
    elif (mode == 1):
        for i in range(len(feature_dict_list)):
            path = df.iloc[[i]]['clip'].item()

            feature_dict_list[i]['emotion_percentages'] = ys_pred[i].tolist()

            emotion = emotion_class[ys_class[i]]
            feature_dict_list[i]['emotion'] = emotion

            feature_dict_list[i]['filename'] = os.path.basename(path)
            feature_dict_list[i]['file_path'] = path

    return feature_dict_list

def move_midi_by_emotion(model_path, midi_file_folder_path, mode, emotion_class):
    df, xs = prepare_dataset(path_converter(midi_file_folder_path), mode)
    midi_info = _get_info(model_path, df, xs, mode, emotion_class)

    # Convert to absolute path
    if (not os.path.isabs(model_path)):
        model_path = os.path.abspath(model_path)
    if (not os.path.isabs(midi_file_folder_path)):
        midi_file_folder_path = os.path.abspath(midi_file_folder_path)

    if (len(df) != len(midi_info)):
        raise Exception("Dataframe size does not equals to midi_info size, please check MEC.py")

    # Empty and Create a new folder for each emotion
    for emotion in emotion_class:
        dir_path = os.path.join(midi_file_folder_path, emotion)
        shutil.rmtree(dir_path, ignore_errors=True) 
        os.makedirs(dir_path, exist_ok=True)

    for i in range(len(df)):
        emotion = midi_info[i]['emotion']
        original_path = df.iloc[[i]]['clip'].item()
        filename = os.path.basename(original_path)
        new_path = os.path.join(midi_file_folder_path, emotion, filename)

        midi = df.iloc[[i]]['midi'].item()

        dest = shutil.move(original_path, new_path)

        



"""
Example
mode = 0: single sample
mode = 1: whole folder
"""
# model_path = 'C:/Users/SW/OneDrive/Year 4 Sem 1/ELEC4848/Music Emotion Classifcation/EMOPIA_2.2/EMOPIA_2.2/MLP/'
# # midi_file_folder_path = 'C:/Users/SW/OneDrive/Year 4 Sem 1/ELEC4848/Music Emotion Classifcation/EMOPIA_2.2/EMOPIA_2.2/midis/'
# midi_file_folder_path = r'C:\Users\SW\OneDrive\Year 4 Sem 1\ELEC4848\Music Emotion Classifcation\EMOPIA_2.2\EMOPIA_2.2\midis\Q2_Dg935IbDggo_0.mid'
# ys_pred = predict(model_path, midi_file_folder_path, 0)
# print(ys_pred)

# # feature_dict_list = get_features(midi_file_folder_path, 1)
# # print(feature_dict_list[0])

