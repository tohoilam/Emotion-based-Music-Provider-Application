import { Box, Paper, useTheme } from '@mui/material';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import { tokens } from '../../theme';
import Header from '../Header';
import ChartsTheme from './ChartsTheme';

const mockData = [
  {
    "id": "testing",
    "data": [
      {
        "x": "this",
        "y": 0.29,
      },
      {
        "x": "but",
        "y": 0.18,
      },
      {
        "x": "here",
        "y": 0.06,
      },
      {
        "x": "why",
        "y": 0.38,
      },
      {
        "x": "wtf",
        "y": 0.19,
      },
      {
        "x": "hunger",
        "y": 0.21,
      }
    ]
  },
  {
    "id": "baby",
    "data": [
      {
        "x": "this",
        "y": 0.19,
      },
      {
        "x": "but",
        "y": 0.01,
      },
      {
        "x": "here",
        "y": 0.03,
      },
      {
        "x": "why",
        "y": 0.24,
      },
      {
        "x": "wtf",
        "y": 0.34,
      },
      {
        "x": "hunger",
        "y": 0.19,
      }
    ]
  },
  {
    "id": "covergirls",
    "data": [
      {
        "x": "this",
        "y": 0.10,
      },
      {
        "x": "but",
        "y": 0.25,
      },
      {
        "x": "here",
        "y": 0.19,
      },
      {
        "x": "why",
        "y": 0.02,
      },
      {
        "x": "wtf",
        "y": 0.17,
      },
      {
        "x": "hunger",
        "y": 0.30,
      }
    ]
  }
]
// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.
const HeatmapChart = ({ data, height, title, subtitle }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [chartsTheme, chartsEmotionColors] = ChartsTheme()

  const Heatmap = () => {
    return (
      <ResponsiveHeatMap
          data={mockData}
          theme={chartsTheme}
          margin={{ top: 80, right: 20, bottom: 50, left: 90 }}
          valueFormat=">-.1%"
          axisTop={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: -30,
              legend: 'Lyrics Keywords',
              legendPosition: 'middle',
              legendOffset: -50
          }}
          // axisRight={{
          //     tickSize: 5,
          //     tickPadding: 5,
          //     tickRotation: 0,
          //     legend: 'Speech Keywords',
          //     legendPosition: 'middle',
          //     legendOffset: 70
          // }}
          axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Speech Keywords',
              legendPosition: 'middle',
              legendOffset: -72
          }}
          colors={{
              type: 'diverging',
              scheme: 'red_yellow_blue',
              minValue: 0,
              maxValue: 1,
              divergeAt: 0.5
          }}
          emptyColor="#555555"
          borderColor={{
              from: 'color',
              modifiers: [
                  [
                      'darker',
                      0.8
                  ]
              ]
          }}
          legends={[
              {
                  anchor: 'bottom',
                  translateX: 0,
                  translateY: 30,
                  length: 400,
                  thickness: 8,
                  direction: 'row',
                  tickPosition: 'after',
                  tickSize: 3,
                  tickSpacing: 4,
                  tickOverlap: false,
                  tickFormat: '>-.1%',
                  title: 'Value →',
                  titleAlign: 'start',
                  titleOffset: 4
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
        background: `linear-gradient(45deg, ${colors.primary[700]}, ${colors.purplePinkAccent[800]})`,
        p: 2,
        borderRadius: "6px"
      }}
      m="20px"
    >
      <Header title={title} subtitle={subtitle}></Header>
      <Box height={height}>
        <Heatmap />
      </Box>
    </Paper>
  )
}

export default HeatmapChart;
