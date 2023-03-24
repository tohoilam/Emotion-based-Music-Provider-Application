import os
import random
import numpy as np
from flask import request
from flask import Blueprint, send_file
from flask_cors import cross_origin
from blueprints.speech_emotion_recognition_blueprint import getModelConfig, SER_Predict_Full
from components.music_generation.generate_music import generateMusic
import magenta.music as mm
from pretty_midi import PrettyMIDI
from scipy.io.wavfile import write



music_generation_blueprint = Blueprint('music_generation', __name__)

PATH_DIR_NAME = '/music-generation'
MODEL_PATH = os.path.join("components", "music_generation", "models", "happiness_baseline_attention_model_1.mag")
PRIMERS_MIDI_PATHS = os.path.join("components", "music_generation", "primers")
WAV_SAVE_PATH = os.path.join("components", "music_generation", "generated_wav")

SAMPLING_RATE = 16000
PRIMER_COUNT = 30

@music_generation_blueprint.errorhandler(413)
def too_large(e):
    return "File is too large", 413

@music_generation_blueprint.route(PATH_DIR_NAME + '/generate', methods=['POST'])
@cross_origin()
def generate():
  modelChoice = 1 # Final Model
  result = SER_Predict_Full(request, fixed_model_choice=modelChoice)
  print(result)
  speech_emotion = result['data'][0]
  emotion = speech_emotion['emotion']

  print(f"Emotion: {emotion}")

  primer_folder = os.path.abspath(os.path.join(PRIMERS_MIDI_PATHS, emotion))
  primer_pos = random.randint(0, PRIMER_COUNT - 1)
  primer_filename = ""

  count = 0
  for dirname, _, filenames in os.walk(primer_folder):
    for filename in filenames:
      if filename[-4:] != ".mid":
        continue

      if (count == primer_pos):
        primer_filename = filename
        break

      count += 1
    
    if (primer_filename != ""):
      break

  primer_path = os.path.join(primer_folder, primer_filename)
  print(f"Primer path: {primer_path}")

  attention_sequence = generateMusic(
    MODEL_PATH,
    "melody_rnn",
    "attention_rnn",
    # primer_path=primer_path,
    total_length_steps=70,
    temperature=1
  )

  attention_pretty_midi = mm.midi_io.note_sequence_to_pretty_midi(attention_sequence)
  waveform = attention_pretty_midi.fluidsynth(fs=SAMPLING_RATE)
  scaled = np.int16(waveform / np.max(np.abs(waveform)) * 32767)
  filepath = os.path.join(WAV_SAVE_PATH, 'test.wav')
  write(filepath, SAMPLING_RATE, scaled)
  return send_file(filepath, as_attachment=True, mimetype='audio/wav')



