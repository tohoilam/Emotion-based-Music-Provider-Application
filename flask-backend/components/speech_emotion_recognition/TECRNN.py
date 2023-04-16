"""
package requirements:
SpeechRecognition
PyAudio
"""
import numpy as np
import speech_recognition as sr
import tensorflow as tf
import io
from pydub import AudioSegment

def predict(x, model_path):
    if type(x) is str:
        x = np.array([x])
    elif type(x) is list or type(x) is np.ndarray:
        if type(x[0]) is str:
            x = np.array(x)
        else:
            print("wrong format. Input must either be string or list/np array of strings")
            return
    else:
        print("wrong format. Input must either be string or list of strings")
        return
    model = tf.keras.models.load_model(model_path)
    ys_pred = model.predict(x)
    return ys_pred

def audio_speech_to_text(audio):

    wavIO=io.BytesIO()
    audio.export(wavIO, format="wav")

    response = {"success": True,
                "error": None,
                "results": None}
    recognizer = sr.Recognizer()
    audio_file = sr.WavFile(wavIO)
    with audio_file as source:
        audio_file = recognizer.record(source) # can specift duration. e.g. r.record(source, duraiton = 5.0)
        try: 
            response["results"] = recognizer.recognize_google(audio_data=audio_file)
        except sr.RequestError:
            response["success"] = False
            response["error"] = "API unavailable"
        except sr.UnknownValueError:
            response["success"] = False
            response["error"] = "Unable to recognize speech"
    # return a dictionary, indicating whether transcription is successful and its results
    return response

def evaluateTextInSpeech(audio_path, model_path, audio_happiness, audio_anger, audio_sadness, audio_calmness):
    result = {"success": True,
                "error": None,
                "percentage": None,
                "text": None}

    audio_probability = {"happiness": audio_happiness,
                               "anger": audio_anger,
                               "sadness": audio_sadness,
                               "calmness": audio_calmness
            }
    response = audio_speech_to_text(audio_path)
    if response['success'] == False:
        result['success'] = False
        result['error'] = f"Failed to convert to text, {response['error']}"
        return result
    else:
        result["text"] = response['results']
        text_result = predict(result["text"], model_path)[0]
        text_prbability = {"Happiness": float(text_result[0]),
                            "Anger": float(text_result[1]),
                            "Sadness": float(text_result[2]),
                            "Calmness": float(text_result[3])
        }
        result['percentage'] = text_prbability

    return result




# Example:
# path to audio file ***MUST BE IN WAV FORMAT***
# audio_path = 'C:/Users/SW/Documents/TEC/demo.wav'
# # path to model (can't use .h5 here cuz will lose vocab)
# model_path = 'C:/Users/SW/Documents/TEC/TECRNN_models/Embedding_64, Bi-directional LSTM w. sequence_64, Bi-directional LSTM_32, Dense_64, Dropout_0.5, Dense_softmax_4, lr=0.0001.h5'
# audio_happiness = 0.6
# audio_anger = 0.2
# audio_sadness = 0.1
# audio_almness = 0.1
# mode = "text"

# print(evaluate(audio_path, model_path, mode, audio_happiness, audio_anger, audio_sadness, audio_almness))
# print(evaluate(audio_path, audio_happiness, audio_anger, audio_sadness, audio_almness, model_path, mode, text_weighting)['mode'])
# print(evaluate(audio_path, audio_happiness, audio_anger, audio_sadness, audio_almness, model_path, mode, text_weighting)['audio_probability'])
# print(evaluate(audio_path, audio_happiness, audio_anger, audio_sadness, audio_almness, model_path, mode, text_weighting)['text_probability'])



