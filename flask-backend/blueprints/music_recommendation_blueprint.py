import os
import copy
import random
import lyricsgenius
import numpy as np
from flask import request
from flask import Blueprint
from flask_cors import cross_origin
from pydub import AudioSegment, effects

from blueprints.speech_emotion_recognition_blueprint import SER_Predict_Full, Text_Predict
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
  


  if ('mode' not in request.form or request.form['mode'] not in ['audio', 'combined', 'all']):
    errMsg = 'Mode of recommendation is not indicated'
    print('Failed: ' + errMsg)
    return {'data': [], 'status': 'failed', 'errMsg': errMsg}
  
  mode = request.form['mode']
    

  text_weighting = 0.5

  audio_result = SER_Predict_Full(request, fileList, filenameList, fixed_model_choice=MODEL_CHOICE)
  audio_speech_info = audio_result['data'][0]
  audio_emotion_percentages = audio_speech_info['percentage']

  # path to song_list
  if (mode == 'audio'):
    json_path = os.path.join('components', 'music_recommendation', 'songs_audio.json')

    songList = getSongList(mode, json_path, audio_emotion_percentages, text_weighting=text_weighting, output_no=20)


    returnData = {
      "speech_info": {
        "audio": audio_speech_info
      },
      "song_list": songList,
    }
  elif (mode == 'combined'):
    audio_weighting = 0.5

    text_result = Text_Predict(request, fileList, filenameList, audio_emotion_percentages)
    text_speech_info = text_result['data'][0]
    text_emotion_percentages = text_speech_info["percentage"]

    combined_percentages = combineEmotionPercentages(audio_emotion_percentages, text_emotion_percentages, audio_weighting)
    combined_emotion = max(combined_percentages, key=combined_percentages.get)

    json_path = os.path.join('components', 'music_recommendation', 'songs_lyrics.json')

    songList = getSongList(mode, json_path, audio_emotion_percentages, speech_text_prob=text_emotion_percentages, text_weighting=text_weighting, output_no=20)

    returnData = {
      "speech_info": {
        "audio": audio_speech_info,
        "text": {
          "text": text_speech_info["text"],
          "percentage": text_emotion_percentages,
          "emotion": max(text_emotion_percentages, key=text_emotion_percentages.get)
        },
        "combined": {
          "percentage": combined_percentages,
          "emotion": combined_emotion
        }
      },
      "song_list": songList,
    }
  else :
    audio_weighting = 0.5

    text_result = Text_Predict(request, fileList, filenameList, audio_emotion_percentages)
    text_speech_info = text_result['data'][0]
    text_emotion_percentages = text_speech_info["percentage"]

    combined_percentages = combineEmotionPercentages(audio_emotion_percentages, text_emotion_percentages, audio_weighting)
    combined_emotion = max(combined_percentages, key=combined_percentages.get)

    json_path = os.path.join('components', 'music_recommendation', 'songs_lyrics.json')

    songList = getSongList(mode, json_path, audio_emotion_percentages, speech_text_prob=text_emotion_percentages, text_weighting=text_weighting, text=text_speech_info["text"], output_no=20)

    returnData = {
      "speech_info": {
        "audio": audio_speech_info,
        "text": {
          "text": text_speech_info["text"],
          "percentage": text_emotion_percentages,
          "emotion": max(text_emotion_percentages, key=text_emotion_percentages.get)
        },
        "combined": {
          "percentage": combined_percentages,
          "emotion": combined_emotion
        }
      },
      "song_list": songList,
    }
  return {'data': returnData, 'status': 'ok', 'errMsg': ''}


