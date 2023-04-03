import { Box, useTheme } from '@mui/material';
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
const RadarChart = ({ data /* see data tab */ }) => {
  const [chartsTheme, chartsEmotionColors] = ChartsTheme()

  const Radar = () => {
    return (
      <ResponsiveRadar
          data={mockData}
          theme={chartsTheme}
          keys={[ 'percentage' ]}
          indexBy="model"
          valueFormat=">-.2f"
          maxValue={1}
          margin={{ top: 70, right: 80, bottom: 40, left: 80 }}
          borderColor={{ from: 'color' }}
          gridLabelOffset={36}
          dotSize={2}
          dotColor={{ theme: 'background' }}
          dotBorderWidth={2}
          colors={{ scheme: 'nivo' }}
          blendMode="normal"
          motionConfig="wobbly"
          fillOpacity={0.85}
          // gridShape="linear"
          legends={[
              {
                  anchor: 'top-left',
                  direction: 'column',
                  translateX: -50,
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
    <Box m="20px">
      <Header title="TESTING" subtitle="lololololololol"></Header>
      <Box height="500px">
        <Radar />
      </Box>
    </Box>
  )
}

export default RadarChart;
