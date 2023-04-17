import React, { useEffect, useState, useRef } from 'react'

import { Grid, Typography, Paper, Box, Button, useTheme, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

import { RecordButton } from '../../common/RecordButton/RecordButton'
import MGApi from '../../routes/MGApi'
import { tokens } from '../../theme';

export const HomeMusicGeneration = ({
    setIsLoading,
    setExpandedInfo,
    setGeneratedMusicInfoToDisplay,
    setSpeechInfo,
    speechInfo,
    generateMode,
    setGenerateMode,
    infoRef
  }) => {

  const [recordedAudio, setRecordedAudio] = useState(null);
  const [withText, setWithText] = useState(true);
  const [recommendedMusic, setRecommendedMusic] = useState([]);
  const [numOfSongs, setNumOfSongs] = useState(5);
  const [selectedMode, setSelectedMode] = useState('monophonic');
  const [generatedMusic, setGeneratedMusic] = useState('')

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

      setIsLoading(false);
    }

	}

  const moreInfo = (selectedMusic) => {
    setGeneratedMusicInfoToDisplay(selectedMusic);
    


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

  const generateMusic = async () => {
    setIsLoading(true);
    let formData = new FormData();
    formData.append(recordedAudio['className'], recordedAudio['blob'], recordedAudio['fileName']);
    formData.append('mode', selectedMode);
    formData.append('size', numOfSongs);

    const response = await MGApi.getMusicGeneration(formData);
    console.log(response);
    const speech = response['speech_info'];
    const generated = response['generatedMusic'];

    setSpeechInfo(speech);
    setGeneratedMusic(generated);
    setGenerateMode(selectedMode);
    
    setIsLoading(false);
  }


  const changeMode = (event) => {
    setSelectedMode(event.target.value);
  };

  const changeNumOfSongs = (event) => {
    setNumOfSongs(event.target.value);
  };


  const EmotionItem = () => {
    let emotionText = "";
    let percentage = 0;

    if (speechInfo) {
      emotionText = speechInfo['emotion'];
      percentage = speechInfo['percentage'][emotionText];
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
              <Typography variant="h3" align="center" sx={{pt: "12px", pl: 1}} >Mode</Typography>
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
                  <MenuItem value={'monophonic'}>Monophonic</MenuItem>
                  <MenuItem value={'polyphonic'}>Polyphonic</MenuItem>
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
                onClick={generateMusic}
                startIcon={<MusicNoteIcon />}
              >
                GENERATE MUSIC
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
              (generatedMusic && generatedMusic != [])
              ? generatedMusic.map((music) => {

                return (
                  <Grid
                    container
                    spacing={2}
                    direction="row"
                    justify="flex-start"
                    alignItems="flex-start"
                    alignContent="stretch"
                    wrap="nowrap"
                    sx={{height: "100px", my: 4}}
                    key={"0"}
                  >
                    <Grid item xs={10}>
                      <Typography variant="h3">
                        {
                          music['name']
                        }
                      </Typography>
                      <audio src={music['blobUrl']} controls style={{width: "100%", height: "35px", marginTop: "15px" }}></audio>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography variant="h3" align="center" pt="3px" sx={{height: "40px", mt: "3px"}}>
                        {
                          ('generated' in music)
                            ? toPercentageFormat(music['generated']['similarity']).toString() + "%"
                            : ""
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
