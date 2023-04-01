import React, { useEffect, useState, useRef } from 'react'

import { RecordButton } from '../../common/RecordButton/RecordButton'
import { HomeMusicRecommendation } from './HomeMusicRecommendation'

import MGApi from '../../routes/MGApi'
import MRApi from '../../routes/MRApi'

import './HomePage.css'
import { ThemeProvider, Container, Typography, Paper, Box, Tab, Button, Grid, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import { useTheme } from '@mui/material/styles';

import { TabContext, TabList, TabPanel } from '@mui/lab'

export const HomePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedAudioList, setGeneratedAudioList] = useState([]);
  const [expandedInfo, setExpandedInfo] = useState(false);
  const [tab, setTab] = React.useState('1');

  const infoRef = useRef(null);

  // const theme = useTheme();
  const theme = useTheme();
  // const theme = createTheme({
  //   overrides: {
  //     MuiAccordionSummary: {
  //       content: {
  //         margin: 0,
  //       },
  //     },
  //   },
  // });
  

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };


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
    <ThemeProvider theme={theme}>
    <TabContext id="home-page" value={tab}>
      <Grid container sx={{ height: "100vh"}} direction="column" justifyContent="center" alignItems="stretch" wrap='nowrap'>
        <Grid item xs={1}>
          <Typography
            variant="h1"
            sx={{ height: "10%", textAlign: "center"}}
          >
            Emotion-based Music Provider
          </Typography>
        </Grid>
        <Grid item xs={1}>
          {/* <Box sx={{ borderBottom: 1, borderColor: 'divider' }}> */}
            <TabList onChange={handleChange} aria-label="lab API tabs example" centered >
              <Tab sx={{ height: "10px", py: "0px"}} label="Music Recommendation" value="1" />
              <Tab sx={{ height: "10px", py: "0px"}} label="Music Generation" value="2" />
            </TabList>
          {/* </Box> */}
        </Grid>
        <Grid item xs={10} sx={{ height: "80%"}} >
          <Container id="tabs" maxWidth="1600px" sx={{height: "100%", width: "100%" }}>
            <TabPanel value="1" sx={{height: "95%"}}>
              <HomeMusicRecommendation setIsLoading={setIsLoading} setExpandedInfo={setExpandedInfo} ></HomeMusicRecommendation>
              {/* <Box ref={infoRef} sx={{height: (expandedInfo) ? "100%" : "5%"}}>
                <Paper sx={{height: "100%", mt: 3, bgcolor: theme.palette.secondary.main, borderRadius: "12px" }}></Paper>
              </Box> */}
              <Paper sx={{ bgcolor: theme.palette.secondary.main, borderRadius: "12px", mt: 3}}>
                <Accordion expanded={expandedInfo} square sx={{height: "100%", bgcolor: "rgba(0,0,0,0)"}}>
                  <AccordionSummary
                    sx={{borderRadius: "12px"}}
                    // expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    <Typography sx={{ textAlign: "center", width: "100%"}}>More Info</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                      malesuada lacus ex, sit amet blandit leo lobortis eget.
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                      malesuada lacus ex, sit amet blandit leo lobortis eget.
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                      malesuada lacus ex, sit amet blandit leo lobortis eget.
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                      malesuada lacus ex, sit amet blandit leo lobortis eget.
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                      malesuada lacus ex, sit amet blandit leo lobortis eget.
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                      malesuada lacus ex, sit amet blandit leo lobortis eget.
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                      malesuada lacus ex, sit amet blandit leo lobortis eget.
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                      malesuada lacus ex, sit amet blandit leo lobortis eget.
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                      malesuada lacus ex, sit amet blandit leo lobortis eget.
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </Paper>
              
            </TabPanel>
            <TabPanel value="2">Item Two</TabPanel>
          </Container>
        </Grid>
      </Grid>
    </TabContext>
    </ThemeProvider>

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