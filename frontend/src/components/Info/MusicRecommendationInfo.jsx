import { Grid } from '@mui/material'
import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import DonutChart from '../../common/Charts/DonutChart'
import LineChart from '../../common/Charts/LineChart'
import RadarChart from '../../common/Charts/RadarChart'

export const MusicRecommendationInfo = ({speechInfo, musicInfoToDisplay, recommendMode}) => {

  const [speechEmotionDonutData, setSpeechEmotionDonutData] = useState(null);
  const [acousticEmotionDonutData, setAcousticEmotionDonutData] = useState(null);

  const [textEmotionDonutData, setTextEmotionDonutData] = useState(null);
  const [lyricsEmotionDonutData, setLyricsEmotionDonutData] = useState(null);

  const packEmotionDonutData = (anger, calmness, happiness, sadness) => {
    return [
      {
        "id": "Anger",
        "label": "Anger",
        "value": anger,
      },
      {
        "id": "Calmness",
        "label": "Calmness",
        "value": calmness,
      },
      {
        "id": "Happiness",
        "label": "Happiness",
        "value": happiness,
      },
      {
        "id": "Sadness",
        "label": "Sadness",
        "value": sadness,
      },
    ]
  }

  const updateSpeechEmotionDonutData = () => {
    if (speechInfo){
      const percentage = speechInfo['percentage'];
      const donutData = packEmotionDonutData(percentage['Anger'], percentage['Calmness'], percentage['Happiness'], percentage['Sadness']);
      setSpeechEmotionDonutData(donutData);
    }
  }

  const updateAcousticEmotionDonutData = () => {
    if (musicInfoToDisplay && 'audio' in musicInfoToDisplay) {
      const arousal = musicInfoToDisplay['audio']['arousal'];
      const valence = musicInfoToDisplay['audio']['valence'];
      const percentage = vaToEmotion(valence, arousal);
      console.log(percentage);
      const donutData = packEmotionDonutData(percentage['Anger'], percentage['Calmness'], percentage['Happiness'], percentage['Sadness']);
      setAcousticEmotionDonutData(donutData);
    }
  }

  // const updateTextEmotionDonutData = () => {
  //   if (speechInfo){
  //     const percentage = musicInfoToDisplay['???']['percentage'];
  //     const donutData = packEmotionDonutData(percentage['Anger'], percentage['Calmness'], percentage['Happiness'], percentage['Sadness']);
  //     setTextEmotionDonutData(donutData);
  //   }
  // }

  const updateLyricsEmotionDonutData = () => {
    if (musicInfoToDisplay && 'lyrics' in musicInfoToDisplay && 'percentage' in musicInfoToDisplay['lyrics']) {
      const percentage = musicInfoToDisplay['lyrics']['percentage'];
      const donutData = packEmotionDonutData(percentage['Anger'], percentage['Calmness'], percentage['Happiness'], percentage['Sadness']);
      setLyricsEmotionDonutData(donutData);
    }
  }




  const vaToEmotion = (valence, arousal) => {
    // Calculate probabilities from valence and arousal
    let prob_happiness = (valence + 1)/2 + (arousal + 1)/2;
    let prob_calm = (valence + 1)/2 - (arousal + 1)/2;
    let prob_anger = -(valence + 1)/2 + (arousal + 1)/2;
    let prob_sadness = -(valence + 1)/2 - (arousal + 1)/2;
    
    // Normalize probabilities
    const total_prob = prob_happiness + prob_calm + prob_anger + prob_sadness;
    prob_happiness /= total_prob;
    prob_calm /= total_prob;
    prob_anger /= total_prob;
    prob_sadness /= total_prob;

    return {
      "Anger": prob_anger,
      "Calmness": prob_calm,
      "Happiness": prob_happiness,
      "Sadness": prob_sadness
    }
  }

  useEffect(() => {
    console.log(speechInfo);
    updateSpeechEmotionDonutData();
  }, [speechInfo]);

  useEffect(() => {
    console.log(musicInfoToDisplay);
    updateAcousticEmotionDonutData();

    if (recommendMode !== 'audio') {
      updateLyricsEmotionDonutData();
    }
    
  }, [musicInfoToDisplay]);

  return (
    <Grid
      container
      spacing={1}
      direction="row"
      justify="flex-start"
      alignItems="flex-start"
      alignContent="stretch"
      wrap="nowrap"
      
    >
      {
        (speechEmotionDonutData)
          ? <Grid item xs={4}>
              <DonutChart data={speechEmotionDonutData} title="Speech Emotion" subtitle="Idk" />
            </Grid>
          : ""
      }
      {/* <Grid item xs={4}>
        <LineChart />
      </Grid> */}
      {/* {
        (acousticEmotionDonutData)
          ?<Grid item xs={4}>
            <DonutChart data={acousticEmotionDonutData} title="Acoustic Emotion" subtitle="Idk" />
          </Grid>
          : ""
      } */}

      {
        (recommendMode != "audio" && lyricsEmotionDonutData)
          ? <Grid item xs={4}>
              <DonutChart data={lyricsEmotionDonutData} title="Lyrics Emotion" subtitle="Idk" />
            </Grid>
          : ""
      }
      
      <Grid item xs={4}>
        <RadarChart />
      </Grid>
    </Grid>
  )
}