@music_recommendation_blueprint.route(PATH_DIR_NAME + '/dummy', methods=['POST'])
@cross_origin()
def dummy():
  return {
    "data": {
      "song_list": [
        {
          "artist": "Amy Winehouse",
          "audio": {
            "arousal": 0.06638029962778,
            "distance": 0.6775657286462582,
            "emotion": "Anger",
            "similarity": 0.8067406988606278,
            "valence": -0.008858461864292,
            "weighting": 0.5
          },
          "audio_lyrics_similarity": 0.05692635305846716,
          "combined": {
            "arousal": 0.25765939522534587,
            "distance": 0.4284527172793332,
            "emotion": "Happiness",
            "similarity": 0.8684468761325658,
            "valence": 0.2426383471271646
          },
          "genius_id": "62993",
          "genre": [
            "british soul",
            "neo soul"
          ],
          "lyrics": {
            "arousal": 0.9642572812736034,
            "distance": 0.8588822889357941,
            "emotion": "Happiness",
            "percentage": {
              "Anger": 0.009227296337485313,
              "Calmness": 0.01680458088715871,
              "Happiness": 0.9729013442993164,
              "Sadness": 0.0010667817065647494
            },
            "percentage_per_section": {
              "Anger": [
                0.0022276323288679123,
                0.02124951221048832,
                0.0042047444730997086
              ],
              "Calmness": [
                0.004176042042672634,
                0.03642141446471214,
                0.009816286154091358
              ],
              "Happiness": [
                0.9934613704681396,
                0.9396624565124512,
                0.9855802059173584
              ],
              "Sadness": [
                0.00013494188897311687,
                0.002666599815711379,
                0.0003988034150097519
              ]
            },
            "similarity": 0.7670707302867343,
            "valence": 0.9794118503729503,
            "weighting": 0.5
          },
          "song_name": "Love Is A Losing Game",
          "spotify_id": "3uliGwmB52ZA7brgpZMzyH"
        },
        {
          "artist": "Alicia Keys",
          "audio": {
            "arousal": 0.137674540281295,
            "distance": 0.559220513372746,
            "emotion": "Happiness",
            "similarity": 0.8349236481739686,
            "valence": 0.10279539972543701,
            "weighting": 0.5
          },
          "audio_lyrics_similarity": 0.3677437077470431,
          "combined": {
            "arousal": 0.2271464187748883,
            "distance": 0.45611156122862717,
            "emotion": "Happiness",
            "similarity": 0.8611337527622215,
            "valence": 0.20921669735495615
          },
          "genius_id": "344010",
          "genre": [
            "hip pop",
            "neo soul",
            "pop",
            "r&b",
            "urban contemporary"
          ],
          "lyrics": {
            "arousal": 0.7709111348182582,
            "distance": 0.6088107439362552,
            "emotion": "Happiness",
            "percentage": {
              "Anger": 0.0765370962714466,
              "Calmness": 0.05811722370951126,
              "Happiness": 0.8089184711376826,
              "Sadness": 0.05642723398553547
            },
            "percentage_per_section": {
              "Anger": [
                0.0011561955325305462,
                0.0018748476868495345,
                0.2007559835910797,
                0.0010501483920961618,
                0.25383689999580383,
                0.0005485024303197861
              ],
              "Calmness": [
                0.004675517324358225,
                0.0075317258015275,
                0.033026013523340225,
                0.004533202387392521,
                0.2967154383659363,
                0.0022214448545128107
              ],
              "Happiness": [
                0.9940767288208008,
                0.9904201626777649,
                0.7575178742408752,
                0.9943378567695618,
                0.11995700001716614,
                0.9972012042999268
              ],
              "Sadness": [
                9.147894888883457e-05,
                0.00017339034820906818,
                0.008700096979737282,
                7.887906394898891e-05,
                0.32949069142341614,
                2.8867149012512527e-05
              ]
            },
            "similarity": 0.8228779132560811,
            "valence": 0.7340713896943876,
            "weighting": 0.5
          },
          "song_name": "Fallin'",
          "spotify_id": "0KQx6HOpJueiSkztcS0r7D"
        },
        {
          "artist": "Alicia Keys",
          "audio": {
            "arousal": 0.10937719792127601,
            "distance": 0.5869678071543203,
            "emotion": "Happiness",
            "similarity": 0.8281405755826605,
            "valence": 0.077089399099349,
            "weighting": 0.5
          },
          "audio_lyrics_similarity": 0.6684476312449461,
          "combined": {
            "arousal": 0.06849818179450398,
            "distance": 0.4808490413543723,
            "emotion": "Happiness",
            "similarity": 0.8546966112166535,
            "valence": 0.19051130109333544
          },
          "genius_id": "276051",
          "genre": [
            "hip pop",
            "neo soul",
            "pop",
            "r&b",
            "urban contemporary"
          ],
          "lyrics": {
            "arousal": 0.16461552925673995,
            "distance": 0.023754039360863597,
            "emotion": "Happiness",
            "percentage": {
              "Anger": 0.07768723172401744,
              "Calmness": 0.33785736973264385,
              "Happiness": 0.5046205329043525,
              "Sadness": 0.07983488232795415
            },
            "percentage_per_section": {
              "Anger": [
                0.0038798360619693995,
                0.12454841285943985,
                0.14124317467212677,
                0.010769090615212917,
                0.14551232755184174,
                0.05834673345088959,
                0.05951104685664177
              ],
              "Calmness": [
                0.007419762201607227,
                0.12973164021968842,
                0.33716368675231934,
                0.02185712940990925,
                0.3927902579307556,
                0.7457340955734253,
                0.730305016040802
              ],
              "Happiness": [
                0.9884005784988403,
                0.7257606983184814,
                0.49052998423576355,
                0.9662091135978699,
                0.0947299599647522,
                0.1502075046300888,
                0.11650589108467102
              ],
              "Sadness": [
                0.00029989570612087846,
                0.019959282130002975,
                0.031063130125403404,
                0.0011647200444713235,
                0.36696749925613403,
                0.045711636543273926,
                0.09367801249027252
              ]
            },
            "similarity": 0.9916716232265349,
            "valence": 0.6849558052739928,
            "weighting": 0.5
          },
          "song_name": "If I Ain't Got You",
          "spotify_id": "3XVBdLihbNbxUwZosxcGuJ"
        },
        {
          "artist": "Amy Winehouse",
          "audio": {
            "arousal": 0.160489812493324,
            "distance": 0.6395416210480068,
            "emotion": "Happiness",
            "similarity": 0.8155861058945196,
            "valence": 0.021760459989309002,
            "weighting": 0.5
          },
          "audio_lyrics_similarity": 0.6459746613067439,
          "combined": {
            "arousal": 0.10623306141600806,
            "distance": 0.5029891446063823,
            "emotion": "Happiness",
            "similarity": 0.8490164230649767,
            "valence": 0.16190474417193648
          },
          "genius_id": "801839",
          "genre": [
            "british soul",
            "neo soul"
          ],
          "lyrics": {
            "arousal": 0.26444243317070826,
            "distance": 0.10417863197487527,
            "emotion": "Happiness",
            "percentage": {
              "Anger": 0.10785380429920874,
              "Calmness": 0.28856184606307317,
              "Happiness": 0.5243674122861454,
              "Sadness": 0.07921689623721509
            },
            "percentage_per_section": {
              "Anger": [
                0.0008912197081372142,
                0.2519749104976654,
                0.04837900027632713,
                0.1803407371044159,
                0.04837900027632713,
                0.1803407371044159,
                0.04467102512717247
              ],
              "Calmness": [
                0.004316073376685381,
                0.12919797003269196,
                0.13780000805854797,
                0.42040547728538513,
                0.13780000805854797,
                0.42040547728538513,
                0.7700079083442688
              ],
              "Happiness": [
                0.9947239756584167,
                0.5854743123054504,
                0.7985186576843262,
                0.19630859792232513,
                0.7985186576843262,
                0.19630859792232513,
                0.10071908682584763
              ],
              "Sadness": [
                6.87079518684186e-05,
                0.033352769911289215,
                0.01530224084854126,
                0.20294518768787384,
                0.01530224084854126,
                0.20294518768787384,
                0.08460193872451782
              ]
            },
            "similarity": 0.9644757459347837,
            "valence": 0.625858516698437,
            "weighting": 0.5
          },
          "song_name": "Our Day Will Come",
          "spotify_id": "4NDpn6yfD5aqafYWFEaJDz"
        },
        {
          "artist": "Adele",
          "audio": {
            "arousal": -0.015734177082777002,
            "distance": 0.7394735603268403,
            "emotion": "Sadness",
            "similarity": 0.7927426726252319,
            "valence": -0.055401094257831004,
            "weighting": 0.5
          },
          "audio_lyrics_similarity": 0.46227368533921775,
          "combined": {
            "arousal": 0.06815216686421383,
            "distance": 0.5057784336263502,
            "emotion": "Happiness",
            "similarity": 0.8483061632609041,
            "valence": 0.1651433547958733
          },
          "genius_id": "68146",
          "genre": [
            "british soul",
            "pop",
            "pop soul",
            "uk pop"
          ],
          "lyrics": {
            "arousal": 0.2883428445396323,
            "distance": 0.13358714019565415,
            "emotion": "Happiness",
            "percentage": {
              "Anger": 0.08682794799096882,
              "Calmness": 0.3006437824418147,
              "Happiness": 0.5573434742788473,
              "Sadness": 0.05518478438413391
            },
            "percentage_per_section": {
              "Anger": [
                0.12713143229484558,
                0.10862717777490616,
                0.0803322121500969,
                0.10410797595977783,
                0.09792746603488922,
                0.0028414237312972546
              ],
              "Calmness": [
                0.20733316242694855,
                0.13842803239822388,
                0.5049570798873901,
                0.37401172518730164,
                0.5715785026550293,
                0.007554192095994949
              ],
              "Happiness": [
                0.6384245753288269,
                0.7360456585884094,
                0.374904066324234,
                0.4852910339832306,
                0.12003494054079056,
                0.9893605709075928
              ],
              "Sadness": [
                0.027110790833830833,
                0.016899144276976585,
                0.03980664163827896,
                0.036589231342077255,
                0.21045909821987152,
                0.0002437999937683344
              ]
            },
            "similarity": 0.9548998997821244,
            "valence": 0.7159745134413242,
            "weighting": 0.5
          },
          "song_name": "Make You Feel My Love",
          "spotify_id": "273QnyCvJB65rScHJ1nPZb"
        },
        {
          "artist": "Alessia Cara",
          "audio": {
            "arousal": 0.19160979986190702,
            "distance": 0.6564086442832537,
            "emotion": "Happiness",
            "similarity": 0.8116385712873726,
            "valence": 0.005347146652638001,
            "weighting": 0.5
          },
          "audio_lyrics_similarity": 0.628008153444777,
          "combined": {
            "arousal": 0.0611750057691499,
            "distance": 0.5180478359730291,
            "emotion": "Happiness",
            "similarity": 0.8451959623024667,
            "valence": 0.1540396024421269
          },
          "genius_id": "4506454",
          "genre": [
            "canadian contemporary r&b",
            "canadian pop",
            "dance pop",
            "pop",
            "post-teen pop"
          ],
          "lyrics": {
            "arousal": 0.05309022321469259,
            "distance": 0.12410117195494581,
            "emotion": "Calmness",
            "percentage": {
              "Anger": 0.1424996354099777,
              "Calmness": 0.42136015536056626,
              "Happiness": 0.38404547619736856,
              "Sadness": 0.05209474448606165
            },
            "percentage_per_section": {
              "Anger": [
                0.1712024062871933,
                0.03531284257769585,
                0.013217666186392307,
                0.12600111961364746,
                0.03531284257769585,
                0.01224521268159151,
                0.874786913394928,
                0.006964287254959345,
                0.007453428115695715
              ],
              "Calmness": [
                0.48785874247550964,
                0.09205570816993713,
                0.9030121564865112,
                0.3481508195400238,
                0.09205570816993713,
                0.9069563746452332,
                0.018224254250526428,
                0.020696211606264114,
                0.9232314229011536
              ],
              "Happiness": [
                0.1796530932188034,
                0.8627403378486633,
                0.015911869704723358,
                0.4847176969051361,
                0.8627403378486633,
                0.015486751683056355,
                0.054917871952056885,
                0.97142493724823,
                0.008816389366984367
              ],
              "Sadness": [
                0.16128569841384888,
                0.009891140274703503,
                0.06785838305950165,
                0.04113037511706352,
                0.009891140274703503,
                0.06531166285276413,
                0.05207093060016632,
                0.0009145622025243938,
                0.060498807579278946
              ]
            },
            "similarity": 0.9579678297770747,
            "valence": 0.6108112631158695,
            "weighting": 0.5
          },
          "song_name": "I'm Like A Bird - Recorded at Spotify Studios NYC",
          "spotify_id": "2JtSnwYNKOphDrshYL8n4p"
        },
        {
          "artist": "Alessia Cara",
          "audio": {
            "arousal": 0.22881542146205902,
            "distance": 0.627006514850875,
            "emotion": "Happiness",
            "similarity": 0.8185447673872882,
            "valence": 0.037375096231698005,
            "weighting": 0.5
          },
          "audio_lyrics_similarity": 0.6031908271058146,
          "combined": {
            "arousal": 0.191307410520191,
            "distance": 0.5216733831039562,
            "emotion": "Happiness",
            "similarity": 0.844281273985201,
            "valence": 0.14019243477378016
          },
          "genius_id": "2104392",
          "genre": [
            "canadian contemporary r&b",
            "canadian pop",
            "dance pop",
            "pop",
            "post-teen pop"
          ],
          "lyrics": {
            "arousal": 0.536414220618705,
            "distance": 0.39480463895110274,
            "emotion": "Happiness",
            "percentage": {
              "Anger": 0.05806616577319801,
              "Calmness": 0.051556376895556845,
              "Happiness": 0.7101409445361545,
              "Sadness": 0.18023650594598925
            },
            "percentage_per_section": {
              "Anger": [
                0.03412826359272003,
                0.0036686924286186695,
                0.3007960915565491,
                0.0036686924286186695,
                0.0026374496519565582,
                0.00349780498072505
              ],
              "Calmness": [
                0.00884516816586256,
                0.017899058759212494,
                0.2410675436258316,
                0.017899058759212494,
                0.006511731073260307,
                0.017115700989961624
              ],
              "Happiness": [
                0.003941899631172419,
                0.9779602885246277,
                0.3314005136489868,
                0.9779602885246277,
                0.9906405210494995,
                0.9789421558380127
              ],
              "Sadness": [
                0.9530846476554871,
                0.00047194649232551455,
                0.1267358511686325,
                0.00047194649232551455,
                0.00021028894116170704,
                0.0004443549260031432
              ]
            },
            "similarity": 0.8775127983666208,
            "valence": 0.5233946428634226,
            "weighting": 0.5
          },
          "song_name": "Scars To Your Beautiful",
          "spotify_id": "0wI7QkCcs8FUQE1OkXUIqd"
        },
        {
          "artist": "Amy Winehouse",
          "audio": {
            "arousal": 0.12437191605567902,
            "distance": 0.6447475388925746,
            "emotion": "Happiness",
            "similarity": 0.8143636294360481,
            "valence": 0.017902331426739002,
            "weighting": 0.5
          },
          "audio_lyrics_similarity": 0.5188898903184698,
          "combined": {
            "arousal": 0.1746500831629548,
            "distance": 0.5242958834882339,
            "emotion": "Happiness",
            "similarity": 0.8436208770600668,
            "valence": 0.1370420954190193
          },
          "genius_id": "3053759",
          "genre": [
            "british soul",
            "neo soul"
          ],
          "lyrics": {
            "arousal": 0.5742284165961402,
            "distance": 0.4282889114458643,
            "emotion": "Happiness",
            "percentage": {
              "Anger": 0.17682927634034837,
              "Calmness": 0.15484809316694736,
              "Happiness": 0.6102849319577217,
              "Sadness": 0.0580376699300749
            },
            "percentage_per_section": {
              "Anger": [
                0.14102429151535034,
                0.005744459107518196,
                0.6560866236686707,
                0.005744459107518196,
                0.25069552659988403,
                0.00791357085108757,
                0.17059600353240967
              ],
              "Calmness": [
                0.5602076053619385,
                0.01999720185995102,
                0.0679452046751976,
                0.01999720185995102,
                0.1774459034204483,
                0.02519574575126171,
                0.21314778923988342
              ],
              "Happiness": [
                0.15151898562908173,
                0.9734430909156799,
                0.10349578410387039,
                0.9734430909156799,
                0.5269618630409241,
                0.965658962726593,
                0.5774727463722229
              ],
              "Sadness": [
                0.14724911749362946,
                0.0008152042864821851,
                0.17247235774993896,
                0.0008152042864821851,
                0.04489665850996971,
                0.0012316900538280606,
                0.03878345713019371
              ]
            },
            "similarity": 0.8684905571482845,
            "valence": 0.5302660502493382,
            "weighting": 0.5
          },
          "song_name": "Stronger Than Me",
          "spotify_id": "5LC7nItIEFp4nzdFdEGbf9"
        },
        {
          "artist": "Alessia Cara",
          "audio": {
            "arousal": 0.021413939073681002,
            "distance": 0.637441418050746,
            "emotion": "Happiness",
            "similarity": 0.8160803244036675,
            "valence": 0.040556181222200005,
            "weighting": 0.5
          },
          "audio_lyrics_similarity": 0.7272475820371047,
          "combined": {
            "arousal": 0.023829570421690108,
            "distance": 0.5370317054854288,
            "emotion": "Happiness",
            "similarity": 0.8404283835947359,
            "valence": 0.143531698707698
          },
          "genius_id": "4045072",
          "genre": [
            "canadian contemporary r&b",
            "canadian pop",
            "dance pop",
            "pop",
            "post-teen pop"
          ],
          "lyrics": {
            "arousal": 0.07390434261307943,
            "distance": 0.15772217632224844,
            "emotion": "Happiness",
            "percentage": {
              "Anger": 0.05237568318585141,
              "Calmness": 0.2822088186836077,
              "Happiness": 0.4845764881206883,
              "Sadness": 0.18083898762900694
            },
            "percentage_per_section": {
              "Anger": [
                0.09869682043790817,
                0.10701031237840652,
                0.031616292893886566,
                0.03783194348216057,
                0.10701031237840652,
                0.031616292893886566,
                0.047249384224414825,
                0.009346836246550083,
                0.0010029537370428443
              ],
              "Calmness": [
                0.39327123761177063,
                0.5946835279464722,
                0.06831493228673935,
                0.03957849740982056,
                0.5946835279464722,
                0.06831493228673935,
                0.753726065158844,
                0.022930409759283066,
                0.0043762377463281155
              ],
              "Happiness": [
                0.06468424946069717,
                0.22231510281562805,
                0.8947967886924744,
                0.009499836713075638,
                0.22231510281562805,
                0.8947967886924744,
                0.09173013269901276,
                0.9665073156356812,
                0.9945430755615234
              ],
              "Sadness": [
                0.44334766268730164,
                0.07599105685949326,
                0.00527201546356082,
                0.9130896925926208,
                0.07599105685949326,
                0.00527201546356082,
                0.10729437321424484,
                0.0012153943534940481,
                7.762116729281843e-05
              ]
            },
            "similarity": 0.9471820862185907,
            "valence": 0.533570613608592,
            "weighting": 0.5
          },
          "song_name": "Out Of Love",
          "spotify_id": "4WzhjxvLP95y7AMDy0Atwb"
        },
        {
          "artist": "Aerosmith",
          "audio": {
            "arousal": 0.22185114026069602,
            "distance": 0.6174053669500621,
            "emotion": "Happiness",
            "similarity": 0.8208254845707439,
            "valence": 0.04635777324438,
            "weighting": 0.5
          },
          "audio_lyrics_similarity": 0.5646666435059158,
          "combined": {
            "arousal": 0.0009376134257762653,
            "distance": 0.5556456762880924,
            "emotion": "Happiness",
            "similarity": 0.8358056374797053,
            "valence": 0.13085760816466038
          },
          "genius_id": "error",
          "genre": [
            "album rock",
            "classic rock",
            "hard rock",
            "rock"
          ],
          "lyrics": {
            "arousal": -0.21810068655759096,
            "distance": 0.42640770029441555,
            "emotion": "Calmness",
            "percentage": {
              "Anger": 0.19695949042215943,
              "Calmness": 0.5445461634080857,
              "Happiness": 0.19399016629904509,
              "Sadness": 0.06450419007160235
            },
            "percentage_per_section": {
              "Anger": [
                0.04178132861852646,
                0.023652207106351852,
                0.011836932972073555,
                0.023994427174329758,
                0.9048811197280884,
                0.023320524021983147,
                0.026266980916261673,
                0.5199424028396606
              ],
              "Calmness": [
                0.793274998664856,
                0.8560711741447449,
                0.027159394696354866,
                0.854820191860199,
                0.01256488636136055,
                0.8569733500480652,
                0.8329969048500061,
                0.12250840663909912
              ],
              "Happiness": [
                0.11406861245632172,
                0.07204494625329971,
                0.9592539668083191,
                0.07295360416173935,
                0.05400089919567108,
                0.07156875729560852,
                0.09469668567180634,
                0.11333385854959488
              ],
              "Sadness": [
                0.05087507516145706,
                0.04823167994618416,
                0.0017497573280707002,
                0.048231761902570724,
                0.02855304442346096,
                0.048137448728084564,
                0.04603936895728111,
                0.24421538412570953
              ]
            },
            "similarity": 0.8689925224426417,
            "valence": 0.4770726594142616,
            "weighting": 0.5
          },
          "song_name": "I Don't Want to Miss a Thing - From \"Armageddon\" Soundtrack",
          "spotify_id": "225xvV8r1yKMHErSWivnow"
        },
        {
          "artist": "Aerosmith",
          "audio": {
            "arousal": 0.144139885902404,
            "distance": 0.6799359729684542,
            "emotion": "Anger",
            "similarity": 0.8061956661750985,
            "valence": -0.018295114859938,
            "weighting": 0.5
          },
          "audio_lyrics_similarity": 0.6934553922037592,
          "combined": {
            "arousal": 0.11622528402420504,
            "distance": 0.5635489033321843,
            "emotion": "Happiness",
            "similarity": 0.8338582293426623,
            "valence": 0.09996940539514836
          },
          "genius_id": "111167",
          "genre": [
            "album rock",
            "classic rock",
            "hard rock",
            "rock"
          ],
          "lyrics": {
            "arousal": 0.32076125019441615,
            "distance": 0.28793157188621465,
            "emotion": "Happiness",
            "percentage": {
              "Anger": 0.2501912536258301,
              "Calmness": 0.2988969967488877,
              "Happiness": 0.41018937147137796,
              "Sadness": 0.04072236531713067
            },
            "percentage_per_section": {
              "Anger": [
                0.05730174854397774,
                0.1935991644859314,
                0.219342902302742,
                0.9304236769676208,
                0.08937117457389832,
                0.9233843684196472,
                0.20684687793254852,
                0.0008264362695626915,
                0.06335405260324478,
                0.0466047078371048,
                0.02104867994785309
              ],
              "Calmness": [
                0.29111048579216003,
                0.36251866817474365,
                0.28820857405662537,
                0.00412118062376976,
                0.6504855751991272,
                0.007395762484520674,
                0.2873319089412689,
                0.003444134956225753,
                0.5144198536872864,
                0.7973604798316956,
                0.08147034049034119
              ],
              "Happiness": [
                0.6337992548942566,
                0.3792264759540558,
                0.4377579689025879,
                0.013124906457960606,
                0.16740374267101288,
                0.02740548737347126,
                0.45725932717323303,
                0.9956730008125305,
                0.39336976408958435,
                0.11322296410799026,
                0.8938401937484741
              ],
              "Sadness": [
                0.017788473516702652,
                0.06465573608875275,
                0.054690517485141754,
                0.052330195903778076,
                0.09273948520421982,
                0.0418144129216671,
                0.048561856150627136,
                5.6412020057905465e-05,
                0.02885625697672367,
                0.04281189292669296,
                0.0036407792940735817
              ]
            },
            "similarity": 0.9076064086597737,
            "valence": 0.41817273644053143,
            "weighting": 0.5
          },
          "song_name": "Cryin'",
          "spotify_id": "0NJC0FDCODpPUntRTTQq97"
        },
        {
          "artist": "6LACK",
          "audio": {
            "arousal": 0.173144280910491,
            "distance": 0.5616817345366516,
            "emotion": "Happiness",
            "similarity": 0.8343174930803041,
            "valence": 0.09963207691907801,
            "weighting": 0.5
          },
          "audio_lyrics_similarity": 0.6383021617075428,
          "combined": {
            "arousal": -0.01682719419477531,
            "distance": 0.564590425266959,
            "emotion": "Calmness",
            "similarity": 0.8336022679090561,
            "valence": 0.12726562295574675
          },
          "genius_id": "8852762",
          "genre": [
            "atl hip hop",
            "hip hop",
            "melodic rap",
            "pop",
            "r&b",
            "rap",
            "trap"
          ],
          "lyrics": {
            "arousal": -0.24045305768959224,
            "distance": 0.4785501968248144,
            "emotion": "Calmness",
            "percentage": {
              "Anger": 0.1450469916453585,
              "Calmness": 0.4699887279421091,
              "Happiness": 0.23472647950984538,
              "Sadness": 0.15023781138006598
            },
            "percentage_per_section": {
              "Anger": [
                0.24025483429431915,
                0.05508424714207649,
                0.09198928624391556,
                0.0877755731344223,
                0.4861230254173279,
                0.1506766825914383,
                0.0331580676138401,
                0.01531421672552824
              ],
              "Calmness": [
                0.2748643159866333,
                0.24101105332374573,
                0.6515059471130371,
                0.5838769674301147,
                0.13453693687915802,
                0.4680677354335785,
                0.5121253132820129,
                0.8939215540885925
              ],
              "Happiness": [
                0.37799328565597534,
                0.6911608576774597,
                0.15321476757526398,
                0.10357055068016052,
                0.2642112076282501,
                0.2413916140794754,
                0.02907668426632881,
                0.017192868515849113
              ],
              "Sadness": [
                0.10688755661249161,
                0.012743850238621235,
                0.10329009592533112,
                0.224776953458786,
                0.11512886732816696,
                0.13986392319202423,
                0.42563989758491516,
                0.0735713467001915
              ]
            },
            "similarity": 0.8552907533706716,
            "valence": 0.40943041490390897,
            "weighting": 0.5
          },
          "song_name": "Since I Have A Lover",
          "spotify_id": "5D1QJgn1rP8docnVY6MRJ9"
        },
        {
          "artist": "Akon",
          "audio": {
            "arousal": 0.015609966591000002,
            "distance": 0.7050849958111187,
            "emotion": "Anger",
            "similarity": 0.800457739564818,
            "valence": -0.027483150362968,
            "weighting": 0.5
          },
          "audio_lyrics_similarity": 0.6427627785014924,
          "combined": {
            "arousal": -0.029943218585685966,
            "distance": 0.5691122103755295,
            "emotion": "Calmness",
            "similarity": 0.8324928266488663,
            "valence": 0.1271288336865838
          },
          "genius_id": "7733",
          "genre": [
            "dance pop"
          ],
          "lyrics": {
            "arousal": -0.13538284093374386,
            "distance": 0.32681513029619086,
            "emotion": "Calmness",
            "percentage": {
              "Anger": 0.07981907314388081,
              "Calmness": 0.4155097361654043,
              "Happiness": 0.35248950638924725,
              "Sadness": 0.1521816668100655
            },
            "percentage_per_section": {
              "Anger": [
                0.1193196028470993,
                0.012661315500736237,
                0.11932030320167542,
                0.006981176789849997,
                0.11932030320167542,
                0.022309277206659317,
                0.11932030320167542,
                0.11932030320167542
              ],
              "Calmness": [
                0.30352678894996643,
                0.9071864485740662,
                0.30347099900245667,
                0.02481992542743683,
                0.30347099900245667,
                0.8746607303619385,
                0.30347099900245667,
                0.30347099900245667
              ],
              "Happiness": [
                0.5515533089637756,
                0.0253149326890707,
                0.551612377166748,
                0.0021711683366447687,
                0.551612377166748,
                0.034427132457494736,
                0.551612377166748,
                0.551612377166748
              ],
              "Sadness": [
                0.025600284337997437,
                0.054837290197610855,
                0.025596309453248978,
                0.9660277366638184,
                0.025596309453248978,
                0.0686027854681015,
                0.025596309453248978,
                0.025596309453248978
              ]
            },
            "similarity": 0.8964215410801155,
            "valence": 0.5359984851093031,
            "weighting": 0.5
          },
          "song_name": "Bananza (Belly Dancer)",
          "spotify_id": "3PvyuRHVLEMAnCIqwSSLlp"
        },
        {
          "artist": "Aerosmith",
          "audio": {
            "arousal": 0.057041637599468,
            "distance": 0.7859465821198773,
            "emotion": "Anger",
            "similarity": 0.7825497179146559,
            "valence": -0.117017470300197,
            "weighting": 0.5
          },
          "audio_lyrics_similarity": 0.611693028153645,
          "combined": {
            "arousal": 0.0038276248508029003,
            "distance": 0.5738527219356546,
            "emotion": "Happiness",
            "similarity": 0.8313328862423477,
            "valence": 0.11095155682414785
          },
          "genius_id": "111164",
          "genre": [
            "album rock",
            "classic rock",
            "hard rock",
            "rock"
          ],
          "lyrics": {
            "arousal": -0.0417311381962564,
            "distance": 0.23116512913459283,
            "emotion": "Calmness",
            "percentage": {
              "Anger": 0.11001050989660952,
              "Calmness": 0.41128792779313195,
              "Happiness": 0.36912392100526226,
              "Sadness": 0.10957764083286747
            },
            "percentage_per_section": {
              "Anger": [
                0.09147654473781586,
                0.36407262086868286,
                0.09147654473781586,
                0.0058356840163469315,
                0.09147654473781586,
                0.1685544103384018,
                0.04602304846048355,
                0.03935745358467102,
                0.09182173758745193
              ],
              "Calmness": [
                0.6151238083839417,
                0.014706769958138466,
                0.6151238083839417,
                0.012324446812272072,
                0.6151238083839417,
                0.33811068534851074,
                0.06025612726807594,
                0.805532693862915,
                0.6252892017364502
              ],
              "Happiness": [
                0.22268696129322052,
                0.020758213475346565,
                0.22268696129322052,
                0.9812561869621277,
                0.22268696129322052,
                0.4541120231151581,
                0.8881248235702515,
                0.10327944159507751,
                0.20652371644973755
              ],
              "Sadness": [
                0.07071268558502197,
                0.6004623770713806,
                0.07071268558502197,
                0.0005837319768033922,
                0.07071268558502197,
                0.03922289237380028,
                0.0055959802120924,
                0.05183039978146553,
                0.07636532932519913
              ]
            },
            "similarity": 0.9244457725236482,
            "valence": 0.5608236975967884,
            "weighting": 0.5
          },
          "song_name": "Dude (Looks Like A Lady)",
          "spotify_id": "61ISbQijzcKhmlu7rWQ8xF"
        },
        {
          "artist": "Alec Benjamin",
          "audio": {
            "arousal": 0.285758167505264,
            "distance": 0.5795682645385746,
            "emotion": "Happiness",
            "similarity": 0.8299386594357429,
            "valence": 0.094115152955055,
            "weighting": 0.5
          },
          "audio_lyrics_similarity": 0.7750535844825208,
          "combined": {
            "arousal": 0.07740343312200686,
            "distance": 0.5741689265000055,
            "emotion": "Happiness",
            "similarity": 0.8312556301563575,
            "valence": 0.09405513360564194
          },
          "genius_id": "2847815",
          "genre": [
            "alt z",
            "electropop",
            "pop"
          ],
          "lyrics": {
            "arousal": 0.023855564982763422,
            "distance": 0.40510165473747756,
            "emotion": "Happiness",
            "percentage": {
              "Anger": 0.16930599650368094,
              "Calmness": 0.2984309047460556,
              "Happiness": 0.3426217859877007,
              "Sadness": 0.18964133364248223
            },
            "percentage_per_section": {
              "Anger": [
                0.13606643676757812,
                0.2767214775085449,
                0.013285903260111809,
                0.6973578929901123,
                0.044158075004816055,
                0.013285903260111809,
                0.004266286734491587
              ],
              "Calmness": [
                0.1517111212015152,
                0.2568471133708954,
                0.7588286995887756,
                0.007367614656686783,
                0.12160947173833847,
                0.7588286995887756,
                0.033823613077402115
              ],
              "Happiness": [
                0.040289003401994705,
                0.14942623674869537,
                0.20236487686634064,
                0.017580920830368996,
                0.8251299858093262,
                0.20236487686634064,
                0.9611966013908386
              ],
              "Sadness": [
                0.6719334721565247,
                0.3170051872730255,
                0.02552053891122341,
                0.27769359946250916,
                0.009102473966777325,
                0.02552053891122341,
                0.0007135248160921037
              ]
            },
            "similarity": 0.8747184013614486,
            "valence": 0.28210538146751274,
            "weighting": 0.5
          },
          "song_name": "Water Fountain",
          "spotify_id": "4IhKLu7Vk3j2TLmnFPl6To"
        },
        {
          "artist": "Alec Benjamin",
          "audio": {
            "arousal": 0.26921948790550204,
            "distance": 0.47310922277856776,
            "emotion": "Happiness",
            "similarity": 0.8567002834503794,
            "valence": 0.19945757091045302,
            "weighting": 0.5
          },
          "audio_lyrics_similarity": 0.7152294462236268,
          "combined": {
            "arousal": 0.2742492783193787,
            "distance": 0.5744920946719014,
            "emotion": "Happiness",
            "similarity": 0.8311766875353154,
            "valence": 0.09698304293366752
          },
          "genius_id": "4093777",
          "genre": [
            "alt z",
            "electropop",
            "pop"
          ],
          "lyrics": {
            "arousal": 0.8277776253720126,
            "distance": 0.8129387186536844,
            "emotion": "Happiness",
            "percentage": {
              "Anger": 0.36301795082787675,
              "Calmness": 0.043366438553979,
              "Happiness": 0.5508708618581295,
              "Sadness": 0.042744751165931426
            },
            "percentage_per_section": {
              "Anger": [
                0.8957704305648804,
                0.021455038338899612,
                0.7653703093528748,
                0.021455038338899612,
                0.4526018500328064,
                0.021455038338899612
              ],
              "Calmness": [
                0.008500405587255955,
                0.032649558037519455,
                0.03742514178156853,
                0.032649558037519455,
                0.11632440984249115,
                0.032649558037519455
              ],
              "Happiness": [
                0.024163737893104553,
                0.9431951642036438,
                0.07811271399259567,
                0.9431951642036438,
                0.3733632266521454,
                0.9431951642036438
              ],
              "Sadness": [
                0.07156536728143692,
                0.0027002613060176373,
                0.11909179389476776,
                0.0027002613060176373,
                0.05771056190133095,
                0.0027002613060176373
              ]
            },
            "similarity": 0.776748958051779,
            "valence": 0.18847460082421708,
            "weighting": 0.5
          },
          "song_name": "If I Killed Someone For You",
          "spotify_id": "0WHi11uzahqpEtPGYCW6oQ"
        },
        {
          "artist": "ABBA",
          "audio": {
            "arousal": 0.017158405855298,
            "distance": 0.7289443713206278,
            "emotion": "Anger",
            "similarity": 0.7950890504051714,
            "valence": -0.052214782685041004,
            "weighting": 0.5
          },
          "audio_lyrics_similarity": 0.6694762531098808,
          "combined": {
            "arousal": 0.05131803555155377,
            "distance": 0.5764761093923926,
            "emotion": "Happiness",
            "similarity": 0.8306923663461359,
            "valence": 0.09641564947863435
          },
          "genius_id": "396186",
          "genre": [
            "europop",
            "swedish pop"
          ],
          "lyrics": {
            "arousal": 0.1881137363509171,
            "distance": 0.22444293987250574,
            "emotion": "Happiness",
            "percentage": {
              "Anger": 0.1399458090826455,
              "Calmness": 0.26482763120697606,
              "Happiness": 0.4541110590928131,
              "Sadness": 0.14111552197816005
            },
            "percentage_per_section": {
              "Anger": [
                0.06709855049848557,
                0.19637346267700195,
                0.17929679155349731,
                0.0303921140730381,
                0.5712599158287048,
                0.01997653767466545,
                0.07484491169452667,
                0.11776192486286163,
                0.002508072881028056
              ],
              "Calmness": [
                0.19714996218681335,
                0.4055801331996918,
                0.22129881381988525,
                0.8136165738105774,
                0.0655503049492836,
                0.035656899213790894,
                0.10848697274923325,
                0.5298033356666565,
                0.006305685266852379
              ],
              "Happiness": [
                0.03310287743806839,
                0.2150997668504715,
                0.543962836265564,
                0.04205562546849251,
                0.3231225311756134,
                0.941942036151886,
                0.8046471476554871,
                0.1920718401670456,
                0.9909948706626892
              ],
              "Sadness": [
                0.7026486396789551,
                0.18294666707515717,
                0.05544154345989227,
                0.11393571645021439,
                0.040067195892333984,
                0.0024245092645287514,
                0.012021034955978394,
                0.16036295890808105,
                0.0001914321182994172
              ]
            },
            "similarity": 0.9264813322801739,
            "valence": 0.43787738059957837,
            "weighting": 0.5
          },
          "song_name": "Lay All Your Love On Me",
          "spotify_id": "4euAGZTszWPrriggYK0HG9"
        },
        {
          "artist": "Avenged Sevenfold",
          "audio": {
            "arousal": 0.187630116939544,
            "distance": 0.5945368282486232,
            "emotion": "Happiness",
            "similarity": 0.8263093516575154,
            "valence": 0.067114040255546,
            "weighting": 0.5
          },
          "audio_lyrics_similarity": 0.6179931475780904,
          "combined": {
            "arousal": -0.01882275845855491,
            "distance": 0.579758460435596,
            "emotion": "Calmness",
            "similarity": 0.8298923441973678,
            "valence": 0.11192262941040085
          },
          "genius_id": "88286",
          "genre": [
            "alternative metal"
          ],
          "lyrics": {
            "arousal": -0.26292115077376366,
            "distance": 0.5129975807623632,
            "emotion": "Calmness",
            "percentage": {
              "Anger": 0.17267323238775134,
              "Calmness": 0.49442204646766186,
              "Happiness": 0.19586619222536683,
              "Sadness": 0.13703852472826838
            },
            "percentage_per_section": {
              "Anger": [
                0.07777353376150131,
                0.17916099727153778,
                0.07012954354286194,
                0.2070561945438385,
                0.45685121417045593,
                0.02803761698305607,
                0.3343391418457031,
                0.02803761698305607
              ],
              "Calmness": [
                0.7144510746002197,
                0.30394619703292847,
                0.5229769349098206,
                0.3187379837036133,
                0.15704156458377838,
                0.8180573582649231,
                0.30210790038108826,
                0.8180573582649231
              ],
              "Happiness": [
                0.11782990396022797,
                0.46477094292640686,
                0.06246320903301239,
                0.3663955330848694,
                0.295318067073822,
                0.026382187381386757,
                0.2073875069618225,
                0.026382187381386757
              ],
              "Sadness": [
                0.08994553983211517,
                0.05212194100022316,
                0.34443023800849915,
                0.10781023651361465,
                0.09078910946846008,
                0.127522811293602,
                0.15616551041603088,
                0.127522811293602
              ]
            },
            "similarity": 0.8464733980338824,
            "valence": 0.3805764773860574,
            "weighting": 0.5
          },
          "song_name": "Afterlife",
          "spotify_id": "7zAt4tdL44D3VuzsvM0N8n"
        },
        {
          "artist": "Adele",
          "audio": {
            "arousal": 0.134634971618652,
            "distance": 0.6281713771639392,
            "emotion": "Happiness",
            "similarity": 0.8182689204960283,
            "valence": 0.033909875899553,
            "weighting": 0.5
          },
          "audio_lyrics_similarity": 0.6340243211533457,
          "combined": {
            "arousal": 0.18690817311613087,
            "distance": 0.5812815240486443,
            "emotion": "Happiness",
            "similarity": 0.8295216442454405,
            "valence": 0.08035209006629877
          },
          "genius_id": "51294",
          "genre": [
            "british soul",
            "pop",
            "pop soul",
            "uk pop"
          ],
          "lyrics": {
            "arousal": 0.6129977208458715,
            "distance": 0.5823201166469009,
            "emotion": "Happiness",
            "percentage": {
              "Anger": 0.3126704941193263,
              "Calmness": 0.14992087587921155,
              "Happiness": 0.4938283663036095,
              "Sadness": 0.04358025940342082
            },
            "percentage_per_section": {
              "Anger": [
                0.15509361028671265,
                0.9643328189849854,
                0.03413370996713638,
                0.10938098281621933,
                0.9643328189849854,
                0.09926825761795044,
                0.38624677062034607,
                0.06711176782846451,
                0.03413370996713638
              ],
              "Calmness": [
                0.4228869080543518,
                0.0016140027437359095,
                0.03610403090715408,
                0.5629940629005432,
                0.0016140027437359095,
                0.06004947051405907,
                0.17513208091259003,
                0.052789293229579926,
                0.03610403090715408
              ],
              "Happiness": [
                0.36944207549095154,
                0.007040009368211031,
                0.9257069230079651,
                0.15759694576263428,
                0.007040009368211031,
                0.8308037519454956,
                0.3481611907482147,
                0.8729574680328369,
                0.9257069230079651
              ],
              "Sadness": [
                0.052577365189790726,
                0.027013173326849937,
                0.004055344499647617,
                0.17002803087234497,
                0.027013173326849937,
                0.009878484532237053,
                0.09045998007059097,
                0.007141438312828541,
                0.004055344499647617
              ]
            },
            "similarity": 0.8292690500252206,
            "valence": 0.28749848436564207,
            "weighting": 0.5
          },
          "song_name": "Someone Like You",
          "spotify_id": "3bNv3VuUOKgrf5hu3YcuRo"
        },
        {
          "artist": "ABBA",
          "audio": {
            "arousal": 0.138901248574256,
            "distance": 0.6372137950660782,
            "emotion": "Happiness",
            "similarity": 0.8161339244861537,
            "valence": 0.024656923487782003,
            "weighting": 0.5
          },
          "audio_lyrics_similarity": 0.603113744252672,
          "combined": {
            "arousal": -0.03074340398112957,
            "distance": 0.584943751986442,
            "emotion": "Calmness",
            "similarity": 0.8286316450480865,
            "valence": 0.11057756134929746
          },
          "genius_id": "395791",
          "genre": [
            "europop",
            "swedish pop"
          ],
          "lyrics": {
            "arousal": -0.2618748644987743,
            "distance": 0.4927768352811182,
            "emotion": "Calmness",
            "percentage": {
              "Anger": 0.21249504635731378,
              "Calmness": 0.5522591395614048,
              "Happiness": 0.1565675213932991,
              "Sadness": 0.07867827887336414
            },
            "percentage_per_section": {
              "Anger": [
                0.05291732773184776,
                0.038302451372146606,
                0.029582398012280464,
                0.9159196615219116,
                0.029582398012280464,
                0.20866604149341583
              ],
              "Calmness": [
                0.7378032207489014,
                0.8041971921920776,
                0.7072858810424805,
                0.008023514412343502,
                0.7072858810424805,
                0.34895914793014526
              ],
              "Happiness": [
                0.08731129765510559,
                0.10947372019290924,
                0.23284855484962463,
                0.024314433336257935,
                0.23284855484962463,
                0.2526085674762726
              ],
              "Sadness": [
                0.12196815758943558,
                0.04802664369344711,
                0.030283154919743538,
                0.05174237862229347,
                0.030283154919743538,
                0.18976618349552155
              ]
            },
            "similarity": 0.8516270481391736,
            "valence": 0.41765332190940785,
            "weighting": 0.5
          },
          "song_name": "Dancing Queen",
          "spotify_id": "2W4ulzcB16vvrawd7EbfEJ"
        }
      ],
      "speech_info": {
        "audio": {
          "count": 2,
          "emotion": "Happiness",
          "name": "0",
          "percentage": {
            "Anger": 0.3869496285915375,
            "Calmness": 0.13954673474654555,
            "Happiness": 0.44368746131658554,
            "Sadness": 0.029816218884661794
          },
          "section": "All"
        },
        "combined": {
          "emotion": "Happiness",
          "percentage": {
            "Anger": 0.3595328629016876,
            "Calmness": 0.13937963428907096,
            "Happiness": 0.4138137809932232,
            "Sadness": 0.0872737435856834
          }
        },
        "text": {
          "emotion": "Happiness",
          "percentage": {
            "Anger": 0.33211609721183777,
            "Calmness": 0.13921253383159637,
            "Happiness": 0.38394010066986084,
            "Sadness": 0.14473126828670502
          },
          "text": "look out I've tried everything it's writing different features turning the hyperparameters in the mall and stuff what else I can do it just won't go up"
        }
      }
    },
    "errMsg": "",
    "status": "ok"
  }


