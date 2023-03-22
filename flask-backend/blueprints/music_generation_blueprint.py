from flask import Blueprint
from flask_cors import cross_origin
from blueprints.speech_emotion_recognition_blueprint import getModelConfig


music_generation_blueprint = Blueprint('music_generation', __name__)

PATH_DIR_NAME = '/music-generation'

@music_generation_blueprint.errorhandler(413)
def too_large(e):
    return "File is too large", 413

@music_generation_blueprint.route(PATH_DIR_NAME + '/predict')
@cross_origin()
def predictMusicGeneration():
  print('Music Generation Predict')
  modelListConfig = getModelConfig()
  return modelListConfig[0]['name']





