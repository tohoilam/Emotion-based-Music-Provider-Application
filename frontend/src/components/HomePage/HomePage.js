import React, { useEffect, useState, useRef } from 'react'

import { RecordButton } from '../../common/RecordButton/RecordButton'
import { HomeMusicRecommendation } from './HomeMusicRecommendation'
import { MusicRecommendationInfo } from '../Info/MusicRecommendationInfo'
import DonutChart from '../../common/Charts/DonutChart'


import MGApi from '../../routes/MGApi'
import MRApi from '../../routes/MRApi'
import { tokens } from '../../theme'


import './HomePage.css'
import { ThemeProvider, Container, Typography, Paper, Box, Tab, Button, Grid, Accordion, AccordionSummary, AccordionDetails, CircularProgress } from '@mui/material'
import { useTheme } from '@mui/material';

import { TabContext, TabList, TabPanel } from '@mui/lab'

export const HomePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedAudioList, setGeneratedAudioList] = useState([]);
  const [expandedInfo, setExpandedInfo] = useState(false);
  const [musicInfoToDisplay, setMusicInfoToDisplay] = useState(null);
  const [speechInfo, setSpeechInfo] = useState(null);
  const [audioScatterData, setAudioScatterData] = useState([]);
  const [recommendMode, setRecommendMode] = useState('audio');
  const [tab, setTab] = React.useState('1');

  const infoRef = useRef(null);

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const closeInfo = () => {
    setExpandedInfo(false);
  }
  

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };

  useEffect(() => {
    console.log(musicInfoToDisplay);
  }, [musicInfoToDisplay]);

  // useEffect(() => {
  //   if (expandedInfo === true) {
  //     setTimeout(() => {
  //       infoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  //     }, "300");
  //   }
  // }, [expandedInfo]);


  // const generateMusic = async () => {
  //   setIsLoading(true);
  //   let formData = new FormData();
  //   formData.append(recordedAudio['className'], recordedAudio['blob'], recordedAudio['fileName']);

  //   const response = await MGApi.getMusicGeneration(formData);
	// 	if (response) {
  //     const blobUrlList = response.blobUrlList;
  //     const infoData = response.infoData;

	// 		setGeneratedAudioList(blobUrlList);
	// 	}

	// 	setIsLoading(false);
  // }

  return (
    // <ThemeProvider theme={theme}>
    <TabContext id="home-page" value={tab}>
      <Box sx={{ height: "100vh", width: "100%"}}>
        {
          (isLoading)
          ? <Box align="center" sx={{ width: "100%", height: "100%", position: "fixed", bgcolor: "rgba(0, 0, 0, 0.6)", zIndex: "100"}}>
              <CircularProgress size={50} thickness={3} sx={{mt: "45vh"}}></CircularProgress>
              <Typography variant="h4" color={colors.primary[500]}>analyzing...</Typography>
              {
                (recommendMode !== "audio")
                  ? <Typography variant="text" color={colors.primary[600]}>(approx. 1 minute)</Typography>
                  : ""
              }
            </Box>
          : ""
        }
        {/* <Grid item xs={1}> */}
          <Typography
            variant="h1"
            sx={{ height: "70px", textAlign: "center", pt: "20px"}}
            color={colors.grey[100]}
          >
            Emotion-based Music Provider
          </Typography>
        {/* </Grid> */}
        {/* <Grid item xs={1}> */}
          {/* <Box sx={{ borderBottom: 1, borderColor: 'divider' }}> */}
            <TabList
              onChange={handleChange}
              TabIndicatorProps={{ color: colors.primary[100] }}
              aria-label="music recommendation or music generation"
              centered
              
            >
              <Tab 
                sx={{ 
                  height: "10px",
                  py: "0px",
                  // color: 
                  '.Mui-selected' : {
                    color: colors.primary[200],
                  },
                  "& .MuiTab-root.Mui-selected": {
                    color: 'red'
                  }
                }}
                textColor={colors.primary[200]}
                indicatorColor={colors.primary[200]}
                label="Music Recommendation"
                value="1"
              />
              <Tab sx={{ height: "10px", py: "0px"}} label="Music Generation" value="2" />
            </TabList>
          {/* </Box> */}
        {/* </Grid> */}
        {/* <Grid item xs={10} sx={{ height: "80%"}} > */}
          <Container id="tabs" maxWidth="1600px" sx={{height: "calc(100% - 150px)", width: "100%" }}>
            <TabPanel value="1" sx={{height: "100%", pt: 0}}>
              <HomeMusicRecommendation
                  setIsLoading={setIsLoading}
                  setExpandedInfo={setExpandedInfo}
                  setMusicInfoToDisplay={setMusicInfoToDisplay}
                  setSpeechInfo={setSpeechInfo}
                  speechInfo={speechInfo}
                  recommendMode={recommendMode}
                  setRecommendMode={setRecommendMode}
                  setAudioScatterData={setAudioScatterData}
                  infoRef={infoRef}
              ></HomeMusicRecommendation>
              {/* <Box ref={infoRef} sx={{height: (expandedInfo) ? "100%" : "5%"}}>
                <Paper sx={{height: "100%", mt: 3, bgcolor: theme.palette.secondary.main, borderRadius: "12px" }}></Paper>
              </Box> */}
              <Paper 
                sx={{
                  bgcolor: theme.palette.background.paper,
                  borderRadius: "6px",
                  mt: 3,
                  backgroundImage: "none",
                  border: "1px solid rgba(255, 255, 255, 0.12)"}
                }
                ref={infoRef}
              >
                <Accordion expanded={expandedInfo} square sx={{height: "100%", bgcolor: "rgba(0,0,0,0)", backgroundImage: "none", cursor: "default"}}>
                  <AccordionSummary
                    sx={{borderRadius: "100px", bgcolor: "rgba(0,0,0,0)", cursor: "default"}}
                    // expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    <Typography sx={{ textAlign: "center", width: "100%", pt: "7px", pb: "3px", fontSize: "0.9rem"}}>MORE INFO</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {/* <Typography> */}
                      {
                        (musicInfoToDisplay)
                        ? <MusicRecommendationInfo
                              speechInfo={speechInfo}
                              musicInfoToDisplay={musicInfoToDisplay}
                              recommendMode={recommendMode}
                              audioScatterData={audioScatterData}
                          />
                        : ""
                      }
                      <Button
                        variant="text"
                        align="center"
                        sx={{bgcolor: colors.grey[800], width: "100%", height: "25px"}}
                        onClick={closeInfo}
                      >
                        close info
                      </Button>
                    {/* </Typography> */}
                  </AccordionDetails>
                </Accordion>
              </Paper>
              
            </TabPanel>
            <TabPanel value="2">Item Two</TabPanel>
          </Container>
        {/* </Grid> */}
      </Box>
    </TabContext>
    // </ThemeProvider>

  );

  // return (
  //   <TabContext id="home-page" value={tab}>
  //     <header>Emotion-based Music Provider</header>
  //     <section id="EBMP-main">
  //       <Box id="tabsMenu" sx={{ borderBottom: 1, borderColor: 'divider' }}>
  //         <TabList onChange={handleChange} aria-label="lab API tabs example" centered>
  //           <Tab label="Music Recommendation" value="1" />
  //           <Tab label="Music Generation" value="2" />
  //         </TabList>
  //       </Box>
  //       <div id="tabs">
  //         <TabPanel value="1">
  //           <HomeMusicRecommendation setIsLoading={setIsLoading} ></HomeMusicRecommendation>
  //         </TabPanel>
  //         <TabPanel value="2">Item Two</TabPanel>
  //       </div>
        
  //     </section>

  //     {
  //       (isLoading === true)
  //       ? <div id="loading">
  //           <div id="loader"></div>
  //         </div>
  //       : <div id="loading" className='not-loading'>
  //           <div id="loader"></div>
  //         </div>
  //     }
  //   </TabContext>
  // );
}