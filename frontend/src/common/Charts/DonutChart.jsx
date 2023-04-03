import { Box, useTheme } from '@mui/material';
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
const DonutChart = ({data, title, subtitle}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [chartsTheme, chartsEmotionColors] = ChartsTheme();

  const Donut = () => {
    return (
      <ResponsivePie
      data={data}
      colors={chartsEmotionColors}
      theme={chartsTheme}
      margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
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
      arcLabelsSkipAngle={10}
      arcLabelsTextColor={{
        from: 'color',
        modifiers: [
          [
            'darker',
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
          translateY: 56,
          itemsSpacing: 0,
          itemWidth: 100,
          itemHeight: 18,
          itemTextColor: colors.grey[100],
          itemDirection: 'left-to-right',
          itemOpacity: 1,
          symbolSize: 20,
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
    <Box m="20px">
      <Header title={title} subtitle={subtitle}></Header>
      <Box height="300px">
        <Donut />
      </Box>
    </Box>
  )
}
    
export default DonutChart;
    