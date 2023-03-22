import os
import json
import numpy as np
import tensorflow as tf
from flask import Flask, request
from flask import Blueprint
from flask_cors import cross_origin

from components.speech_emotion_recognition.SERDataProcessing import SERDataProcessing

speech_emotion_recognition_blueprint = Blueprint('speech_emotion_recognition', __name__)

PATH_DIR_NAME = '/speech-emotion-recognition'

MODEL_PATH = os.path.join('components', 'speech_emotion_recognition')
MODEL_CONFIG_PATH = os.path.abspath(os.path.join('components', 'speech_emotion_recognition', 'models.json'))

@speech_emotion_recognition_blueprint.errorhandler(413)
def too_large(e):
    return "File is too large", 413


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
  return SER_Predict(request)


def SER_Predict_Full(api_request):
  result = SER_Predict(api_request)
  separated_predicted_list = result['data']
  packed_predicted_list = []

  currentName = 'null'
  count = 0
  temp_packed = None
  for separated_predicted in separated_predicted_list:
    if (separated_predicted['name'] != currentName):

      if (temp_packed != None):
        temp_packed['count'] = count
        packed_predicted_list.append(temp_packed)


      currentName = separated_predicted['name']
      count = 1

      temp_packed = {
        'name': separated_predicted['name'],
        'section': 'All',
        'emotion': None,
        'percentage': separated_predicted['percentage'],
        'count': 1
      }
    else:
      for emotion_label in separated_predicted['percentage']:
        temp_packed['percentage'][emotion_label] += separated_predicted['percentage'][emotion_label]
      count += 1
  
  if (temp_packed != None):
    temp_packed['count'] = count
    packed_predicted_list.append(temp_packed)
  
  for packed_predicted in packed_predicted_list:
    max_emotion = ''
    max_value = -1
    for emotion_label in packed_predicted['percentage']:
      packed_predicted['percentage'][emotion_label] /= packed_predicted['count']

      if (packed_predicted['percentage'][emotion_label] > max_value):
        max_value = packed_predicted['percentage'][emotion_label]
        max_emotion = emotion_label
    
    packed_predicted['emotion'] = max_emotion
  
  return {'data': packed_predicted_list, 'status': 'ok', 'errMsg': ''}

def SER_Predict(api_request):
  print('Speech Emotion Recognition Predict')
  # 1). Get model config
  modelListConfig = getModelConfig()
  if (not modelListConfig):
    errMsg = 'Fail to access model config file'
    print('Failed: ' + errMsg)
    return {'data': [], 'status': 'failed', 'errMsg': errMsg}

    
  # 2). Check if model choice parameter is passed correctly
  if ('modelChoice' not in api_request.form or api_request.form['modelChoice'] == 'null'):
    errMsg = 'Model is not selected! Please select a model from dropdown!'
    print('Failed: ' + errMsg)
    return {'data': [], 'status': 'failed', 'errMsg': errMsg}
  
  # 3). Pack audio files
  fileList = []
  filenameList = []

  if (len(api_request.files) != 0):
    for filename in api_request.files:
      file = api_request.files[filename]
      fileList.append(file)
      filenameList.append(filename)
  else:
    warnMsg = 'No audio data to predict.'
    print('Warning: ' + warnMsg)
    return {'data': [], 'status': 'warning', 'errMsg': warnMsg}

  # 4). A: Get Model Choice and Configure Model; B: Load and Process data
  modelChoice = int(api_request.form['modelChoice'])
  if (modelListConfig != None):
    status, res = getModelAndData(modelChoice, modelListConfig, fileList, filenameList)
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
  
  # 5). Pack and return
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


def getModelAndData(modelChoice, modelListConfig, fileList, dataFileName):
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
        dataModel = SERDataProcessing(labelsToInclude=labelsToInclude,
                                      splitDuration=splitDuration,
                                      ignoreDuration=ignoreDuration,
                                      transformByStft=transformByStft,
                                      hop_length=hop_length,
                                      win_length=win_length,
                                      n_mels=n_mels,
                                      timeShape=timeShape)
        dataModel.loadAndExtractTestData(fileList, dataFileName)
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
