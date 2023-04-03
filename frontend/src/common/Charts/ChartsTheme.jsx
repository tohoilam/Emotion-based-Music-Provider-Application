import { useTheme } from '@mui/material';
import { tokens } from '../../theme';

const ChartsTheme = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const chartsEmotionColors = [colors.emotion['Anger'], colors.emotion['Calmness'], colors.emotion['Happiness'], colors.emotion['Sadness']];


  const chartsTheme = {
    axis: {
      domain: {
        line: {
          stroke: colors.grey[200]
        }
      },
      legend: {
        text: {
          fill: colors.grey[200]
        }
      },
      ticks: {
        line: {
          stroke: colors.grey[500],
          strokeWidth: 1
        },
        text: {
          fill: colors.grey[200]
        }
      }
    },
    legends: {
      text: {
        fill: colors.grey[100]
      }
    },
    tooltip: {
      container: {
        background: colors.grey[900],
      }
    },
    grid: {
      line: {
        stroke: colors.grey[500]
      }
    }
  }

  return [chartsTheme, chartsEmotionColors];
}

export default ChartsTheme;