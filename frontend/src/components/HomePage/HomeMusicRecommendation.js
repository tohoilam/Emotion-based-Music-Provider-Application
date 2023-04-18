import React, { useEffect, useState, useRef } from 'react'

import { Grid, Typography, Paper, Box, Button, useTheme, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

import { RecordButton } from '../../common/RecordButton/RecordButton'
import MRApi from '../../routes/MRApi'
import { tokens } from '../../theme';

export const HomeMusicRecommendation = ({
    setIsLoading,
    setExpandedInfo,
    setMusicInfoToDisplay,
    setSpeechInfo,
    speechInfo,
    recommendMode,
    setRecommendMode,
    setAudioScatterData,
    infoRef,
    setLoadTime
  }) => {

  const [recordedAudio, setRecordedAudio] = useState(null);
  const [withText, setWithText] = useState(true);
  const [recommendedMusic, setRecommendedMusic] = useState([]);
  // const [genre, setGenre] = useState("pop");
  const [numOfSongs, setNumOfSongs] = useState(20);
  const [selectedMode, setSelectedMode] = useState('audio');

  const [dropActive, setDropActive] = useState([]);
	const audioFileInputRef= useRef(null);

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const dropFiles = (e) => {
		e.preventDefault();
		e.stopPropagation();
    e.target.classList.remove('MuiButton-hover');

		setDropActive(false);
		storeFiles(e.dataTransfer.files)
	}

  const storeFiles = (files) => {

    setIsLoading(true);
    const file = files[0];

    if (file === undefined || file === null) {
      setIsLoading(false);
    }
    else {
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

      // setRecommendedMusic([]);
      // setSpeechInfo(null);

      setIsLoading(false);
    }

	}

  const moreInfo = (selectedMusic) => {
    setMusicInfoToDisplay(selectedMusic);
    
    const selectedMusicPoints = [{
      "x": selectedMusic["audio"]["valence"],
      "y": selectedMusic["audio"]["arousal"]
    }]

    const nonSelectedMusicPoints = recommendedMusic
                                    .filter(music => music['spotify_id'] !== selectedMusic['spotify_id'] )
                                    .map(music => {
                                      return ({
                                        "x": music["audio"]["valence"],
                                        "y": music["audio"]["arousal"]
                                      })
                                    })

    const va = emotionPercentagesToVA(speechInfo["audio"]["percentage"]);

    const speechPoints = [{
      "x": va["valence"],
      "y": va["arousal"]
    }];

    setAudioScatterData([
      {
        "id": "Other Songs",
        "data": nonSelectedMusicPoints
      },
      {
        "id": "Speech",
        "data": speechPoints
      },
      {
        "id": "Selected Song",
        "data": selectedMusicPoints
      }
    ]);


    setExpandedInfo(true);
    setTimeout(() => {
      infoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, "300");
  }

  const emotionPercentagesToVA = (percentage) => {
    const valence = (percentage['Happiness'] + percentage['Calmness'])*2 - 1
    const arousal = (percentage['Happiness'] + percentage['Anger'])*2 - 1;
    console.log(percentage);
    console.log(arousal);
    return {
      "valence": valence,
      "arousal": arousal
    }
  }

  const toPercentageFormat = (decimal) => {
    return (decimal * 100).toFixed(2);
  }

  const recommendMusic = async () => {
    setIsLoading(true);
    let formData = new FormData();
    formData.append(recordedAudio['className'], recordedAudio['blob'], recordedAudio['fileName']);
    formData.append('mode', selectedMode);
    formData.append('size', numOfSongs);

    const response = await MRApi.getMusicRecommendation(formData);
    console.log(response);
    const speechInfo = response['data']['speech_info'];
    const songList = response['data']['song_list'];

    setSpeechInfo(speechInfo);
    setRecommendedMusic(songList);
    setRecommendMode(selectedMode);
    
    setIsLoading(false);
  }

  const changeNumOfSongs = (event) => {
    setNumOfSongs(event.target.value);
  };

  const changeMode = (event) => {
    setSelectedMode(event.target.value);
    if (event.target.value == "audio") {
      setLoadTime("15");
    }
    else if (event.target.value == "combined") {
      setLoadTime("30")
    }
    else {
      setLoadTime("60");
    }


  };

  useEffect(() => {
    console.log(recordedAudio);
  }, [recordedAudio])


  const EmotionItem = () => {
    let emotionText = "";
    let percentage = 0;

    if (recommendMode === 'audio') {
      if (speechInfo && 'audio' in speechInfo) {
        emotionText = speechInfo['audio']['emotion'];
        percentage = speechInfo['audio']['percentage'][emotionText];
      }
    }
    else {
      if (speechInfo && 'combined' in speechInfo) {
        emotionText = speechInfo['combined']['emotion'];
        percentage = speechInfo['combined']['percentage'][emotionText];
      }
    }

    if (emotionText && percentage) {
      const text = emotionText + " (" + toPercentageFormat(percentage).toString() + "%)"

      return (
        <Paper variant="outlined" sx={{ bgcolor: colors.emotion[emotionText], borderRadius: "20px", height: "100%" }}>
          <Typography variant="h3" align="center" sx={{pt: "5px"}}>{text}</Typography>
        </Paper>
      )
    }
    else {
      return "";
    }
  }

  return (
    <Grid container spacing={3} sx={{height: "100%"}} alignItems="stretch" justifyContent="space-between" >
      <Grid item xs={12} sm={4} xl={3} sx={{ height: "100%", overflowY: "auto"}}  >
        <Paper variant="outlined" sx={{ bgcolor: theme.palette.background.paper, borderRadius: "6px", p: 2, overflowY: "auto" }}>
          <Grid container alignItems="flex-start" justifyContent="space-between" spacing={1} sx={{  p:1 }}>
            <Grid item sx={{height: "100px", minWidth: "84px", m: 0}}>
              <RecordButton setRecordedAudio={setRecordedAudio} diameter="84px" ></RecordButton>
            </Grid>
            <Grid item xs sx={{height: "100px"}} >
              <Typography align='center' sx={{marginTop: "30px"}}>or</Typography>
            </Grid>
            <Grid item xs={7} sx={{height: "100px"}} >
              <Button
                variant="contained"
                sx={{
                  width: "100%",
                  height: "50px",
                  marginTop: "16px",
                }}
                startIcon={<FileUploadOutlinedIcon />}
                onClick={() => {audioFileInputRef.current.click()}}
                onDragOver={(e) => {e.preventDefault();e.stopPropagation();setDropActive(true);e.target.classList.add('MuiButton-hover')}}
                onDragLeave={(e) => {setDropActive(false);e.target.classList.remove('MuiButton-hover')}}
                onDrop={(e) => {dropFiles(e)}}>
                Upload a File
              </Button>
              <input type="file" id="file-input" onChange={(e) => storeFiles(e.target.files)} ref={audioFileInputRef} />
            </Grid>


            <Grid item xs={12} sx={{height: "85px"}}>
              {
                (recordedAudio && recordedAudio['blobUrl'])
                ? <audio src={recordedAudio['blobUrl']} controls style={{width: "100%", height: "50px" }} ></audio>
                : ""
              }
            </Grid>


            <Grid item xs={4} sx={{height: "70px"}}>
              <Typography variant="h3" align="left" sx={{pt: "12px", pl: 1}} >Mode</Typography>
            </Grid>
            <Grid item xs={8} sx={{height: "70px"}}>
              <FormControl fullWidth>
                <InputLabel id="mode-selection">Mode</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={selectedMode}
                  label="Mode"
                  onChange={changeMode}
                  sx={{height: "50px"}}
                >
                  <MenuItem value={'audio'}>Audio Only</MenuItem>
                  <MenuItem value={'combined'}>Audio and Text</MenuItem>
                  <MenuItem value={'all'}>Audio, Text, and Context</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={7} sx={{height: "70px"}}>
              <Typography variant="h3" align="left" sx={{pt: "12px", pl: 1}} >Num of Songs</Typography>
            </Grid>
            <Grid item xs={5} sx={{height: "70px"}}>
              <FormControl fullWidth>
                <InputLabel id="num-songs-selection">Number of Songs</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={numOfSongs}
                  label="Number of Songs"
                  onChange={changeNumOfSongs}
                  sx={{height: "50px"}}
                >
                  <MenuItem value={1}>1</MenuItem>
                  <MenuItem value={2}>2</MenuItem>
                  <MenuItem value={3}>3</MenuItem>
                  <MenuItem value={4}>4</MenuItem>
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={15}>15</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={30}>30</MenuItem>
                  <MenuItem value={35}>35</MenuItem>
                  <MenuItem value={40}>40</MenuItem>
                  <MenuItem value={45}>45</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                sx={{
                  width: "100%",
                  height: "45px",
                }}
                onClick={recommendMusic}
                startIcon={<MusicNoteIcon />}
              >
                RECOMMEND MUSIC
              </Button>
            </Grid>
          </Grid>
        </Paper>
        {
              (speechInfo)
                ? <Grid item xs={12} sx={{mt: 2}}>
                    <Paper variant="outlined" sx={{backgroundColor: colors.background.paper, height: "120px", p: 2, pt: 2, borderRadius: "6px"}}>
                      <Typography variant="h3" color={colors.grey[100]} align="center" >
                        Your emotion
                      </Typography>
                      <Box sx={{height: "40px", mt: 1}}>
                        <EmotionItem />
                      </Box>
                    </Paper>
                    
                  </Grid>
                : ""
            }
      </Grid>
      <Grid item xs={12} sm={8} xl={9} sx={{ height: "100%"}} >
        <Paper variant="outlined" sx={{ height: "100%", maxHeight: "100%", bgcolor: theme.palette.background.paper, borderRadius: "6px", px: 2, py: 1, overflowY: "auto" }}>
          
                  
            {
              (recommendedMusic && recommendedMusic != [])
              ? recommendedMusic.map((music) => {

                return (
                  <Grid
                    container
                    spacing={2}
                    direction="row"
                    justify="flex-start"
                    alignItems="flex-start"
                    alignContent="stretch"
                    wrap="nowrap"
                    sx={{height: "100px", my: 1}}
                    key={music['spotify_id']}
                  >
                    <Grid item xs={10}>
                      <iframe 
                        title={music['spotify_id']}
                        src={"https://open.spotify.com/embed/track/" + music['spotify_id']}
                        width="100%"
                        height="100px"
                        frameBorder="0"
                      ></iframe>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography variant="h3" align="center" pt="3px" sx={{height: "40px", mt: "3px"}}>
                        {
                          (recommendMode === 'audio')
                            ? toPercentageFormat(music['audio']['similarity']).toString() + "%"
                            : (recommendMode === 'combined')
                              ? toPercentageFormat(music['combined']['similarity']).toString() + "%"
                              : toPercentageFormat(music['all']['similarity']).toString() + "%"
                        }
                      </Typography>
                      <Button
                        variant="contained"
                        sx={{
                          height: "35px",
                          width: "100%",
                        }}
                        onClick={(e) => moreInfo(music)}
                      >
                        More
                      </Button>
                    </Grid>
                  </Grid>
                )
              })
              : ""
            }
        </Paper>
      </Grid>
     </Grid>
  )
}
