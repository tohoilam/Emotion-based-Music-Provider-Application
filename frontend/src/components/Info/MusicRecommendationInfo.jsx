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

export const MusicRecommendationInfo = ({speechInfo, musicInfoToDisplay, recommendMode, audioScatterData}) => {

  
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [speechEmotionDonutData, setSpeechEmotionDonutData] = useState(null);
  const [speechTextEmotionDonutData, setSpeechTextEmotionDonutData] = useState(null);
  const [speechText, setSpeechText] = useState("");

  const [lyricsEmotionDonutData, setLyricsEmotionDonutData] = useState(null);
  const [lyricsList, setLyricsList] = useState([]);

  const [speechKeywords, setSpeechKeywords] = useState([]);
  const [lyricsKeywords, setLyricsKeywords] = useState([]);
  const [keywordsSimilarity, setKeywordsSimilarity] = useState([]);

  const [similarityRadarData, setSimilarityRadarData] = useState(null);

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
    if (speechInfo && 'audio' in speechInfo){
      const percentage = speechInfo['audio']['percentage'];
      const donutData = packEmotionDonutData(
                            toPercentageFormat(percentage['Anger']),
                            toPercentageFormat(percentage['Calmness']),
                            toPercentageFormat(percentage['Happiness']),
                            toPercentageFormat(percentage['Sadness'])
                        );
      setSpeechEmotionDonutData(donutData);
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
      setSpeechTextEmotionDonutData(donutData);
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

  const updateOverallRadarData = () => {
    if (recommendMode === 'combined') {
      if (musicInfoToDisplay && 'audio' in musicInfoToDisplay && 'lyrics' in musicInfoToDisplay && 'combined' in musicInfoToDisplay) {
        const audioSimilarity = musicInfoToDisplay['audio']['similarity'];
        const lyricsSimilarity = musicInfoToDisplay['lyrics']['similarity'];
        const combinedSimilarity = musicInfoToDisplay['combined']['similarity'];

        setSimilarityRadarData([
          {
            "model": "audio",
            "similarity": audioSimilarity
          },
          {
            "model": "lyrics",
            "similarity": lyricsSimilarity
          },
          {
            "model": "combined",
            "similarity": combinedSimilarity
          },
        ])
      }
    }
    else if (recommendMode === 'all') {
      if (musicInfoToDisplay && 'audio' in musicInfoToDisplay && 'lyrics' in musicInfoToDisplay) {
        const audioSimilarity = musicInfoToDisplay['audio']['similarity'];
        const lyricsSimilarity = musicInfoToDisplay['lyrics']['similarity'];
        const semanticsSimilarity = musicInfoToDisplay['keywords']['similarity'];

        setSimilarityRadarData([
          {
            "model": "audio",
            "similarity": audioSimilarity
          },
          {
            "model": "lyrics",
            "similarity": lyricsSimilarity
          },
          {
            "model": "semantics",
            "similarity": semanticsSimilarity
          },
        ])
      }
    }
  }


  const updateAndGetLyrics = async () => {
    if (musicInfoToDisplay && 'genius_id' in musicInfoToDisplay) {
      const genius_id = musicInfoToDisplay['genius_id'];

      const response = await MRApi.getLyrics(genius_id);
      const songLyrics = response.data.split('\n').slice(1);
      setLyricsList(songLyrics);
    }
  }

  const updateSpeechKeywords = () => {
    if (musicInfoToDisplay && 'keywords' in musicInfoToDisplay && 'speech_keywords' in musicInfoToDisplay['keywords']) {
      const keywordsList = musicInfoToDisplay['keywords']['speech_keywords'];
      setSpeechKeywords(keywordsList);
    }
  }

  const updateLyricsKeywords = () => {
    if (musicInfoToDisplay && 'keywords' in musicInfoToDisplay && 'lyrics_keywords' in musicInfoToDisplay['keywords']) {
      const keywordsList = musicInfoToDisplay['keywords']['lyrics_keywords'];
      setLyricsKeywords(keywordsList);
    }
  }

  const udpateKeywordsSimilarity = () => {
    if (musicInfoToDisplay && 'keywords' in musicInfoToDisplay && 'w2w_similarity' in musicInfoToDisplay['keywords']) {
      const w2w_similarity = musicInfoToDisplay['keywords']['w2w_similarity'];

      let heatmapSet = {};
      let speech_words = [];
      let heatmapList = [];
      w2w_similarity.forEach(pair => {
        if (!(speech_words.includes(pair['speech_word'] ))) {
          heatmapSet[pair['speech_word']] = {
            "id": pair['speech_word'],
            "data": [
              {
                "x": pair['lyrics_word'],
                "y": pair['similarity']
              }
            ]
          }
          speech_words.push(pair['speech_word']);
        }
        else {
          heatmapSet[pair['speech_word']]['data'].push({
            "x": pair['lyrics_word'],
            "y": pair["similarity"]
          })
        }
      })

      speech_words.forEach(speech_word => {
        heatmapList.push(heatmapSet[speech_word]);
      })

      console.log(heatmapList);
      console.log(speech_words)

      setKeywordsSimilarity(heatmapList);
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
      updateAndGetLyrics();
      updateOverallRadarData();
    }

    if (recommendMode === 'all') {
      updateSpeechKeywords();
      updateLyricsKeywords();
      udpateKeywordsSimilarity();
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
      sx={{p: 1}}
    >
      <Grid item xs={12} >
        <Typography variant="h1">
          Overall Analysis
        </Typography>
      </Grid>
      {
        (recommendMode !== 'audio' && musicInfoToDisplay && speechInfo && 'audio' in speechInfo)
          ? <Grid item xs={8}>
              <Typography variant="h2">Song Name: {musicInfoToDisplay['song_name']}</Typography>
              <Typography variant="h3" color={colors.greenAccent[300]}>Artist: {musicInfoToDisplay['artist']}</Typography>
              <iframe title={musicInfoToDisplay['spotify_id']} src={"https://open.spotify.com/embed/track/" + musicInfoToDisplay['spotify_id']} width="100%" height="100px" frameBorder="0"></iframe>
              <Grid
                container
                spacing={1}
                direction="row"
                justify="flex-start"
                alignItems="flex-start"
                alignContent="stretch"
              >
                <Grid item xs={6} sx={{overflow: "hidden", textOverflow: "ellipsis"}}>
                  <Typography noWrap variant="h3" align="center" sx={{ p:1 }}>
                    Your emotion:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Paper 
                    variant="outlined" 
                    sx={{
                      backgroundColor: colors.emotion[speechInfo['audio']['emotion']],
                      p: 1,
                      borderRadius: "6px"
                    }}>
                      <Typography variant="h3" align="center">
                      {
                        speechInfo['combined']['emotion']
                          + " ("
                          + toPercentageFormat(speechInfo['combined']['percentage'][speechInfo['combined']['emotion']]).toString()
                          + "%)"
                      }
                      </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={(recommendMode === "combined") ? 6 : 4} sx={{overflow: "hidden", textOverflow: "ellipsis"}}>
                  <Typography noWrap variant="h3" align="center" sx={{ p:1 }}>
                    Overall Similarity:
                  </Typography>
                </Grid>
                <Grid item xs={(recommendMode === "combined") ? 6 : 2}>
                  <Paper variant="outlined" sx={{backgroundColor: colors.redAccent[700], p: 1, borderRadius: "6px"}}>
                    <Typography variant="h3" align="center">
                      {
                        ('combined' in musicInfoToDisplay || 'all' in musicInfoToDisplay)
                          ? (recommendMode === "combined")
                            ? toPercentageFormat(musicInfoToDisplay['combined']['similarity']).toString() + "%"
                            : toPercentageFormat(musicInfoToDisplay['all']['similarity']).toString() + "%"
                          : ""
                      }
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={4} sx={{overflow: "hidden", textOverflow: "ellipsis"}}>
                  <Typography noWrap variant="h3" align="center" sx={{ p:1 }}>
                    Acoustic Similarity:
                  </Typography>
                </Grid>
                <Grid item xs={2}>
                  <Paper variant="outlined" sx={{backgroundColor: colors.redAccent[700], p: 1, borderRadius: "6px"}}>
                    <Typography variant="h3" align="center">
                      {
                        toPercentageFormat(musicInfoToDisplay['audio']['similarity']).toString() + "%"
                      }
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={4} sx={{overflow: "hidden", textOverflow: "ellipsis"}}>
                  <Typography noWrap variant="h3" align="center" sx={{ p:1 }}>
                    Text Similarity:
                  </Typography>
                </Grid>
                <Grid item xs={2}>
                  <Paper variant="outlined" sx={{backgroundColor: colors.redAccent[700], p: 1, borderRadius: "6px"}}>
                    <Typography variant="h3" align="center">
                      {
                        toPercentageFormat(musicInfoToDisplay['lyrics']['similarity']).toString() + "%"
                      }
                    </Typography>
                  </Paper>
                </Grid>

                {
                  (recommendMode === "all")
                    ? <Grid item xs={4} sx={{overflow: "hidden", textOverflow: "ellipsis"}}>
                        <Typography noWrap variant="h3" align="center" sx={{ p:1 }}>
                          Semantics Similarity:
                        </Typography>
                      </Grid>
                    : ""
                }

                {
                  (recommendMode === "all")
                    ? <Grid item xs={2}>
                        <Paper variant="outlined" sx={{backgroundColor: colors.redAccent[700], p: 1, borderRadius: "6px"}}>
                          <Typography variant="h3" align="center">
                            {
                              toPercentageFormat(musicInfoToDisplay['keywords']['similarity']).toString() + "%"
                            }
                          </Typography>
                        </Paper>
                      </Grid>
                    : ""
                }
              </Grid>
            </Grid>
          : <Grid item xs={12}>
              <Grid
                container
                spacing={1}
                direction="row"
                justify="flex-start"
                alignItems="flex-start"
                alignContent="stretch"
              >
                <Grid item xs={6} sx={{overflow: "hidden", textOverflow: "ellipsis"}}>
                  <Typography variant="h2">Song Name: {musicInfoToDisplay['song_name']}</Typography>
                  <Typography variant="h3" color={colors.greenAccent[300]}>Artist: {musicInfoToDisplay['artist']}</Typography>
                  <iframe title={musicInfoToDisplay['spotify_id']} src={"https://open.spotify.com/embed/track/" + musicInfoToDisplay['spotify_id']} width="100%" height="80px" frameBorder="0"></iframe>
                </Grid>
                <Grid item xs={2} sx={{overflow: "hidden", textOverflow: "ellipsis"}}>
                  <Typography noWrap variant="h3" align="right" sx={{ p:1, mt: "26px" }}>
                    Your emotion:
                  </Typography>
                  <Typography noWrap variant="h3" align="right" sx={{ p:1, mt: "26px" }}>
                    Similarity:
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  {
                    (speechInfo && 'audio' in speechInfo)
                    ? <Paper 
                        variant="outlined" 
                        sx={{
                          backgroundColor: colors.emotion[speechInfo['audio']['emotion']],
                          p: 1,
                          borderRadius: "6px",
                          mt: 3
                        }}>
                          <Typography variant="h3" align="center">
                            {
                              speechInfo['audio']['emotion']
                                + " ("
                                + toPercentageFormat(speechInfo['audio']['percentage'][speechInfo['audio']['emotion']]).toString()
                                + "%)"
                            }
                          </Typography>
                      </Paper>
                    : ""
                  }
                  
                  <Paper variant="outlined" sx={{backgroundColor: colors.redAccent[700], p: 1, borderRadius: "6px", mt: 3}}>
                    <Typography variant="h3" align="center">
                      {
                        toPercentageFormat(musicInfoToDisplay['audio']['similarity']).toString() + "%"
                      }
                    </Typography>
                  </Paper>
                </Grid>

                {/* <Grid item xs={4} sx={{overflow: "hidden", textOverflow: "ellipsis"}}>

                </Grid> */}
                {/* <Grid item xs={2}>
                  <Paper variant="outlined" sx={{backgroundColor: colors.redAccent[700], p: 1, borderRadius: "6px"}}>
                    <Typography variant="h3" align="center">
                      {
                        toPercentageFormat(musicInfoToDisplay['audio']['similarity']).toString() + "%"
                      }
                    </Typography>
                  </Paper>
                </Grid> */}

              </Grid>
            </Grid>
      }
      {
        (recommendMode !== 'audio' && similarityRadarData)
          ? <Grid item xs={4}>
              <RadarChart data={similarityRadarData} height="250px" title="Speech and Song Similarity"/>
            </Grid>
          : ""
      }


      <Grid item xs={12} >
        <Typography variant="h1" mt={7}>
          Audio & Acoustics Analysis
        </Typography>
      </Grid>
      {
        (speechEmotionDonutData)
          ? <Grid item xs={4}>
              <DonutChart data={speechEmotionDonutData} height="250px" title="Speech Emotion" subtitle="Speech audio emotion percentages" />
              <Typography
                variant="h3"
                color={colors.greenAccent[500]}
                align="center"
                sx={{pt:3}}
              >
                Statistics of Selected Song
              </Typography>
              <Grid
                container
                spacing={1}
                direction="row"
                justify="flex-start"
                alignItems="flex-start"
                alignContent="stretch"
                sx={{p: 3, pt: 2}}
              >
                <Grid item xs={6} sx={{px:1, py:1, overflow: "hidden", textOverflow: "ellipsis"}}>
                  <Typography noWrap variant="h3" align="center" sx={{ p:1 }}>
                    Valence
                  </Typography>
                </Grid>
                <Grid item xs={6} sx={{px:1, py:1}} >
                  <Paper variant="outlined" sx={{backgroundColor: colors.redAccent[700], p: 1, borderRadius: "6px"}}>
                    <Typography variant="h3" align="center">
                      {
                        (musicInfoToDisplay && 'audio' in musicInfoToDisplay)
                          ? musicInfoToDisplay['audio']['valence'].toFixed(3).toString()
                          : ""
                      }
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={6} sx={{px:1, py:1, overflow: "hidden", textOverflow: "ellipsis"}}>
                  <Typography noWrap variant="h3" align="center" sx={{ p:1 }}>
                    Arousal
                  </Typography>
                </Grid>
                <Grid item xs={6} sx={{px:1, py:1}}>
                  <Paper variant="outlined" sx={{backgroundColor: colors.redAccent[700], p: 1, borderRadius: "6px"}}>
                    <Typography variant="h3" align="center">
                      {
                        (musicInfoToDisplay && 'audio' in musicInfoToDisplay)
                          ? musicInfoToDisplay['audio']['arousal'].toFixed(3).toString()
                          : ""
                      }
                    </Typography>
                  </Paper>
                </Grid>


                <Grid item xs={6} sx={{px:1, py:1, overflow: "hidden", textOverflow: "ellipsis"}}>
                  <Typography noWrap variant="h3" align="center" sx={{ p:1 }}>
                    Distance
                  </Typography>
                </Grid>
                <Grid item xs={6} sx={{px:1, py:1}}>
                  <Paper variant="outlined" sx={{width: "100%", backgroundColor: colors.redAccent[700], p: 1, borderRadius: "6px"}}>
                    <Typography variant="h3" align="center">
                      {
                        (musicInfoToDisplay && 'audio' in musicInfoToDisplay)
                          ? musicInfoToDisplay['audio']['distance'].toFixed(3).toString()
                          : ""
                      }
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
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
        (recommendMode !== "audio" && speechTextEmotionDonutData)
          ? <Grid item xs={6}>
              <DonutChart data={speechTextEmotionDonutData} height="250px" title="Text Emotion" subtitle="Speech text emotion percentages" />
            </Grid>
          : ""
      }
      {
        (recommendMode !== "audio" && lyricsEmotionDonutData)
          ? <Grid item xs={6}>
              <DonutChart data={lyricsEmotionDonutData} height="250px" title="Lyrics Emotion" subtitle="Lyrics emotion percentages of the selected song" />
            </Grid>
          : ""
      }
      {
        (recommendMode !== "audio" && speechText)
          ? <Grid item xs={6}>
              <Paper
                variant="outlined"
                sx={{
                  backgroundColor: colors.greenAccent[800],
                  background: `linear-gradient(45deg, ${colors.primary[700]}, ${colors.purplePinkAccent[800]})`,
                  p: 2,
                  borderRadius: "6px",
                  height: "400px"
                }}
                m="20px"
              >
                <Header title="Speech Transcript" subtitle="Transcript recognized from your speech audio"></Header>
                <Paper variant="outlined" sx={{backgroundColor: colors.blueAccent[900], p: 2, borderRadius: "6px", height: "270px", mt: "20px", overflow: "auto"}} mt="10px" >
                  <Typography variant="h5">{speechText}</Typography>
                </Paper>
              </Paper>
            </Grid>
          : ""
      }
      {
        (recommendMode !== "audio")
          ? <Grid item xs={6}>
              <Paper
                variant="outlined"
                sx={{
                  backgroundColor: colors.greenAccent[800],
                  background: `linear-gradient(45deg, ${colors.primary[700]}, ${colors.purplePinkAccent[800]})`,
                  p: 2,
                  borderRadius: "6px",
                  height: "400px"
                }}
                m="20px"
              >
                <Header title="Selected Song Lyrics" subtitle="Lyrics from Genius"></Header>
                <Paper variant="outlined" sx={{backgroundColor: colors.blueAccent[900], p: 2, borderRadius: "6px", height: "270px", mt: "20px", overflow: "auto"}} mt="10px" >
                  <Typography variant="h5">
                    {
                      (lyricsList)
                        ? lyricsList.map(lyrics => {
                          return (
                            <span>
                              {lyrics}<br />
                            </span>
                          )
                        })
                        : ""
                    }
                  </Typography>
                </Paper>
              </Paper>
            </Grid>
          : ""
      }


      {
        (recommendMode === "all")
          ? <Grid item xs={12} mt={5} >
              <Typography variant="h1">
                Semantics Analysis
              </Typography>
            </Grid>
          : ""
      }
      {
        (recommendMode === "all")
          ? <Grid item xs={3}>
              <Paper
                variant="outlined"
                sx={{
                  backgroundColor: colors.greenAccent[800],
                  background: `linear-gradient(45deg, ${colors.primary[700]}, ${colors.purplePinkAccent[800]})`,
                  p: 2,
                  borderRadius: "6px",
                  height: "498px"
                }}
                m="20px"
              >
                <Header title="Speech Keywords" subtitle="Significance of Speech Keywords"></Header>
                <Grid
                  container
                  spacing={2}
                  direction="row"
                  justify="flex-start"
                  alignItems="flex-start"
                  alignContent="stretch"
                  sx={{px: 1, py: 3}}
                >

                  {
                    (speechKeywords)
                      ? speechKeywords.flatMap(keyword => {
                        return [
                          (
                            <Grid item xs={8} sx={{overflow: "hidden", textOverflow: "ellipsis"}}>
                              <Typography noWrap variant="h4" align="center" sx={{ p:1 }}>
                                {keyword['keyword']}
                              </Typography>
                            </Grid>
                          ),
                          (
                            <Grid item xs={4}>
                              <Paper variant="outlined" sx={{backgroundColor: colors.redAccent[700], p: 1, borderRadius: "6px"}}>
                                <Typography variant="h3" align="center">
                                  {keyword['significance'].toFixed(3)}
                                </Typography>
                              </Paper>
                            </Grid>
                          )
                        ]
                      })
                      : ""
                  }

                </Grid>
              </Paper>
            </Grid>
          : ""
      }
      {
        (recommendMode === "all")
          ? <Grid item xs={6}>
              <HeatmapChart data={keywordsSimilarity} height="400px" title="Speech and Lyrics Keywords Similarity" subtitle="Similarity between keywords of speech audio and lyrics" />
            </Grid>
          : ""
      }
      {
        (recommendMode === "all")
          ? <Grid item xs={3}>
              <Paper
                variant="outlined"
                sx={{
                  backgroundColor: colors.greenAccent[800],
                  background: `linear-gradient(45deg, ${colors.primary[700]}, ${colors.purplePinkAccent[800]})`,
                  p: 2,
                  borderRadius: "6px",
                  height: "498px"
                }}
                m="20px"
              >
                <Header title="Lyrics Keywords" subtitle="Significance of Lyrics Keywords"></Header>
                <Grid
                  container
                  spacing={2}
                  direction="row"
                  justify="flex-start"
                  alignItems="flex-start"
                  alignContent="stretch"
                  sx={{px: 1, py: 3}}
                >
                  
                  {
                    (lyricsKeywords)
                      ? lyricsKeywords.flatMap(keyword => {
                        return [
                          (
                            <Grid item xs={8} sx={{overflow: "hidden", textOverflow: "ellipsis"}}>
                              <Typography noWrap variant="h4" align="center" sx={{ p:1 }}>
                                {keyword['keyword']}
                              </Typography>
                            </Grid>
                          ),
                          (
                            <Grid item xs={4}>
                              <Paper variant="outlined" sx={{backgroundColor: colors.redAccent[700], p: 1, borderRadius: "6px"}}>
                                <Typography variant="h3" align="center">
                                  {keyword['significance'].toFixed(3)}
                                </Typography>
                              </Paper>
                            </Grid>
                          )
                        ]
                      })
                      : ""
                  }

                </Grid>
              </Paper>
            </Grid>
          : ""
      }
    </Grid>
  )
}
