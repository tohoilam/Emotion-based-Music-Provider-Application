import React, { useEffect, useState } from 'react'

import { RecordButton } from '../../common/RecordButton/RecordButton'
import MGApi from '../../routes/MGApi'
import MRApi from '../../routes/MRApi'

import './HomePage.css'

export const HomePage = () => {
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [withText, setWithText] = useState(true);
  const [recommendedMusic, setRecommendedMusic] = useState([]);
  const [emotion, setEmotion] = useState("");
  const [emotionPercentage, setEmotionPercentage] = useState(null);

  const recommendMusic = async () => {
    let formData = new FormData();
    formData.append(recordedAudio['className'], recordedAudio['blob'], recordedAudio['fileName']);

    const response = await MRApi.getMusicRecommendation(formData);
    console.log(response);
    const resEmotion = response['data']['emotion'];
    const percentage = response['data']['percentage'];
    const songList = response['data']['song_list'];

    setRecommendedMusic(songList);
    setEmotion(resEmotion);
    setEmotionPercentage([percentage['Anger'],percentage['Happiness'], percentage['Neutral'], percentage['Sadness']]);
  }

  const generateMusic = async () => {
    let formData = new FormData();
    formData.append(recordedAudio['className'], recordedAudio['blob'], recordedAudio['fileName']);

    const response = await MGApi.getMusicGeneration(formData);
		if (response) {
      let base64Response = new Buffer(response, 'binary').toString('base64');
      const url = 'data:audio/wav;base64,' + base64Response
			console.log(url);
		}

		// setIsLoading(false);
  }

  useEffect(() => {
    if (recordedAudio) {
      console.log(recordedAudio);
    }
  }, [recordedAudio]);

  useEffect(() => {
    console.log(withText)
  }, [withText]);


  return (
    <div id="home-page">
      <header>Emotion-based Music Provider</header>
      <nav id="demos-menu">
        <ul>
          <li><a className="menu-item" href='/speech-emotion-recognition'>Speech Emotion Recognition</a></li>
          <li><a className="menu-item" href='/music-emotion-classification'>Music Emotion Classification</a></li>
          <li><a className="menu-item" href='/lyrics-emotion-classification'>Lyrics Emotion Classification</a></li>
          <li><a className="menu-item" href='/music-generation'>Music Generation</a></li>
          <li><a className="menu-item" href='/music-recommendation'>Music Recommendation (Mapping)</a></li>
        </ul>
      </nav>
      <section id="EBMP-main">
        <section id="contols-section">
          <div id="record-button-container">
            <RecordButton setRecordedAudio={setRecordedAudio}></RecordButton>
          </div>
          <select name="genre-selection" id="genre-selection" defaultValue={1} >
            <option disabled value> -- select a genre -- </option>
            <option key='pop' value='pop'>Pop</option>
            <option key='rnb' value='rnb'>R&B</option>
          </select>
          <div id="mode-toggle-box" >
            <h2 id="mode-header">Language</h2>
            <div className="switch-box">
              <div className="switch-label">English</div>
              <label className="switch">
                <input type="checkbox" defaultChecked={true} onChange={() => {setWithText(!withText)}} />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
          <div id="predict-box">
            <button id="recommend-button" onClick={recommendMusic}>Recommend Music</button>
            <button id="generate-button" onClick={generateMusic}>Generate New Music</button>
          </div>
          {
            (emotion)
            ? <div id="predicted-emotion">{emotion}</div>
            : ""
          }
          {
            (emotionPercentage)
            ? <div id="predicted-emotion-percentage">{emotionPercentage}</div>
            : ""
          }
        </section>
        <section id="music-provider-section">
          <div id="music-board">
            {
              (recommendedMusic != [])
              ? recommendedMusic.map((music) => {

                return (
                  <iframe src={"https://open.spotify.com/embed/track/" + music[0]} width="225" height="152" frameBorder="0"></iframe>
                )
              })
              : ""
            }
            {/* <iframe src="https://open.spotify.com/embed/track/43rA71bccXFGD4C8GOpIlN?si=1d29599053f34ff2" width="225" height="152" frameBorder="0"></iframe>
            <iframe src="https://open.spotify.com/embed/track/43rA71bccXFGD4C8GOpIlN?si=1d29599053f34ff2" width="225" height="152" frameBorder="0"></iframe>
            <iframe src="https://open.spotify.com/embed/track/43rA71bccXFGD4C8GOpIlN?si=1d29599053f34ff2" width="225" height="152" frameBorder="0"></iframe>
            <iframe src="https://open.spotify.com/embed/track/43rA71bccXFGD4C8GOpIlN?si=1d29599053f34ff2" width="225" height="152" frameBorder="0"></iframe>
            <iframe src="https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT?si=3c782ac715ee4ea5" width="225" height="152" frameBorder="0"></iframe>
            <iframe src="https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT?si=3c782ac715ee4ea5" width="225" height="152" frameBorder="0"></iframe>
            <iframe src="https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT?si=3c782ac715ee4ea5" width="225" height="152" frameBorder="0"></iframe> */}

          </div>
        </section>
      </section>

      <section id="footer-section"></section>
    </div>
  )
}