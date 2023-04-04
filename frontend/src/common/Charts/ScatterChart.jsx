import { Box, Paper, useTheme } from '@mui/material';
import { ResponsiveScatterPlot } from '@nivo/scatterplot';
import { tokens } from '../../theme';
import Header from '../Header';
import ChartsTheme from './ChartsTheme';

const mockData = [
  {
    "id": "group A",
    "data": [
      {
        "x": 40,
        "y": 31
      },
      {
        "x": 76,
        "y": 115
      },
      {
        "x": 31,
        "y": 46
      },
      {
        "x": 58,
        "y": 62
      },
      {
        "x": 51,
        "y": 94
      },
      {
        "x": 85,
        "y": 82
      },
      {
        "x": 40,
        "y": 10
      },
      {
        "x": 14,
        "y": 74
      },
      {
        "x": 41,
        "y": 57
      },
      {
        "x": 60,
        "y": 14
      },
      {
        "x": 42,
        "y": 18
      },
      {
        "x": 20,
        "y": 37
      },
      {
        "x": 67,
        "y": 42
      },
      {
        "x": 9,
        "y": 4
      },
      {
        "x": 19,
        "y": 92
      },
      {
        "x": 8,
        "y": 71
      },
      {
        "x": 82,
        "y": 101
      },
      {
        "x": 7,
        "y": 113
      },
      {
        "x": 20,
        "y": 7
      },
      {
        "x": 34,
        "y": 14
      },
      {
        "x": 7,
        "y": 15
      },
      {
        "x": 4,
        "y": 103
      },
      {
        "x": 99,
        "y": 43
      },
      {
        "x": 67,
        "y": 44
      },
      {
        "x": 88,
        "y": 101
      },
      {
        "x": 49,
        "y": 51
      },
      {
        "x": 60,
        "y": 41
      },
      {
        "x": 46,
        "y": 25
      },
      {
        "x": 44,
        "y": 82
      },
      {
        "x": 4,
        "y": 98
      },
      {
        "x": 25,
        "y": 112
      },
      {
        "x": 63,
        "y": 31
      },
      {
        "x": 20,
        "y": 28
      },
      {
        "x": 80,
        "y": 28
      },
      {
        "x": 80,
        "y": 11
      },
      {
        "x": 56,
        "y": 65
      },
      {
        "x": 23,
        "y": 41
      },
      {
        "x": 71,
        "y": 26
      },
      {
        "x": 89,
        "y": 70
      },
      {
        "x": 46,
        "y": 94
      },
      {
        "x": 74,
        "y": 85
      },
      {
        "x": 100,
        "y": 23
      },
      {
        "x": 97,
        "y": 52
      },
      {
        "x": 77,
        "y": 108
      },
      {
        "x": 69,
        "y": 49
      },
      {
        "x": 72,
        "y": 74
      },
      {
        "x": 34,
        "y": 47
      },
      {
        "x": 15,
        "y": 24
      },
      {
        "x": 52,
        "y": 20
      },
      {
        "x": 20,
        "y": 75
      }
    ]
  },
  {
    "id": "group B",
    "data": [
      {
        "x": 5,
        "y": 95
      },
      {
        "x": 90,
        "y": 14
      },
      {
        "x": 53,
        "y": 11
      },
      {
        "x": 82,
        "y": 74
      },
      {
        "x": 56,
        "y": 111
      },
      {
        "x": 35,
        "y": 49
      },
      {
        "x": 14,
        "y": 34
      },
      {
        "x": 24,
        "y": 116
      },
      {
        "x": 93,
        "y": 39
      },
      {
        "x": 44,
        "y": 91
      },
      {
        "x": 17,
        "y": 109
      },
      {
        "x": 6,
        "y": 113
      },
      {
        "x": 40,
        "y": 84
      },
      {
        "x": 62,
        "y": 3
      },
      {
        "x": 73,
        "y": 14
      },
      {
        "x": 36,
        "y": 13
      },
      {
        "x": 53,
        "y": 40
      },
      {
        "x": 54,
        "y": 56
      },
      {
        "x": 67,
        "y": 59
      },
      {
        "x": 39,
        "y": 0
      },
      {
        "x": 77,
        "y": 44
      },
      {
        "x": 80,
        "y": 55
      },
      {
        "x": 35,
        "y": 114
      },
      {
        "x": 23,
        "y": 30
      },
      {
        "x": 19,
        "y": 65
      },
      {
        "x": 93,
        "y": 44
      },
      {
        "x": 24,
        "y": 109
      },
      {
        "x": 78,
        "y": 93
      },
      {
        "x": 35,
        "y": 94
      },
      {
        "x": 36,
        "y": 81
      },
      {
        "x": 1,
        "y": 69
      },
      {
        "x": 0,
        "y": 1
      },
      {
        "x": 16,
        "y": 55
      },
      {
        "x": 71,
        "y": 45
      },
      {
        "x": 77,
        "y": 57
      },
      {
        "x": 6,
        "y": 77
      },
      {
        "x": 47,
        "y": 66
      },
      {
        "x": 25,
        "y": 77
      },
      {
        "x": 32,
        "y": 69
      },
      {
        "x": 7,
        "y": 108
      },
      {
        "x": 74,
        "y": 20
      },
      {
        "x": 99,
        "y": 23
      },
      {
        "x": 100,
        "y": 92
      },
      {
        "x": 62,
        "y": 111
      },
      {
        "x": 79,
        "y": 17
      },
      {
        "x": 88,
        "y": 55
      },
      {
        "x": 65,
        "y": 46
      },
      {
        "x": 34,
        "y": 75
      },
      {
        "x": 78,
        "y": 24
      },
      {
        "x": 27,
        "y": 84
      }
    ]
  },
  {
    "id": "group C",
    "data": [
      {
        "x": 16,
        "y": 56
      },
      {
        "x": 6,
        "y": 29
      },
      {
        "x": 30,
        "y": 83
      },
      {
        "x": 30,
        "y": 84
      },
      {
        "x": 37,
        "y": 47
      },
      {
        "x": 43,
        "y": 85
      },
      {
        "x": 36,
        "y": 6
      },
      {
        "x": 12,
        "y": 75
      },
      {
        "x": 15,
        "y": 29
      },
      {
        "x": 83,
        "y": 78
      },
      {
        "x": 10,
        "y": 75
      },
      {
        "x": 68,
        "y": 63
      },
      {
        "x": 26,
        "y": 80
      },
      {
        "x": 84,
        "y": 51
      },
      {
        "x": 29,
        "y": 57
      },
      {
        "x": 15,
        "y": 75
      },
      {
        "x": 69,
        "y": 79
      },
      {
        "x": 78,
        "y": 27
      },
      {
        "x": 12,
        "y": 88
      },
      {
        "x": 88,
        "y": 59
      },
      {
        "x": 19,
        "y": 24
      },
      {
        "x": 15,
        "y": 106
      },
      {
        "x": 43,
        "y": 46
      },
      {
        "x": 97,
        "y": 11
      },
      {
        "x": 96,
        "y": 3
      },
      {
        "x": 0,
        "y": 30
      },
      {
        "x": 83,
        "y": 112
      },
      {
        "x": 97,
        "y": 29
      },
      {
        "x": 37,
        "y": 8
      },
      {
        "x": 55,
        "y": 117
      },
      {
        "x": 74,
        "y": 81
      },
      {
        "x": 61,
        "y": 66
      },
      {
        "x": 72,
        "y": 56
      },
      {
        "x": 48,
        "y": 60
      },
      {
        "x": 66,
        "y": 7
      },
      {
        "x": 35,
        "y": 18
      },
      {
        "x": 97,
        "y": 66
      },
      {
        "x": 35,
        "y": 69
      },
      {
        "x": 33,
        "y": 93
      },
      {
        "x": 51,
        "y": 99
      },
      {
        "x": 99,
        "y": 22
      },
      {
        "x": 11,
        "y": 83
      },
      {
        "x": 96,
        "y": 69
      },
      {
        "x": 61,
        "y": 23
      },
      {
        "x": 88,
        "y": 87
      },
      {
        "x": 72,
        "y": 71
      },
      {
        "x": 92,
        "y": 42
      },
      {
        "x": 89,
        "y": 11
      },
      {
        "x": 4,
        "y": 108
      },
      {
        "x": 43,
        "y": 45
      }
    ]
  },
  {
    "id": "group D",
    "data": [
      {
        "x": 59,
        "y": 92
      },
      {
        "x": 61,
        "y": 108
      },
      {
        "x": 86,
        "y": 9
      },
      {
        "x": 86,
        "y": 81
      },
      {
        "x": 39,
        "y": 66
      },
      {
        "x": 99,
        "y": 118
      },
      {
        "x": 43,
        "y": 92
      },
      {
        "x": 91,
        "y": 85
      },
      {
        "x": 33,
        "y": 81
      },
      {
        "x": 5,
        "y": 111
      },
      {
        "x": 35,
        "y": 6
      },
      {
        "x": 4,
        "y": 12
      },
      {
        "x": 19,
        "y": 8
      },
      {
        "x": 60,
        "y": 67
      },
      {
        "x": 86,
        "y": 89
      },
      {
        "x": 6,
        "y": 95
      },
      {
        "x": 43,
        "y": 113
      },
      {
        "x": 75,
        "y": 47
      },
      {
        "x": 87,
        "y": 115
      },
      {
        "x": 97,
        "y": 70
      },
      {
        "x": 68,
        "y": 47
      },
      {
        "x": 91,
        "y": 70
      },
      {
        "x": 89,
        "y": 6
      },
      {
        "x": 8,
        "y": 40
      },
      {
        "x": 4,
        "y": 101
      },
      {
        "x": 100,
        "y": 83
      },
      {
        "x": 89,
        "y": 32
      },
      {
        "x": 84,
        "y": 15
      },
      {
        "x": 15,
        "y": 106
      },
      {
        "x": 26,
        "y": 36
      },
      {
        "x": 75,
        "y": 117
      },
      {
        "x": 83,
        "y": 112
      },
      {
        "x": 83,
        "y": 40
      },
      {
        "x": 60,
        "y": 50
      },
      {
        "x": 15,
        "y": 87
      },
      {
        "x": 89,
        "y": 33
      },
      {
        "x": 45,
        "y": 87
      },
      {
        "x": 67,
        "y": 39
      },
      {
        "x": 63,
        "y": 43
      },
      {
        "x": 16,
        "y": 45
      },
      {
        "x": 65,
        "y": 38
      },
      {
        "x": 0,
        "y": 87
      },
      {
        "x": 73,
        "y": 15
      },
      {
        "x": 11,
        "y": 114
      },
      {
        "x": 17,
        "y": 21
      },
      {
        "x": 45,
        "y": 120
      },
      {
        "x": 87,
        "y": 62
      },
      {
        "x": 43,
        "y": 9
      },
      {
        "x": 32,
        "y": 92
      },
      {
        "x": 52,
        "y": 114
      }
    ]
  },
  {
    "id": "group E",
    "data": [
      {
        "x": 86,
        "y": 79
      },
      {
        "x": 80,
        "y": 110
      },
      {
        "x": 29,
        "y": 76
      },
      {
        "x": 29,
        "y": 11
      },
      {
        "x": 4,
        "y": 61
      },
      {
        "x": 80,
        "y": 63
      },
      {
        "x": 97,
        "y": 63
      },
      {
        "x": 9,
        "y": 94
      },
      {
        "x": 22,
        "y": 69
      },
      {
        "x": 1,
        "y": 50
      },
      {
        "x": 57,
        "y": 98
      },
      {
        "x": 12,
        "y": 10
      },
      {
        "x": 54,
        "y": 115
      },
      {
        "x": 42,
        "y": 24
      },
      {
        "x": 24,
        "y": 0
      },
      {
        "x": 20,
        "y": 46
      },
      {
        "x": 2,
        "y": 86
      },
      {
        "x": 55,
        "y": 68
      },
      {
        "x": 8,
        "y": 30
      },
      {
        "x": 9,
        "y": 62
      },
      {
        "x": 30,
        "y": 84
      },
      {
        "x": 31,
        "y": 79
      },
      {
        "x": 93,
        "y": 101
      },
      {
        "x": 30,
        "y": 61
      },
      {
        "x": 68,
        "y": 104
      },
      {
        "x": 75,
        "y": 93
      },
      {
        "x": 51,
        "y": 92
      },
      {
        "x": 0,
        "y": 103
      },
      {
        "x": 99,
        "y": 118
      },
      {
        "x": 75,
        "y": 29
      },
      {
        "x": 36,
        "y": 82
      },
      {
        "x": 96,
        "y": 33
      },
      {
        "x": 76,
        "y": 37
      },
      {
        "x": 63,
        "y": 10
      },
      {
        "x": 83,
        "y": 91
      },
      {
        "x": 61,
        "y": 77
      },
      {
        "x": 45,
        "y": 10
      },
      {
        "x": 20,
        "y": 44
      },
      {
        "x": 31,
        "y": 91
      },
      {
        "x": 92,
        "y": 0
      },
      {
        "x": 85,
        "y": 50
      },
      {
        "x": 12,
        "y": 38
      },
      {
        "x": 6,
        "y": 95
      },
      {
        "x": 38,
        "y": 47
      },
      {
        "x": 94,
        "y": 73
      },
      {
        "x": 55,
        "y": 109
      },
      {
        "x": 56,
        "y": 77
      },
      {
        "x": 67,
        "y": 90
      },
      {
        "x": 42,
        "y": 102
      },
      {
        "x": 31,
        "y": 2
      }
    ]
  }
]

// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.
const ScatterChart = ({ data, height, title, subtitle }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [chartsTheme, chartsEmotionColors] = ChartsTheme()

  const Scatter = () => {
    return (
      <ResponsiveScatterPlot
          data={data}
          // colors={chartsEmotionColors}
          theme={chartsTheme}
          margin={{ top: 20, right: 140, bottom: 60, left: 90 }}
          xScale={{ type: 'linear', min: -1, max: 'auto' }}
          xFormat=">-.2f"
          yScale={{ type: 'linear', min: -1, max: 1 }}
          yFormat=">-.2f"
          colors={{ scheme: 'nivo' }}
          nodeSize={10}
          axisTop={null}
          axisRight={null}
          axisBottom={{
              orient: 'bottom',
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'valence',
              legendPosition: 'middle',
              legendOffset: 46
          }}
          axisLeft={{
              orient: 'left',
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'arousal',
              legendPosition: 'middle',
              legendOffset: -60
          }}
          legends={[
              {
                  anchor: 'right',
                  direction: 'column',
                  justify: false,
                  translateX: 130,
                  translateY: 0,
                  itemWidth: 100,
                  itemHeight: 12,
                  itemsSpacing: 5,
                  itemDirection: 'left-to-right',
                  symbolSize: 12,
                  symbolShape: 'circle',
                  effects: [
                      {
                          on: 'hover',
                          style: {
                              itemOpacity: 1
                          }
                      }
                  ]
              }
          ]}
      />
    )
  }


  return (
    <Paper variant="outlined" sx={{backgroundColor: colors.greenAccent[800], p: 2, borderRadius: "6px"}} m="20px">
      <Header title={title} subtitle={subtitle}></Header>
      <Box height={height}>
        <Scatter />
      </Box>
    </Paper>
  )
}

export default ScatterChart;
