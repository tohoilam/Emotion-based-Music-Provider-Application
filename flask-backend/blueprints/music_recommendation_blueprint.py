import os
import random
import numpy as np
from flask import request
from flask import Blueprint
from flask_cors import cross_origin
from blueprints.speech_emotion_recognition_blueprint import SER_Predict_Full
from components.music_recommendation.get_songs import getSongList



music_recommendation_blueprint = Blueprint('music_recommendation', __name__)

PATH_DIR_NAME = '/music-recommendation'
MODEL_CHOICE = 1 # Final Model
SONGS_JSON_PATH = os.path.join('components', 'music_recommendation', 'songs.json')



@music_recommendation_blueprint.errorhandler(413)
def too_large(e):
    return "File is too large", 413

@music_recommendation_blueprint.route(PATH_DIR_NAME + '/getsongs', methods=['POST'])
@cross_origin()
def getSongs():
  result = SER_Predict_Full(request, fixed_model_choice=MODEL_CHOICE)
  speech_emotion = result['data'][0]
  emotion_percentages = speech_emotion['percentage']

  anger = emotion_percentages['Anger']
  happiness = emotion_percentages['Happiness']
  neutral = emotion_percentages['Neutral']
  sadness = emotion_percentages['Sadness']

  total = anger + happiness + neutral + sadness
  anger /= total
  happiness /= total
  neutral /= total
  sadness /= total

  songList = getSongList(SONGS_JSON_PATH, happiness, neutral, anger, sadness, output_no=10)

  returnData = {
    "emotion": speech_emotion['emotion'],
    "percentage": {
      "Anger" : anger,
      "Happiness": happiness,
      "Neutral": neutral,
      "Sadness": sadness
    },
    "song_list": songList
  }
  return {'data': returnData, 'status': 'ok', 'errMsg': ''}


@music_recommendation_blueprint.route(PATH_DIR_NAME + '/testing')
@cross_origin()
def getSongsTesting():

  songList = getSongList(SONGS_JSON_PATH, 0.1, 0.1, 0.7, 0.1, output_no=10)

  print(songList)
  return songList





