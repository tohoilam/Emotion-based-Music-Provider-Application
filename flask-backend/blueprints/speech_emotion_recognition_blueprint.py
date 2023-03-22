import os
import shutil
import json
import numpy as np
import tensorflow as tf
from flask import Flask, request
from flask import Blueprint
from flask_cors import cross_origin

from DataProcessing import DataProcessing


UPLOAD_DIR = os.path.abspath(os.path.join('static', 'data'))
MODEL_PATH = 'models'
MODEL_CONFIG_PATH = os.path.abspath(os.path.join('static', 'models.json'))
MEL_SPEC_DIR = os.path.abspath(os.path.join('static', 'melSpec'))


speech_emotion_recognition_blueprint = Blueprint('speech_emotion_recognition', __name__)

PATH_DIR_NAME = '/speech-emotion-recognition'

@speech_emotion_recognition_blueprint.errorhandler(413)
def too_large(e):
    return "File is too large", 413

# @music_generation_blueprint.route(path_dir_name + '/predict', methods=['POST'])
# @cross_origin()
# def predictMusicGeneration():
#   print('Music Generation Predict')
#   return "Music Generation"

@speech_emotion_recognition_blueprint.route(PATH_DIR_NAME + '/models')
@cross_origin()
def models():
  modelListConfig = getModelConfig()
  if (not modelListConfig):
    errMsg = 'Fail to access model config file'
    print('Failed: ' + errMsg)
    return {'data': [], 'status': 'failed', 'errMsg': errMsg}

  modelOptions = []
  count = 0
  for modelConfig in modelListConfig:
    modelOptions.append({
      'id': count,
      'name': modelConfig['name']
    })
    count += 1

  return {'data': modelOptions, 'status': 'ok', 'errMsg': ''}


@speech_emotion_recognition_blueprint.route(PATH_DIR_NAME + '/predict', methods=['POST'])
@cross_origin()
def predict():
  print('Speech Emotion Recognition Predict')
  # 1). Get model config
  modelListConfig = getModelConfig()
  if (not modelListConfig):
    errMsg = 'Fail to access model config file'
    print('Failed: ' + errMsg)
    return {'data': [], 'status': 'failed', 'errMsg': errMsg}

  # 2). Empty upload directory
  emptyDirectory(UPLOAD_DIR)
    
  # 3). Check if model choice parameter is passed correctly
  if ('modelChoice' not in request.form or request.form['modelChoice'] == 'null'):
    errMsg = 'Model is not selected! Please select a model from dropdown!'
    print('Failed: ' + errMsg)
    return {'data': [], 'status': 'failed', 'errMsg': errMsg}
  
  # 4). Get audio files and save in backend
  if (len(request.files) != 0):
    for filename in request.files:
      try:
        file = request.files[filename]
        file.save(os.path.join(UPLOAD_DIR, file.filename))
      except Exception as e:
        errMsg = 'Save audio file in backend failed! ' + str(e)
        print('Failed: ' + errMsg)
        return {'data': [], 'status': 'failed', 'errMsg': errMsg}
  else:
    warnMsg = 'No audio data to predict.'
    print('Warning: ' + warnMsg)
    return {'data': [], 'status': 'warning', 'errMsg': warnMsg}

  # 5). A: Get Model Choice and Configure Model; B: Load and Process data
  modelChoice = int(request.form['modelChoice'])
  if (modelListConfig != None):
    status, res = getModelAndData(modelChoice, modelListConfig)
    if (status != 'ok'):
      return {'data': [], 'status': status, 'errMsg': res}
    
    model, dataModel = res

  try:
    y_percentages = model.predict(dataModel.x_test)
    y_pred = np.argmax(y_percentages, axis=1)
  except Exception as e:
    errMsg = 'Emotion Prediction from Model Failed! ' + e
    print('Failed: ' + errMsg)
    return {'data': [], 'status': 'failed', 'errMsg': errMsg}

  print('Result Predicted!')
  
  # 6). Pack and return
  predicted_data_list = []
  for i, pred in enumerate(y_pred):
    y_percentage = y_percentages[i]
    predicted_label = dataModel.labels_name[pred]
    recording_name = dataModel.recording_names[i]
    
    percentage_dict = {}
    for pos, percent in enumerate(y_percentage):
      
      percentage_dict[dataModel.labels_name[pos]] = float(percent)
  
    predicted_data_list.append({
      'name': recording_name[0],
      'section': recording_name[1],
      'emotion': predicted_label,
      'percentage': percentage_dict
    })  
  
  return {'data': predicted_data_list, 'status': 'ok', 'errMsg': ''}


def emptyDirectory(directory):
  for filename in os.listdir(directory):
    file_path = os.path.join(directory, filename)
    try:
      if os.path.isfile(file_path) or os.path.islink(file_path):
        os.unlink(file_path)
      elif os.path.isdir(file_path):
        shutil.rmtree(file_path)
    except Exception as e:
      errMsg = f'Empty directory "{directory}" failed! ' + str(e)
      print('Failed: ' + errMsg)
      return {'data': [], 'status': 'failed', 'errMsg': errMsg}

def getModelAndData(modelChoice, modelListConfig, dataFileName=None):
  if (modelListConfig != None):
    if (modelChoice < len(modelListConfig)):
      modelConfig = modelListConfig[modelChoice]
      modelName = modelConfig['name']
      folderName = modelConfig['folderName']
      labelsToInclude = modelConfig['labelsToInclude']
      splitDuration = modelConfig['splitDuration']
      ignoreDuration = modelConfig['ignoreDuration']
      transformByStft = modelConfig['transformByStft']
      hop_length = modelConfig['hop_length']
      win_length = modelConfig['win_length']
      n_mels = modelConfig['n_mels']
      timeShape = modelConfig['timeShape']

      # A). Get Model
      try:
        print(f"Loading Model {modelName} from {MODEL_PATH}/{folderName}...")
        modelDir = os.path.join(os.getcwd(), MODEL_PATH, folderName)
        model = tf.keras.models.load_model(modelDir)
        print('   Model Loading Completed!')
      except Exception as e:
        errMsg = f"Loading model '{modelName}' Failed! " + e
        print('Failed: ' + errMsg)
        return 'failed', errMsg
      
      # B). Get Data Model
      try:
        dataModel = DataProcessing(labelsToInclude=labelsToInclude,
                                  splitDuration=splitDuration,
                                  ignoreDuration=ignoreDuration,
                                  transformByStft=transformByStft,
                                  hop_length=hop_length,
                                  win_length=win_length,
                                  n_mels=n_mels,
                                  timeShape=timeShape)
        dataModel.loadAndExtractTestData(UPLOAD_DIR, dataFileName=dataFileName)
        dataModel.processData()
      except Exception as e:
        errMsg = 'Data Processing Failed! ' + str(e)
        print('Failed: ' + errMsg)
        return 'failed', errMsg

      return 'ok', (model, dataModel)
    else:
      errMsg = 'Selected model not available in backed!'
      print('Failed: ' + errMsg)
      return 'failed', errMsg
  else:
    errMsg = 'modelListConfig variables not initialize in backend'
    print('Failed: ' + errMsg)
    return 'failed', errMsg

def getModelConfig():
  try:
    with open(MODEL_CONFIG_PATH, 'r') as f:
      return json.load(f)
  except:
    return None

