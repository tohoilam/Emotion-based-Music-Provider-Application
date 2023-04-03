import React from 'react'
import {Routes, Route} from 'react-router-dom'
import { Helmet } from 'react-helmet';

import { ColorModeContext, useMode } from './theme';
import { CssBaseline, ThemeProvider } from '@mui/material';

import './App.css'
import './Common.css'

import { HomePage } from './components/HomePage/HomePage'
import { LyricsEmotionClassification } from './components/LyricsEmotionClassification/LyricsEmotionClassification'
import { MusicEmotionClassification } from './components/MusicEmotionClassification/MusicEmotionClassification'
import { MusicGeneration } from './components/MusicGeneration/MusicGeneration'
import { MusicRecommendation } from './components/MusicRecommendation/MusicRecommendation'
import { SpeechEmotionRecognition } from './components/SpeechEmotionRecognition/SpeechEmotionRecognition'


function App() {
  // const [data, setData] = useState([{}])
  // const domain = "https://ebmp-api.herokuapp.com/"
  // const domain = "http://localhost:5000/"

  const [theme, colorMode] = useMode();


  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <div>
          <Helmet>
            <title>Emotion-based Music Provider</title>
            <meta name='description' content='Emotion-based Music Provider Application' />
          </Helmet>
          <Routes>
            <Route path="/" element={<HomePage/>} />
            <Route path="/lyrics-emotion-classification" element={<LyricsEmotionClassification/>} />
            <Route path="/music-emotion-classification" element={<MusicEmotionClassification/>} />
            <Route path="/music-generation" element={<MusicGeneration/>} />
            <Route path="/music-recommendation" element={<MusicRecommendation/>} />
            <Route path="/speech-emotion-recognition" element={<SpeechEmotionRecognition/>} />
          </Routes>
          {/* {(typeof data.members === 'undefined') ? (
            <p>Loading...</p>
          ): (
            
            <HomePage data={data}/>
          )} */}
          <script src="https://open.spotify.com/embed-podcast/iframe-api/v1" async></script>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}

export default App