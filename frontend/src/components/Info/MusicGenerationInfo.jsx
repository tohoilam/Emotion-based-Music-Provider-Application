import { Grid, Box, Typography, Paper, useTheme } from '@mui/material'
import { tokens } from '../../theme';
import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import DonutChart from '../../common/Charts/DonutChart'
import LineChart from '../../common/Charts/LineChart'
import RadarChart from '../../common/Charts/RadarChart'
import ScatterChart from '../../common/Charts/ScatterChart'
import ParallelChart from '../../common/Charts/ParallelChart';
import HeatmapChart from '../../common/Charts/HeatmapChart';

import Header from '../../common/Header';
import { continuousColorsLegendDefaults } from '@nivo/legends';

import MRApi from '../../routes/MRApi';

export const MusicGenerationInfo = ({speechInfo, generatedMusicInfoToDisplay}) => {

  
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [speechEmotionDonutData, setSpeechEmotionDonutData] = useState(null);
  const [primerEmotionDonutData, setPrimerEmotionDonutData] = useState(null);
  const [generatedEmotionDonutData, setGeneratedEmotionDonutData] = useState(null);


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
      const donutData = packEmotionDonutData(
                            toPercentageFormat(percentage['Anger']),
                            toPercentageFormat(percentage['Calmness']),
                            toPercentageFormat(percentage['Happiness']),
                            toPercentageFormat(percentage['Sadness'])
                        );
      setSpeechEmotionDonutData(donutData);
    }
  }

  const updatePrimerEmotionDonutData = () => {
    if (generatedMusicInfoToDisplay && 'primers' in generatedMusicInfoToDisplay) {
      const percentage = generatedMusicInfoToDisplay['primers']['emotion_percentages'];
      const donutData = packEmotionDonutData(
                            toPercentageFormat(percentage['Anger']),
                            toPercentageFormat(percentage['Calmness']),
                            toPercentageFormat(percentage['Happiness']),
                            toPercentageFormat(percentage['Sadness'])
                        );
      setPrimerEmotionDonutData(donutData)
    }
  }

  const updateGeneratedEmotionDonutData = () => {
    if (generatedMusicInfoToDisplay && 'generated' in generatedMusicInfoToDisplay) {
      const percentage = generatedMusicInfoToDisplay['generated']['emotion_percentages'];
      const donutData = packEmotionDonutData(
                            toPercentageFormat(percentage['Anger']),
                            toPercentageFormat(percentage['Calmness']),
                            toPercentageFormat(percentage['Happiness']),
                            toPercentageFormat(percentage['Sadness'])
                        );
      setGeneratedEmotionDonutData(donutData)
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
  }, [speechInfo]);

  useEffect(() => {
    updatePrimerEmotionDonutData();
    updateGeneratedEmotionDonutData();
  }, [generatedMusicInfoToDisplay]);

  

  return (
    <Grid
      container
      spacing={3}
      direction="row"
      justify="flex-start"
      alignItems="flex-start"
      alignContent="stretch"
      sx={{p: 1, pb: 5}}
    >
      <Grid item xs={12} >
        <Typography variant="h1">
          Emotion Analysis
        </Typography>
      </Grid>

      <Grid item xs={8}>
        {
          (generatedMusicInfoToDisplay && 'blobUrl' in generatedMusicInfoToDisplay)
           ? <audio src={generatedMusicInfoToDisplay['blobUrl']} controls style={{width: "100%"}}></audio>
           : ""
        }
      </Grid>
      <Grid item xs={2} sx={{px:1, py:1, overflow: "hidden", textOverflow: "ellipsis"}}>
        <Typography noWrap variant="h3" align="center" sx={{ p:1 }}>
          Similarity
        </Typography>
      </Grid>
      <Grid item xs={2} sx={{px:1, py:1}}>
        <Paper variant="outlined" sx={{backgroundColor: colors.redAccent[700], p: 1, borderRadius: "6px"}}>
          <Typography variant="h3" align="center">
            {
              (generatedMusicInfoToDisplay && 'generated' in generatedMusicInfoToDisplay)
                ? generatedMusicInfoToDisplay['generated']['similarity'].toFixed(3).toString()
                : ""
            }
          </Typography>
        </Paper>
      </Grid>


      {
        (speechEmotionDonutData)
          ? <Grid item xs={4}>
              <DonutChart data={speechEmotionDonutData} height="250px" title="Speech Emotion" subtitle="Speech audio's emotion percentages" />

            </Grid>
          : ""
      }

      {
        (primerEmotionDonutData)
          ? <Grid item xs={4}>
              <DonutChart data={primerEmotionDonutData} height="250px" title="Primer MIDI" subtitle="Primer MIDI's emotion percentages" />

            </Grid>
          : ""
      }

      {
        (generatedEmotionDonutData)
          ? <Grid item xs={4}>
              <DonutChart data={generatedEmotionDonutData} height="250px" title="Generated Music" subtitle="Generated Music's emotion percentages" />

            </Grid>
          : ""
      }

    </Grid>
  )
}