@music_recommendation_blueprint.route(PATH_DIR_NAME + '/getlyrics/<genius_id>')
@cross_origin()
def getLyrics(genius_id):
  client_access_token = "e0td9KbZuLG8Tk8ai3szeLSOoUXUtkeB2JH5dRTg-bTGm2cFcbWn27henqJ1YOL_"
  LyricsGenius = lyricsgenius.Genius(client_access_token)
  lyrics = LyricsGenius.lyrics(int(genius_id))
  return {'data': lyrics, 'status': 'ok', 'errMsg': ''}

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

  songList = getSongList(mode, json_path, emotion_percentages, lyrics_weighting=lyrics_weighting, output_no=20)

  returnData = {
    "speech_info": speech_info,
    "song_list": songList,
  }
  return {'data': returnData, 'status': 'ok', 'errMsg': ''}


def combineEmotionPercentages(emotion1Percentage, emotion2Percentage, emotion1Ratio):
  emotion2Ratio = 1 - emotion1Ratio

  return {
    'Anger': emotion1Percentage['Anger'] * emotion1Ratio + emotion2Percentage['Anger'] * emotion2Ratio,
    'Happiness': emotion1Percentage['Happiness'] * emotion1Ratio + emotion2Percentage['Happiness'] * emotion2Ratio,
    'Sadness': emotion1Percentage['Sadness'] * emotion1Ratio + emotion2Percentage['Sadness'] * emotion2Ratio,
    'Calmness': emotion1Percentage['Calmness'] * emotion1Ratio + emotion2Percentage['Calmness'] * emotion2Ratio
  }

