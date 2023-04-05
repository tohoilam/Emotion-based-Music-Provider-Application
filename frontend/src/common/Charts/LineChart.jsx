import { Box } from '@mui/material';
import { ResponsiveLine } from '@nivo/line'
import Header from '../Header';
import ChartsTheme from './ChartsTheme';

const mockData = [
  {
    "id": "Anger",
    "color": "hsl(111, 70%, 50%)",
    "data": [
      {
        "x": "section 1",
        "y": 51
      },
      {
        "x": "section 2",
        "y": 112
      },
      {
        "x": "section 3",
        "y": 95
      },
      {
        "x": "section 4",
        "y": 245
      },
      {
        "x": "section 5",
        "y": 279
      },
    ]
  },
  {
    "id": "Calmness",
    "color": "hsl(34, 70%, 50%)",
    "data": [
      {
        "x": "section 1",
        "y": 277
      },
      {
        "x": "section 2",
        "y": 119
      },
      {
        "x": "section 3",
        "y": 280
      },
      {
        "x": "section 4",
        "y": 96
      },
      {
        "x": "section 5",
        "y": 120
      },
    ]
  },
  {
    "id": "Happiness",
    "color": "hsl(135, 70%, 50%)",
    "data": [
      {
        "x": "section 1",
        "y": 92
      },
      {
        "x": "section 2",
        "y": 143
      },
      {
        "x": "section 3",
        "y": 33
      },
      {
        "x": "section 4",
        "y": 119
      },
      {
        "x": "section 5",
        "y": 157
      },
    ]
  },
  {
    "id": "Sadness",
    "color": "hsl(337, 70%, 50%)",
    "data": [
      {
        "x": "section 1",
        "y": 225
      },
      {
        "x": "section 2",
        "y": 292
      },
      {
        "x": "section 3",
        "y": 68
      },
      {
        "x": "section 4",
        "y": 122
      },
      {
        "x": "section 5",
        "y": 5
      },
    ]
  },
  // {
  //   "id": "norway",
  //   "color": "hsl(107, 70%, 50%)",
  //   "data": [
  //     {
  //       "x": "section 1",
  //       "y": 8
  //     },
  //     {
  //       "x": "section 2",
  //       "y": 8
  //     },
  //     {
  //       "x": "section 3",
  //       "y": 155
  //     },
  //     {
  //       "x": "section 4",
  //       "y": 198
  //     },
  //     {
  //       "x": "section 5",
  //       "y": 283
  //     },
  //   ]
  // }
];

// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.
const LineChart = ({ data }) => {
  const [chartsTheme, chartsEmotionColors] = ChartsTheme()

  const Line = () => {
    return (
      <ResponsiveLine
        data={mockData}
        colors={chartsEmotionColors}
        theme={chartsTheme}
        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
        xScale={{ type: 'point' }}
        yScale={{
            type: 'linear',
            min: 'auto',
            max: 'auto',
            stacked: true,
            reverse: false
        }}
        yFormat=" >-.2f"
        curve="natural"
        axisTop={null}
        axisRight={null}
        axisBottom={{
            orient: 'bottom',
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'transportation',
            legendOffset: 36,
            legendPosition: 'middle'
        }}
        axisLeft={{
            orient: 'left',
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'count',
            legendOffset: -40,
            legendPosition: 'middle'
        }}
        pointColor={{ theme: 'background' }}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor' }}
        pointLabelYOffset={-12}
        useMesh={true}
        legends={[
            {
                anchor: 'bottom-right',
                direction: 'column',
                justify: false,
                translateX: 100,
                translateY: 0,
                itemsSpacing: 0,
                itemDirection: 'left-to-right',
                itemWidth: 80,
                itemHeight: 20,
                itemOpacity: 0.75,
                symbolSize: 12,
                symbolShape: 'circle',
                symbolBorderColor: 'rgba(0, 0, 0, .5)',
                effects: [
                    {
                        on: 'hover',
                        style: {
                            itemBackground: 'rgba(0, 0, 0, .03)',
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
    <Box m="20px">
      <Header title="TESTING" subtitle="lololololololol"></Header>
      <Box height="400px">
        <Line />
      </Box>
    </Box>
  )
}

export default LineChart;
