import { Box, Paper, useTheme } from '@mui/material';
import { ResponsiveRadar } from '@nivo/radar'
import { tokens } from '../../theme';
import { BasicTooltip } from '@nivo/tooltip';
import Header from '../Header';
import ChartsTheme from './ChartsTheme';

const mockData = [
  {
    "model": "audio",
    "percentage": 0.8,
  },
  {
    "model": "lyrics",
    "percentage": 0.4,
  },
  {
    "model": "meanings",
    "percentage": 0.5,
  },
]

// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.
const RadarChart = ({ data, height, title, subtitle}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [chartsTheme, chartsEmotionColors] = ChartsTheme()

  const Radar = () => {
    return (
      <ResponsiveRadar
          data={data}
          theme={chartsTheme}
          keys={[ 'similarity' ]}
          indexBy="model"
          valueFormat=">-.2f"
          maxValue={1}
          margin={{ top: 40, right: 80, bottom: 20, left: 80 }}
          borderColor={{ from: 'color' }}
          gridLabelOffset={20}
          dotSize={3}
          dotColor={{ theme: 'background' }}
          dotBorderWidth={2}
          colors={{ scheme: 'nivo' }}
          blendMode="lighten"
          motionConfig="wobbly"
          fillOpacity={0.85}
          // gridShape="linear"
          legends={[
              {
                  anchor: 'top-left',
                  direction: 'column',
                  translateX: -5000,
                  translateY: -40,
                  itemWidth: 80,
                  itemHeight: 20,
                  itemTextColor: '#999',
                  symbolSize: 12,
                  symbolShape: 'circle',
                  effects: [
                      {
                          on: 'hover',
                          style: {
                              itemTextColor: '#000'
                          }
                      }
                  ]
              }
          ]}
      />
    )
  }


  return (
    <Paper
      variant="outlined"
      sx={{
        backgroundColor: colors.greenAccent[800],
        p: 2,
        borderRadius: "6px",
        background: `linear-gradient(45deg, ${colors.primary[700]}, ${colors.purplePinkAccent[800]})`
      }}
      m="20px"
    >
      <Header title={title} subtitle={subtitle}></Header>
      <Box height={height}>
        <Radar />
      </Box>
    </Paper>
  )
}

export default RadarChart;
