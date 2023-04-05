import os
import io
import json
import random
import zipfile
import numpy as np
import base64
from flask import request
from flask import Blueprint, send_file
from flask_cors import cross_origin
from blueprints.speech_emotion_recognition_blueprint import getModelConfig, SER_Predict_Full
from components.music_generation.generate_music import generateMusic
import magenta.music as mm
from pretty_midi import PrettyMIDI
from scipy.io.wavfile import write, read



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

  audio_list = []
  for i in range(2):
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
    # Create a BytesIO object to hold the binary data
    wavBuffer = io.BytesIO()
    write(wavBuffer, SAMPLING_RATE, scaled)
    binary_data = wavBuffer.getvalue()
    audio_list.append(binary_data)

  info = {
    'speech': {
      'emotion': speech_emotion['emotion'],
      'percentage': speech_emotion['percentage']
    }
  }

  json_bytes = json.dumps(info).encode('utf-8')
  

  zip_buffer = io.BytesIO()
  with zipfile.ZipFile(zip_buffer, mode='w') as zip_file:
    for pos, audio in enumerate(audio_list):
      zip_file.writestr(f'generated{pos}.wav', audio)
    
    zip_file.writestr('info.json', json_bytes)
  
  zip_buffer.seek(0)
  
  return send_file(zip_buffer, as_attachment=True, download_name='audio_files.zip', mimetype='application/zip')
