import os
from flask import Blueprint
from flask_cors import cross_origin
from blueprints.speech_emotion_recognition_blueprint import getModelConfig
from components.music_generation.generate_music import generateMusic
import magenta.music as mm
from pretty_midi import PrettyMIDI



music_generation_blueprint = Blueprint('music_generation', __name__)

PATH_DIR_NAME = '/music-generation'
MODEL_PATH = os.path.join("components", "music_generation", "models", "happiness_baseline_attention_model_1.mag")
PRIMERS_MIDI_PATHS = os.path.join("components", "music_generation", "primers")

@music_generation_blueprint.errorhandler(413)
def too_large(e):
    return "File is too large", 413

@music_generation_blueprint.route(PATH_DIR_NAME + '/generate')
@cross_origin()
def generate():
  # primer_path = PRIMERS_MIDI_PATHS[3]
  primer_path = os.path.abspath(os.path.join(PRIMERS_MIDI_PATHS, "Happiness", "TRAAEEH128E0795DFE_0_primer_10.mid"))


  attention_sequence = generateMusic(
    MODEL_PATH,
    "melody_rnn",
    "attention_rnn",
    primer_path=primer_path,
    total_length_steps=70,
    temperature=1
  )

  attention_pretty_midi = mm.midi_io.note_sequence_to_pretty_midi(attention_sequence)
  waveform = attention_pretty_midi.fluidsynth()
  return {'data': str(waveform)}



