import { Box, Paper, useTheme } from '@mui/material';
import { ResponsivePie } from '@nivo/pie';
import { tokens } from '../../theme';
import Header from '../Header';
import ChartsTheme from './ChartsTheme';

const mockData = [
  {
    "id": "Anger",
    "label": "Anger",
    "value": 0.4,
    "color": "#E61E1E"
  },
  {
    "id": "Calmness",
    "label": "Calmness",
    "value": 0.2,
    "color": "#EBE300"
  },
  {
    "id": "Happiness",
    "label": "Happiness",
    "value": 0.3,
    "color": "#00EB46"
  },
  {
    "id": "Sadness",
    "label": "Sadness",
    "value": 0.1,
    "color": "#0093E9"
  },
];


// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.
const DonutChart = ({data, height, title, subtitle}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [chartsTheme, chartsEmotionColors] = ChartsTheme();

  const Donut = () => {
    return (
      <ResponsivePie
      data={data}
      colors={chartsEmotionColors}
      theme={chartsTheme}
      margin={{ top: 20, right: 80, bottom: 60, left: 80 }}
      innerRadius={0.6}
      padAngle={1.5}
      cornerRadius={2.5}
      activeOuterRadiusOffset={8}
      borderWidth={1}
      borderColor={{
        from: 'color',
        modifiers: [
          [
            'darker',
            0.2
          ]
        ]
      }}
      arcLinkLabelsSkipAngle={10}
      arcLinkLabelsTextColor={colors.grey[100]}
      arcLinkLabelsThickness={1}
      arcLinkLabelsColor={{ from: 'color' }}
      arcLabelsSkipAngle={20}
      arcLinkLabelsDiagonalLength={6}
      arcLinkLabelsStraightLength={6}
      enableArcLinkLabels={false}
      arcLabelsTextColor={{
        from: 'color',
        modifiers: [
          [
            'brighter',
            3
          ]
        ]
      }}
      defs={[
        {
          id: 'dots',
          type: 'patternDots',
          background: 'inherit',
          color: 'rgba(255, 255, 255, 0.3)',
          size: 4,
          padding: 1,
          stagger: true
        },
        {
          id: 'lines',
          type: 'patternLines',
          background: 'inherit',
          color: 'rgba(255, 255, 255, 0.3)',
          rotation: -45,
          lineWidth: 6,
          spacing: 10
        }
      ]}
      fill={[
        {
          match: {
            id: 'ruby'
          },
          id: 'dots'
        },
        {
          match: {
            id: 'c'
          },
          id: 'dots'
        },
        {
          match: {
            id: 'go'
          },
          id: 'dots'
        },
        {
          match: {
            id: 'python'
          },
          id: 'dots'
        },
        {
          match: {
            id: 'scala'
          },
          id: 'lines'
        },
        {
          match: {
            id: 'lisp'
          },
          id: 'lines'
        },
        {
          match: {
            id: 'elixir'
          },
          id: 'lines'
        },
        {
          match: {
            id: 'javascript'
          },
          id: 'lines'
        }
      ]}
      legends={[
        {
          anchor: 'bottom',
          direction: 'row',
          justify: false,
          translateX: 0,
          translateY: 30,
          itemsSpacing: 0,
          itemWidth: 68,
          itemHeight: 18,
          itemTextColor: colors.grey[100],
          itemDirection: 'top-to-bottom',
          itemOpacity: 1,
          symbolSize: 17,
          symbolShape: 'circle',
          effects: [
            {
              on: 'hover',
              style: {
                itemTextColor: '#fff'
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
        backgroundColor: colors.primary[900],
        p: 2,
        borderRadius: "6px",
        background: `linear-gradient(45deg, ${colors.primary[700]}, ${colors.purplePinkAccent[800]})`
      }}
      m="20px"
    >
      <Header title={title} subtitle={subtitle}></Header>
      <Box height={height}>
        <Donut />
      </Box>
    </Paper>
  )
}
    
export default DonutChart;
    