# Emotion-based Music Provider (Web Application Side)

 
## Project Overview
A machine learning and web application project that recommends and generates music for users based on their emotions expressed from speech input. The project is separated into 3 major components:

1. <ins>**Speech Emotion Recognition:**</ins> Detects emotion from speech with acoustic and text analyses
2. <ins>**Music Recommendation:**</ins> Recommends the most relevant existing song given a certain emotion
3. <ins>**Music Generation:**</ins> Generates new symbolic music pieces given certain emotion

<img src="https://github.com/tohoilam/Emotion-based-Music-Provider-Application/assets/61353084/edc8845c-d391-4b56-8fa2-91396b099c8f" alt="Project Overview" width="600"/>

**NOTE:** This repository is dedicated to the web application side of the project. If you would like to view the Machine Learning side GitHub page, please [click here](https://github.com/tohoilam/Emotion-based-Music-Provider).


### Important Links
* [Machine Learning Side GitHub Page](https://github.com/tohoilam/Emotion-based-Music-Provider)
* [YouTube Short Introduction](https://www.youtube.com/watch?v=1yL7BDyDFCM)

## Web Application

There are two ways to provide music to the users: Music Recommendation and Music Generation. Each is separated into its own tab.

### Music Recommendation

#### Music Recommendation Landing Page

##### <ins>Speech Input and Modes (Top-Left)</ins>

* The user can record audio by clicking the record button or the user can upload an audio file
* There are 3 modes of recommendation, corresponding to the 3 types of recommendation mapping methods we have, the 3 modes include:
  1. Audio Only
  2. Audio and Text
  3. Audio, Text, and Semantics
* User can also choose the number of songs to be recommended

##### <ins>Emotion Detection (Bottom-Left)</ins>

* Detect emotion is displayed along with the confidence rate

##### <ins>Music Recommended (Right)</ins>

* All recommended music is displayed and is linked to Spotify
* User can play the music directly on the webpage or view on the Spotify app
* The similarity rate of the music and the speech emotion is displayed alongside
* When the user clicks on **"More Info"**, a **Statistical View Panel** will be expanded underneath explaining in detail the similarity between the speech input and the recommended music

<img width="1435" alt="MR Landing 2" src="https://github.com/tohoilam/Emotion-based-Music-Provider-Application/assets/61353084/fb826084-d285-49ef-833d-b56bde89866e">


#### Music Recommendation Statistical View

Analyses on why and how the music is recommended given certain emotion is displayed through this statistical view. In-depth analyses on each aspect of the recommendation, including:

* <ins>**Overall Analysis**</ins> 
* <ins>**Audio & Acoustic Analysis:**</ins> Analysing the emotion expressed through your voice (tones, pitch, etc.) and the music
* <ins>**Text & Lyrics Analysis:**</ins> Analysing the emotion expressed from the user's speech and song lyrics
* <ins>**Semantics Analysis:**</ins> Analysing the meanings of user's speech and song lyrics

![MR Statistics Full](https://github.com/tohoilam/Emotion-based-Music-Provider-Application/assets/61353084/b2f5d09c-4e33-4cbc-bd48-c951d8f0ce42)


### Music Generation

#### Music Generation Landing Page

##### <ins>Speech Input and Modes (Top-Left)</ins>

* The user can record audio by clicking the record button or the user can upload an audio file
* There are 2 modes of generation:
  1. Monophonic (One keynote at each timeframe)
  2. Polyphonic (Many keynotes at each timeframe)

##### <ins>Emotion Detection (Bottom-Left)</ins>

* Detect emotion is displayed along with the confidence rate

##### <ins>Music Generated (Right)</ins>

* Three new symbolic music are generated and are displayed
* User can play the music directly on the webpage
* The similarity rate of the music and the speech emotion is displayed alongside
* When the user clicks on **"More Info"**, a **Statistical View Panel** will be expanded underneath explaining in detail the similarity between the speech input and the generated music

**NOTE: Each generation is unique**

![MG Generated Songs](https://github.com/tohoilam/Emotion-based-Music-Provider-Application/assets/61353084/a6f73ddb-f859-4a0b-bab9-ad93ba7c9fbb)


#### Music Recommendation Statistical View

Generated music is then passed to the emotion detection framework once again to double-check that the music generated has emotion aligned with the user's speech. Failing the check will force the application to re-generate a new piece of symbolic music. 

Emotion of speech and generated music is then further illustrated in the statistical view.

![MG Emotion Analysis](https://github.com/tohoilam/Emotion-based-Music-Provider-Application/assets/61353084/00453f1a-5b6e-40ce-8a5f-72104a48ec8c)

