import os
import shutil
import json
import numpy as np
import tensorflow as tf
# from pomegranate import *
from flask import Flask, request, render_template
from flask_cors import CORS, cross_origin


# from components.speech_emotion_recognition.SERDataProcessing import SERDataProcessing
# from HMMDataProcessing import HMMDataProcessing

from blueprints.music_generation_blueprint import music_generation_blueprint
from blueprints.speech_emotion_recognition_blueprint import speech_emotion_recognition_blueprint

app = Flask(__name__, static_folder="static")

app.register_blueprint(music_generation_blueprint)
app.register_blueprint(speech_emotion_recognition_blueprint)


@app.errorhandler(413)
def too_large(e):
  return "File is too large", 413

@app.route('/')
@cross_origin()
def index():
  return "Emotion-based Music Provider API"


if __name__ == "__main__":
  port = int(os.environ.get('PORT', 5000))
  # app.run(host='0.0.0.0', port=port)
  app.run(host='0.0.0.0', port=port, debug=True)