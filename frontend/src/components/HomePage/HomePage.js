import React, { useEffect, useState, useRef } from 'react'

import { RecordButton } from '../../common/RecordButton/RecordButton'
import MGApi from '../../routes/MGApi'
import MRApi from '../../routes/MRApi'

import './HomePage.css'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

export const HomePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [withText, setWithText] = useState(true);
  const [recommendedMusic, setRecommendedMusic] = useState([]);
  const [emotion, setEmotion] = useState("");
  const [emotionPercentage, setEmotionPercentage] = useState(null);
  const [generatedAudioList, setGeneratedAudioList] = useState([]);
  const [tab, setTab] = React.useState('1');

	const [dropActive, setDropActive] = useState([]);
	const audioFileInputRef= useRef(null);



  const handleChange = (event, newValue) => {
    setTab(newValue);
  };

  const dropFiles = (e) => {
		e.preventDefault();
		e.stopPropagation();

		setDropActive(false);
		storeFiles(e.dataTransfer.files)
	}

	const storeFiles = (files) => {

    setIsLoading(true);
    const file = files[0];
    // if (file.type != 'audio/wav' || file.type != 'audio/x-m4a' || file.type != 'audio/mpeg'  || file.type != 'audio/ogg')
    if (file.type !== 'audio/wav' && file.type !== 'audio/x-m4a'
      && file.type !== 'audio/mpeg' && file.type !== 'audio/ogg'
      && file.type !== 'audio/basic') {
      
      const errMsg = "Please only upload .wav, .m4a, .mp3, .ogg, .opus, or .au file type!";
      alert(errMsg);
    }
    else {
      let blobUrl = (window.URL || window.webkitURL).createObjectURL(file);

      const audioObject = {
        blob: file,
        blobUrl: blobUrl,
        fileName: file.name,
        className: "0",
      }

      setRecordedAudio(audioObject);
    }

    setIsLoading(false);

	}

  const recommendMusic = async () => {
    setIsLoading(true);
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
    setIsLoading(false);
  }

  const generateMusic = async () => {
    setIsLoading(true);
    let formData = new FormData();
    formData.append(recordedAudio['className'], recordedAudio['blob'], recordedAudio['fileName']);

    const response = await MGApi.getMusicGeneration(formData);
		if (response) {
      const blobUrlList = response.blobUrlList;
      const infoData = response.infoData;

			setGeneratedAudioList(blobUrlList);
		}

		setIsLoading(false);
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
        <TabContext value={tab}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList onChange={handleChange} aria-label="lab API tabs example">
              <Tab label="Music Recommendation" value="1" />
              <Tab label="Music Generation" value="2" />
            </TabList>
          </Box>
          <TabPanel value="1">Item One</TabPanel>
          <TabPanel value="2">Item Two</TabPanel>
        </TabContext>
        <section id="contols-section">
          <div id="record-button-container">
            <RecordButton setRecordedAudio={setRecordedAudio}></RecordButton>
          </div>
          <section id="file-upload">
            <h1 className="file-upload-header">File Upload</h1>
            <form id="upload-form" action="#" drop-active={dropActive.toString()}
                      onClick={() => {audioFileInputRef.current.click()}}
                      onDragOver={(e) => {e.preventDefault();e.stopPropagation();setDropActive(true)}}
                      onDragLeave={() => {setDropActive(false)}}
                      onDrop={(e) => {dropFiles(e)}}>
              <i className="fas fa-cloud-upload-alt"></i>
              <p>Browse File to Upload</p>
            </form>
            <input type="file" id="file-input" onChange={(e) => storeFiles(e.target.files)} ref={audioFileInputRef} multiple />
          </section>
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
              (recommendedMusic !== [])
              ? recommendedMusic.map((music) => {

                return (
                  <iframe title={music[0]} src={"https://open.spotify.com/embed/track/" + music[0]} width="225" height="152" frameBorder="0"></iframe>
                )
              })
              : ""
            }
            {
              (generatedAudioList !== [])
              ? generatedAudioList.map(generatedAudio => {
                  return (
                    <div>
                      <audio src={generatedAudio} id="generated-audio" controls></audio>
                      <a href={generatedAudio} download="test.wav">Download</a>
                    </div>
                  )
              })
              
              : ""
            }
          </div>
        </section>
      </section>

      <section id="footer-section"></section>
      {
        (isLoading === true)
        ? <div id="loading">
            <div id="loader"></div>
          </div>
        : <div id="loading" className='not-loading'>
            <div id="loader"></div>
          </div>
      }
      
    </div>
  )
}