import { Box, Paper, useTheme } from '@mui/material';
import { ResponsiveParallelCoordinates } from '@nivo/parallel-coordinates';
import { tokens } from '../../theme';
import Header from '../Header';
import ChartsTheme from './ChartsTheme';

const mockData = [
    {
      "speech_keywords": "covergirls",
      "similarity": 0.2,
      "lyrics_keywords": "hunger"
    },
    {
      "speech_keywords": "covergirls",
      "similarity": 0.18,
      "lyrics_keywords": "wtf"
    },
    {
      "speech_keywords": "covergirls",
      "similarity": 0.02,
      "lyrics_keywords": "why"
    },
    {
      "speech_keywords": "covergirls",
      "similarity": 0.31,
      "lyrics_keywords": "here"
    },
    {
      "speech_keywords": "baby",
      "similarity": 0.21,
      "lyrics_keywords": "hunger"
    },
    {
      "speech_keywords": "baby",
      "similarity": 0.26,
      "lyrics_keywords": "here"
    },
    {
      "speech_keywords": "baby",
      "similarity": 0.27,
      "lyrics_keywords": "but"
    },
    {
      "speech_keywords": "baby",
      "similarity": 0.01,
      "lyrics_keywords": "why"
    },
    {
      "speech_keywords": "testing",
      "similarity": 0.05,
      "lyrics_keywords": "wtf"
    },
    {
      "speech_keywords": "testing",
      "similarity": 0.14,
      "lyrics_keywords": "this"
    },
    {
      "speech_keywords": "testing",
      "similarity": 0.18,
      "lyrics_keywords": "but"
    },
    {
      "speech_keywords": "testing",
      "similarity": 0.29,
      "lyrics_keywords": "why"
    },
 
  ]
// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.
const ParallelChart = ({ data, height, title, subtitle }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [chartsTheme, chartsEmotionColors] = ChartsTheme()

  const Parallel = () => {
    return (
      <ResponsiveParallelCoordinates
          data={mockData}
          theme={chartsTheme}
          variables={[
              {
                  key: 'speech_keywords',
                  type: 'point',
                  padding: 1,
                  values: [
                      'covergirls',
                      'baby',
                      'testing'
                  ],
                  legend: 'Speech Keywords',
                  legendPosition: 'start',
                  legendOffset: -20
              },
              {
                  key: 'similarity',
                  type: 'linear',
                  min: 'auto',
                  max: 'auto',
                  ticksPosition: 'before',
                  legend: 'Similarity',
                  legendPosition: 'start',
                  legendOffset: 20
              },
              {
                  key: 'lyrics_keywords',
                  type: 'point',
                  padding: 0,
                  values: [
                      'hunger',
                      'wtf',
                      'why',
                      'here',
                      'but',
                      'this'
                  ],
                  legend: 'Lyrics Keywords',
                  legendPosition: 'start',
                  legendOffset: -20
              },
          ]}
          margin={{ top: 20, right: 50, bottom: 20, left: 40 }}
          curve="natural"
          colors={{ scheme: 'yellow_orange_red' }}
          strokeWidth={3}
          lineOpacity={0.5}
      />
    )
  }


  return (
    <Paper variant="outlined" sx={{backgroundColor: colors.greenAccent[800], p: 2, borderRadius: "6px"}} m="20px">
      <Header title={title} subtitle={subtitle}></Header>
      <Box height={height}>
        <Parallel />
      </Box>
    </Paper>
  )
}

export default ParallelChart;
