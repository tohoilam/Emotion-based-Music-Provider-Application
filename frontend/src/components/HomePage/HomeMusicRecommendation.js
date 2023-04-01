import { Stack, Grid, Typography, Paper, Box, Button, useTheme, FormControl, InputLabel, Select, MenuItem, Card, CardContent, CardActions } from '@mui/material';
import React, { useEffect, useState, useRef } from 'react'

import { RecordButton } from '../../common/RecordButton/RecordButton'

import MRApi from '../../routes/MRApi'

export const HomeMusicRecommendation = ({setIsLoading, setExpandedInfo, setMusicInfoToDisplay}) => {

  const [recordedAudio, setRecordedAudio] = useState(null);
  const [withText, setWithText] = useState(true);
  const [recommendedMusic, setRecommendedMusic] = useState([]);
  const [emotion, setEmotion] = useState("");
  const [emotionPercentage, setEmotionPercentage] = useState(null);
  const [genre, setGenre] = useState("pop");
  const [mode, setMode] = useState(0);

  const [dropActive, setDropActive] = useState([]);
	const audioFileInputRef= useRef(null);

  const theme = useTheme();

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

  const moreInfo = (music) => {
    setMusicInfoToDisplay(music);
    setExpandedInfo(true);
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

  const changeGenre = (event) => {
    setGenre(event.target.value);
  };

  const changeMode = (event) => {
    setMode(event.target.value);
  };

  useEffect(() => {
    console.log(recordedAudio);
  }, [recordedAudio])


  return (
    <Grid container spacing={3} sx={{height: "100%"}} alignItems="stretch" justifyContent="space-between" >
      <Grid item xs={12} sm={4} xl={3} sx={{ height: "100%"}}  >
        <Grid container direction="column" sx={{ height: "100%"}} spacing={3} alignItems="stretch" justify="space-between" wrap="nowrap" >
          {/* <Paper variant="outlined" xs={12} sx={{ height: "100%", bgcolor: theme.palette.secondary.main, borderRadius: "6px" }}></Paper> */}
        
          <Grid item xs={9} sx={{ flexGrow: 1, overflowY: "auto"}}  >
            <Paper variant="outlined" sx={{ height: "100%", bgcolor: theme.palette.secondary.main, borderRadius: "6px", p: 2, overflowY: "auto" }}>
              <Grid container spacing={2}>
                <Grid item xs="auto">
                  <RecordButton setRecordedAudio={setRecordedAudio} diameter="60px" ></RecordButton>
                </Grid>
                <Grid item xs >
                  <Typography align='center' sx={{marginTop: "15px"}}>or</Typography>
                </Grid>
                <Grid item xs={7} >
                  <Button variant="contained" sx={{width: "100%", height: "50px", marginTop: "3px"}}
                    onClick={() => {audioFileInputRef.current.click()}}
                    onDragOver={(e) => {e.preventDefault();e.stopPropagation();setDropActive(true);e.target.classList.add('MuiButton-hover')}}
                    onDragLeave={(e) => {setDropActive(false);e.target.classList.remove('MuiButton-hover')}}
                    onDrop={(e) => {dropFiles(e)}}>
                    Upload a File
                  </Button>
                  <input type="file" id="file-input" onChange={(e) => storeFiles(e.target.files)} ref={audioFileInputRef} />
                </Grid>


                <Grid item xs={12} >
                  {
                    (recordedAudio && recordedAudio['blobUrl'])
                    ? <audio src={recordedAudio['blobUrl']} controls style={{width: "100%", height: "50px" }} ></audio>
                    : ""
                  }
                </Grid>
                <Grid item xs={12} >
                  <Button variant="contained" sx={{ height: "50px" }}>D</Button>
                </Grid>


                <Grid item xs={4}>
                  <Typography variant="h3" >Mode</Typography>
                </Grid>
                <Grid item xs={8}>
                  <FormControl fullWidth>
                    <InputLabel id="mode-selection">Mode</InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={mode}
                      label="Mode"
                      onChange={changeMode}
                    >
                      <MenuItem value={0}>Audio Only</MenuItem>
                      <MenuItem value={1}>Audio and Text</MenuItem>
                      <MenuItem value={2}>Audio, Text, and Context</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={4}>
                  <Typography variant="h3" >Genre</Typography>
                </Grid>
                <Grid item xs={8}>
                  <FormControl fullWidth>
                    <InputLabel id="genre-selection">Genre</InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={genre}
                      label="Genre"
                      onChange={changeGenre}
                    >
                      <MenuItem value={"all"}>ALL</MenuItem>
                      <MenuItem value={"pop"}>Pop</MenuItem>
                      <MenuItem value={"rnb"}>R&B</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Button variant="contained" sx={{ width: "100%" }} onClick={recommendMusic}>RECOMMEND MUSIC</Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={3} sx={{ flexGrow: 1 }}  >
            <Paper variant="outlined" sx={{ height: "100%", bgcolor: theme.palette.secondary.main, borderRadius: "12px", p: 2 }}>
              
            </Paper>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} sm={8} xl={9} sx={{ height: "100%"}} >
        <Paper variant="outlined" sx={{ height: "100%", maxHeight: "100%", bgcolor: theme.palette.secondary.main, borderRadius: "12px", p: 2 }}>
          <Grid container spacing={2} sx={{ height: "100%", overflowY: "auto" }}>
            {
              (recommendedMusic !== [])
              ? recommendedMusic.map((music) => {

                return (
                  // <iframe title={music[0]} src={"https://open.spotify.com/embed/track/" + music[0]} width="225" height="152" frameBorder="0"></iframe>
                  <Grid key={music[0]} item xs={12} sm={6} md={4} >
                    <Card sx={{bgcolor: "rgb(183, 29, 30)", p: 1, borderRadius: "10px"}}>
                      <Grid
                        container
                        spacing={1}
                        direction="row"
                        justify="flex-start"
                        alignItems="flex-start"
                        alignContent="stretch"
                        
                      >
                        <Grid item xs={12} >
                          <iframe title={music[0]} src={"https://open.spotify.com/embed/track/" + music[0]} width="100%" height="152" frameBorder="0"></iframe>
                        </Grid>
                        <Grid item xs={6} >
                          <Typography variant="h3" align="center" pt="3px" >
                            84%
                          </Typography>
                        </Grid>
                        <Grid item xs={6} >
                          <Button variant="contained" sx={{width: "100%"}} onClick={(e) => moreInfo(music)} >
                            More
                          </Button>
                        </Grid>
                      </Grid>
                    </Card>
                  </Grid>
                )
              })
              : ""
            }

          </Grid>
        </Paper>
      </Grid>
     </Grid>
  )


  // return (
  //   <section id="Music-Recommendation" className="home-page-tab">
  //     <section id="contols-section">
  //       <div id="record-button-container">
  //         <RecordButton setRecordedAudio={setRecordedAudio}></RecordButton>
  //       </div>
  //       <section id="file-upload">
  //         <h1 className="file-upload-header">File Upload</h1>
  //         <form id="upload-form" action="#" drop-active={dropActive.toString()}
  //                   onClick={() => {audioFileInputRef.current.click()}}
  //                   onDragOver={(e) => {e.preventDefault();e.stopPropagation();setDropActive(true)}}
  //                   onDragLeave={() => {setDropActive(false)}}
  //                   onDrop={(e) => {dropFiles(e)}}>
  //           <i className="fas fa-cloud-upload-alt"></i>
  //           <p>Browse File to Upload</p>
  //         </form>
  //         <input type="file" id="file-input" onChange={(e) => storeFiles(e.target.files)} ref={audioFileInputRef} multiple />
  //       </section>
  //       <select name="genre-selection" id="genre-selection" defaultValue={1} >
  //         <option disabled value> -- select a genre -- </option>
  //         <option key='pop' value='pop'>Pop</option>
  //         <option key='rnb' value='rnb'>R&B</option>
  //       </select>
  //       <div id="mode-toggle-box" >
  //         <h2 id="mode-header">Language</h2>
  //         <div className="switch-box">
  //           <div className="switch-label">English</div>
  //           <label className="switch">
  //             <input type="checkbox" defaultChecked={true} onChange={() => {setWithText(!withText)}} />
  //             <span className="slider round"></span>
  //           </label>
  //         </div>
  //       </div>
  //       <div id="predict-box">
  //         <button id="recommend-button" onClick={recommendMusic}>Recommend Music</button>
  //         {/* <button id="generate-button" onClick={generateMusic}>Generate New Music</button> */}
  //       </div>
  //       {
  //         (emotion)
  //         ? <div id="predicted-emotion">{emotion}</div>
  //         : ""
  //       }
  //       {
  //         (emotionPercentage)
  //         ? <div id="predicted-emotion-percentage">{emotionPercentage}</div>
  //         : ""
  //       }
  //     </section>
  //     <section id="music-provider-section">
  //       <div id="music-board">
          // {
          //   (recommendedMusic !== [])
          //   ? recommendedMusic.map((music) => {

          //     return (
          //       <iframe title={music[0]} src={"https://open.spotify.com/embed/track/" + music[0]} width="225" height="152" frameBorder="0"></iframe>
          //     )
          //   })
          //   : ""
          // }
  //         {/* {
  //           (generatedAudioList !== [])
  //           ? generatedAudioList.map(generatedAudio => {
  //               return (
  //                 <div>
  //                   <audio src={generatedAudio} id="generated-audio" controls></audio>
  //                   <a href={generatedAudio} download="test.wav">Download</a>
  //                 </div>
  //               )
  //           })
            
  //           : ""
  //         } */}
  //       </div>
  //     </section>
  //   </section>
  // )
}
