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
from components.music_generation.MEC import get_info2
import magenta.music as mm
from pretty_midi import PrettyMIDI
from scipy.io.wavfile import write, read
from pydub import AudioSegment, effects
from operator import itemgetter


music_generation_blueprint = Blueprint('music_generation', __name__)

PATH_DIR_NAME = '/music-generation'
PRIMER_JSON_PATH = os.path.join("components", "music_generation", "primers", "primers.json")
PRIMERS_MIDI_PATHS = os.path.join("components", "music_generation", "primers")
WAV_SAVE_PATH = os.path.join("components", "music_generation", "generated_wav")
MEC_MODEL_PATH = os.path.join('components', 'music_generation', 'MEC_model.h5')
MEC_EMOTION_CLASS = ['Happiness', 'Anger', 'Sadness', 'Calmness']

SAMPLING_RATE = 16000
PRIMER_COUNT = 30
MODEL_CHOICE = 1 # Final Model


@music_generation_blueprint.errorhandler(413)
def too_large(e):
    return "File is too large", 413

@music_generation_blueprint.route(PATH_DIR_NAME + '/generate', methods=['POST'])
@cross_origin()
def generate():
  # 1). Pack audio files
  fileList = []
  filenameList = []

  if (len(request.files) != 0):
    for filename in request.files:
      file = request.files[filename]

      audio = AudioSegment.from_file(file)
        
      if (audio.frame_rate != 16000):
        audio = audio.set_frame_rate(16000)
      if (audio.channels != 1):
        audio = audio.set_channels(1)

      fileList.append(audio)
      filenameList.append(filename)
  else:
    warnMsg = 'No audio data to predict.'
    print('Warning: ' + warnMsg)
    return {'data': [], 'status': 'warning', 'errMsg': warnMsg}
  


  if ('mode' not in request.form or request.form['mode'] not in ['monophonic', 'polyphonic']):
    errMsg = 'Mode of generation is not indicated'
    print('Failed: ' + errMsg)
    return {'data': [], 'status': 'failed', 'errMsg': errMsg}
  
  # if ('size' not in request.form):
  #   errMsg = 'Size of recommendation is not indicated'
  #   print('Faled: ' + errMsg)
  #   return {'data': [], 'status': 'failed', 'errMsg': errMsg}
  
  mode = request.form['mode']
  # size = int(request.form['size'])
  

  speech_result = SER_Predict_Full(request, fileList, filenameList, fixed_model_choice=MODEL_CHOICE)
  audio_speech_info = speech_result['data'][0]
  audio_emotion_percentages = audio_speech_info['percentage']
  emotion = audio_speech_info['emotion']


  MODEL_PATH = os.path.join("components", "music_generation", "models", mode, emotion + ".mag")

  
  with open(PRIMER_JSON_PATH) as file:
    primers_info_dict = json.load(file)

  primers_info_list = []
  primers_info_list.extend(primers_info_dict['Anger'])
  primers_info_list.extend(primers_info_dict['Calmness'])
  primers_info_list.extend(primers_info_dict['Happiness'])
  primers_info_list.extend(primers_info_dict['Sadness'])

  for primers_info in primers_info_list:
    percentage = primers_info['emotion_percentages']
    primers_info['similarity'] = min(audio_emotion_percentages['Happiness'], percentage[0]) + min(audio_emotion_percentages['Anger'], percentage[1]) + min(audio_emotion_percentages['Sadness'], percentage[2]) + min(audio_emotion_percentages['Calmness'], percentage[3])

  sorted_primers = sorted(primers_info_list, key=itemgetter('similarity'), reverse=True)

  print(f"Emotion: {emotion}")

  # primer_folder = os.path.abspath(os.path.join(PRIMERS_MIDI_PATHS, mode, emotion))
  # primer_pos = random.randint(0, PRIMER_COUNT - 1)
  # primer_filename = ""

  # count = 0
  # for dirname, _, filenames in os.walk(primer_folder):
  #   for filename in filenames:
  #     if filename[-4:] != ".mid":
  #       continue

  #     if (count == primer_pos):
  #       primer_filename = filename
  #       break

  #     count += 1
    
  #   if (primer_filename != ""):
  #     break

  # primer_path = os.path.join(primer_folder, primer_filename)
  # print(f"Primer path: {primer_path}")

  audio_list = []
  generated_music = []
  for i in range(3):
    primer_path = os.path.join(PRIMERS_MIDI_PATHS, "All", sorted_primers[i]['filename'])

    for retryCount in range(3):
      if (mode == "polyphonic"):
        attention_sequence = generateMusic(
          MODEL_PATH,
          "polyphony",
          "polyphony",
          primer_path=primer_path,
          condition_on_primer=True,
          inject_primer_during_generation=True,
          total_length_steps=70,
          temperature=1
        )
      else:
        attention_sequence = generateMusic(
          MODEL_PATH,
          "melody_rnn",
          "attention_rnn",
          primer_path=primer_path,
          total_length_steps=70,
          temperature=1
        )
      print(f"Generated ({i}-{retryCount})")


      attention_pretty_midi = mm.midi_io.note_sequence_to_pretty_midi(attention_sequence)

      # Adjust velocity
      if (emotion != "Anger"):
        for j in range(len(attention_pretty_midi.instruments[0].notes)):
          if (emotion == "Calmness"):
            attention_pretty_midi.instruments[0].notes[j].velocity = 20
          elif (emotion == "Happiness"):
            attention_pretty_midi.instruments[0].notes[j].velocity = 90
          else:
            attention_pretty_midi.instruments[0].notes[j].velocity = 80
      
      waveform = attention_pretty_midi.fluidsynth(fs=SAMPLING_RATE)
      scaled = np.int16(waveform / np.max(np.abs(waveform)) * 32767)
      # Create a BytesIO object to hold the binary data
      wavBuffer = io.BytesIO()
      write(wavBuffer, SAMPLING_RATE, scaled)
      binary_data = wavBuffer.getvalue()
      
      generated_info = get_info2(MEC_MODEL_PATH, attention_pretty_midi, MEC_EMOTION_CLASS)
      if (generated_info["emotion"] == emotion):
        break

    audio_list.append(binary_data)


    generated_emotion_percentages = generated_info['emotion_percentages'][0]

    generated_info['similarity'] = min(audio_emotion_percentages['Happiness'], generated_emotion_percentages[0]) + min(audio_emotion_percentages['Anger'], generated_emotion_percentages[1]) + min(audio_emotion_percentages['Sadness'], generated_emotion_percentages[2]) + min(audio_emotion_percentages['Calmness'], generated_emotion_percentages[3])

    sorted_primers[i]['emotion_percentages'] = {
      "Happiness": sorted_primers[i]['emotion_percentages'][0],
      "Anger": sorted_primers[i]['emotion_percentages'][1],
      "Sadness": sorted_primers[i]['emotion_percentages'][2],
      "Calmness": sorted_primers[i]['emotion_percentages'][3]
    }

    generated_info['emotion_percentages'] = {
      "Happiness": generated_emotion_percentages[0],
      "Anger": generated_emotion_percentages[1],
      "Sadness": generated_emotion_percentages[2],
      "Calmness": generated_emotion_percentages[3]
    }

    generated_music.append({
      "primers_info": sorted_primers[i],
      "generated_info": generated_info
    })



  info = {
    'speech': {
      'emotion': audio_speech_info['emotion'],
      'percentage': audio_speech_info['percentage']
    },
    'generated_music': generated_music
  }

  json_bytes = json.dumps(info).encode('utf-8')
  

  zip_buffer = io.BytesIO()
  with zipfile.ZipFile(zip_buffer, mode='w') as zip_file:
    for pos, audio in enumerate(audio_list):
      zip_file.writestr(f'generated{pos}.wav', audio)
    
    zip_file.writestr('info.json', json_bytes)
  
  zip_buffer.seek(0)
  
  return send_file(zip_buffer, as_attachment=True, download_name='audio_files.zip', mimetype='application/zip')
