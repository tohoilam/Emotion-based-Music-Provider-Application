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
  if ('mode' not in request.form or request.form['mode'] not in ['audio', 'lyrics', 'combined']):
    errMsg = 'Mode of recommendation is not indicated'
    print('Failed: ' + errMsg)
    return {'data': [], 'status': 'failed', 'errMsg': errMsg}
  
  mode = request.form['mode']
  result = SER_Predict_Full(request, fixed_model_choice=MODEL_CHOICE)
  speech_info = result['data'][0]
  emotion_percentages = speech_info['percentage']

  lyrics_weighting = 0.5

  # path to song_list
  if (mode == 'audio'):
    json_path = os.path.join('components', 'music_recommendation', 'songs_audio.json')
  else:
    json_path = os.path.join('components', 'music_recommendation', 'songs_lyrics.json')

  songList = getSongList(emotion_percentages, mode, json_path, lyrics_weighting=lyrics_weighting, output_no=20)

  returnData = {
    "speech_info": speech_info,
    "song_list": songList,
  }
  return {'data': returnData, 'status': 'ok', 'errMsg': ''}


@music_recommendation_blueprint.route(PATH_DIR_NAME + '/testing')
@cross_origin()
def getSongsTesting():
  speech_info = {
    'percentage': {
      'Anger': 0.1,
      'Happiness': 0.1,
      'Sadness': 0.7,
      'Calmness': 0.1
    },
    'emotion': 'Sadness'
  }
  
  emotion_percentages = speech_info['percentage']

  lyrics_weighting = 0.5
  # mode can be 'audio', 'lyrics' or 'combined'
  mode = 'combined'
  # # speech_prob should be [happiness, anger, sadness, calmness]
  # speech_prob = [0.7, 0.2, 0.05, 0.05]

  # path to song_list
  if (mode == 'audio'):
    json_path = os.path.join('components', 'music_recommendation', 'songs_audio.json')
  else:
    json_path = os.path.join('components', 'music_recommendation', 'songs_lyrics.json')

  songList = getSongList(emotion_percentages, mode, json_path, lyrics_weighting=lyrics_weighting, output_no=20)

  returnData = {
    "speech_info": speech_info,
    "song_list": songList,
  }
  return {'data': returnData, 'status': 'ok', 'errMsg': ''}





