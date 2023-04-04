import { Grid, Box, Typography, Paper, useTheme } from '@mui/material'
import { tokens } from '../../theme';
import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import DonutChart from '../../common/Charts/DonutChart'
import LineChart from '../../common/Charts/LineChart'
import RadarChart from '../../common/Charts/RadarChart'
import ScatterChart from '../../common/Charts/ScatterChart'
import Header from '../../common/Header';

export const MusicRecommendationInfo = ({speechInfo, musicInfoToDisplay, recommendMode, audioScatterData}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [speechEmotionDonutData, setSpeechEmotionDonutData] = useState(null);
  const [speechTextEmotionDonutData, setSpeechTextEmotionDonutData] = useState(null);
  const [speechText, setSpeechText] = useState("");

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
      const percentage = speechInfo['audio']['percentage'];
      const donutData = packEmotionDonutData(
                            toPercentageFormat(percentage['Anger']),
                            toPercentageFormat(percentage['Calmness']),
                            toPercentageFormat(percentage['Happiness']),
                            toPercentageFormat(percentage['Sadness'])
                        );
      setSpeechTextEmotionDonutData(donutData);
    }
  }

  const updateSpeechTextEmotionDonutData = () => {
    if (speechInfo && 'text' in speechInfo && 'percentage' in speechInfo['text']) {
      const percentage = speechInfo['text']['percentage'];
      const donutData = packEmotionDonutData(
                            toPercentageFormat(percentage['Anger']),
                            toPercentageFormat(percentage['Calmness']),
                            toPercentageFormat(percentage['Happiness']),
                            toPercentageFormat(percentage['Sadness'])
                        );
      setSpeechEmotionDonutData(donutData);
    }
  }

  const updateSpeechText = () => {
    if (speechInfo && 'text' in speechInfo && 'text' in speechInfo['text']) {
      const text = speechInfo['text']['text'];
      setSpeechText(text);
    }
  }




  const updateLyricsEmotionDonutData = () => {
    if (musicInfoToDisplay && 'lyrics' in musicInfoToDisplay && 'percentage' in musicInfoToDisplay['lyrics']) {

      const percentage = musicInfoToDisplay['lyrics']['percentage'];
      const donutData = packEmotionDonutData(
          toPercentageFormat(percentage['Anger']),
          toPercentageFormat(percentage['Calmness']),
          toPercentageFormat(percentage['Happiness']),
          toPercentageFormat(percentage['Sadness'])
      );

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

  const toPercentageFormat = (decimal) => {
    return (decimal * 100).toFixed(2);
  }

  useEffect(() => {
    updateSpeechEmotionDonutData();

    if (recommendMode !== 'audio') {
      updateSpeechTextEmotionDonutData();
      updateSpeechText();
    }
  }, [speechInfo]);

  useEffect(() => {
    if (recommendMode !== 'audio') {
      updateLyricsEmotionDonutData();
    }
    
  }, [musicInfoToDisplay]);

  

  return (
    <Grid
      container
      spacing={3}
      direction="row"
      justify="flex-start"
      alignItems="flex-start"
      alignContent="stretch"
      
    >
      <Grid item xs={12} >
        <Typography variant="h1">
          Audio & Acoustics Analysis
        </Typography>
      </Grid>
      {
        (speechEmotionDonutData)
          ? <Grid item xs={4}>
              <DonutChart data={speechEmotionDonutData} height="250px" title="Speech Emotion" subtitle="Speech audio emotion percentages" />
              <Paper variant="outlined" sx={{backgroundColor: colors.greenAccent[800], p: 2, borderRadius: "6px", mt: 3, height: "226px"}} m="20px">

              </Paper>
            </Grid>
          : ""
      }
      {
        (audioScatterData)
          ? <Grid item xs={8}>
              <ScatterChart data={audioScatterData} height="500px" title="Audio Valence-Arousal (VA) Space" subtitle="Coordinates of speech audio and suggested songs on a Valence-Arousal plane" />
            </Grid>
          : ""
      }



      {
        (recommendMode !== 'audio')
          ? <Grid item xs={12} mt={5} >
              <Typography variant="h1">
                Text & Lyrics Analysis
              </Typography>
            </Grid>
          : ""
      }
      {
        (recommendMode != "audio" && speechTextEmotionDonutData)
          ? <Grid item xs={6}>
              <DonutChart data={speechTextEmotionDonutData} height="250px" title="Text Emotion" subtitle="Speech text emotion percentages" />
            </Grid>
          : ""
      }
      {
        (recommendMode != "audio" && lyricsEmotionDonutData)
          ? <Grid item xs={6}>
              <DonutChart data={lyricsEmotionDonutData} height="250px" title="Lyrics Emotion" subtitle="Lyrics emotion percentages of the selected song" />
            </Grid>
          : ""
      }
      {
        (recommendMode != "audio" && speechText)
          ? <Grid item xs={6}>
              <Paper variant="outlined" sx={{backgroundColor: colors.greenAccent[800], p: 2, borderRadius: "6px", height: "250px"}} m="20px">
                <Header title="Speech Transcript" subtitle=""></Header>
                <Paper variant="outlined" sx={{backgroundColor: colors.blueAccent[900], p: 2, borderRadius: "6px", height: "160px", mt: "20px", overflow: "auto"}} mt="10px" >
                  <Typography variant="h5">{speechText}</Typography>
                </Paper>
                
              </Paper>
            </Grid>
          : ""
      }
      {
        (recommendMode != "audio")
          ? <Grid item xs={6}>
              <Paper variant="outlined" sx={{backgroundColor: colors.greenAccent[800], p: 2, borderRadius: "6px", height: "250px"}} >

              </Paper>
            </Grid>
          : ""
      }
      
      
      <Grid item xs={4}>
        <RadarChart />
      </Grid>
    </Grid>
  )
}
