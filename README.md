# Emotion-based Music Provider (Web Application)


[![Spotify](https://spotify-github-readme.vercel.app/api/spotify)](https://open.spotify.com/collection/tracks)

 
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

<img width="1435" alt="MR Landing 2" src="https://github.com/tohoilam/Emotion-based-Music-Provider-Application/assets/61353084/fb826084-d285-49ef-833d-b56bde89866e">

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

* All recommended music are displayed and are linked to Spotify
* User can play the music directly on the webpage or view on the Spotify app
* The similarity rate of the music and the speech emotion is displayed alongside
* When the user clicks on **"More Info"**, a **Statistical View Panel** will be expanded underneath explaining in detail the similarity between the speech input and the recommended music

#### Music Recommendation Statistical View

![MR Statistics Full](https://github.com/tohoilam/Emotion-based-Music-Provider-Application/assets/61353084/b2f5d09c-4e33-4cbc-bd48-c951d8f0ce42)



### Music Generation

![MG Generated Songs](https://github.com/tohoilam/Emotion-based-Music-Provider-Application/assets/61353084/a6f73ddb-f859-4a0b-bab9-ad93ba7c9fbb)

