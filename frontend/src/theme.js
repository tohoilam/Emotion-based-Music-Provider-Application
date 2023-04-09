import { createTheme } from '@mui/material/styles';
import { createContext, useState, useMemo } from 'react';

export const tokens = (mode) => ({
  ...(mode === 'dark')
    ? {
      grey: {
        100: "#e0e0e0",
        200: "#c2c2c2",
        300: "#a3a3a3",
        400: "#858585",
        500: "#666666",
        600: "#525252",
        700: "#3d3d3d",
        800: "#292929",
        900: "#141414"
      },
      primary: {
        // 100: "#d0d1d5",
        // 200: "#a1a4ab",
        // 300: "#727681",
        // 400: "#434957",
        // 500: "#141b2d",
        // 600: "#101624",
        // 700: "#0c101b",
        // 800: "#080b12",
        // 900: "#040509"
        100: "#cceef0",
        200: "#99dce0",
        300: "#66cbd1",
        400: "#33b9c1",
        500: "#00a8b2",
        600: "#00868e",
        700: "#00656b",
        800: "#004347",
        900: "#002224"
      },
      greenAccent: {
        // 100: "#dbf5ee",
        // 200: "#b7ebde",
        // 300: "#94e2cd",
        // 400: "#70d8bd",
        // 500: "#4cceac",
        // 600: "#3da58a",
        // 700: "#2e7c67",
        // 800: "#1e5245",
        // 900: "#0f2922"
        100: "#e2e3f0",
        200: "#c5c7e1",
        300: "#a9abd3",
        400: "#8c8fc4",
        500: "#6f73b5",
        600: "#595c91",
        700: "#43456d",
        800: "#2c2e48",
        900: "#161724"
      },
      redAccent: {
        100: "#f8dcdb",
        200: "#f1b9b7",
        300: "#e99592",
        400: "#e2726e",
        500: "#db4f4a",
        600: "#af3f3b",
        700: "#832f2c",
        800: "#58201e",
        900: "#2c100f"
      },
      blueAccent: {
        100: "#e1e2fe",
        200: "#c3c6fd",
        300: "#a4a9fc",
        400: "#868dfb",
        500: "#6870fa",
        600: "#535ac8",
        700: "#3e4396",
        800: "#2a2d64",
        900: "#151632"
      },
      // Yellow and Orange
      yellowAccent: {
        100: "#fdf6d6",
        200: "#fbedae",
        300: "#f8e385",
        400: "#f6da5d",
        500: "#f4d134",
        600: "#c3a72a",
        700: "#927d1f",
        800: "#625415",
        900: "#312a0a"
      },
      orangeAccent: {
        100: "#ffead7",
        200: "#ffd5af",
        300: "#ffc086",
        400: "#ffab5e",
        500: "#ff9636",
        600: "#cc782b",
        700: "#995a20",
        800: "#663c16",
        900: "#331e0b"
      },
      purpleBlueAccent: {
        100: "#e0e0ed",
        200: "#c1c1db",
        300: "#a2a2ca",
        400: "#8383b8",
        500: "#6464a6",
        600: "#505085",
        700: "#3c3c64",
        800: "#282842",
        900: "#141421"
      },
      pinkAccent: {
        100: "#fed8e6",
        200: "#fdb1cd",
        300: "#fc89b3",
        400: "#fb629a",
        500: "#fa3b81",
        600: "#c82f67",
        700: "#96234d",
        800: "#641834",
        900: "#320c1a"
      },
      purplePinkAccent: {
        100: "#fadaf1",
        200: "#f4b4e3",
        300: "#ef8fd5",
        400: "#e969c7",
        500: "#e444b9",
        600: "#b63694",
        700: "#89296f",
        800: "#5b1b4a",
        900: "#2e0e25"
      },

      emotion: {
        Anger: "hsl(2, 70%, 55%)",
        Happiness: "hsl(60, 60%, 53%)",
        Calmness: "hsl(129, 60%, 53%)",
        Sadness: "hsl(186, 60%, 53%)"
      },
      background: {
        paper: "rgb(16, 22, 26, 0.5)"
      }
    }
    : {
      grey: {
        100: "#141414",
        200: "#292929",
        300: "#3d3d3d",
        400: "#525252",
        500: "#666666",
        600: "#858585",
        700: "#a3a3a3",
        800: "#c2c2c2",
        900: "#e0e0e0",
      },
      primary: {
        100: "#040509",
        200: "#080b12",
        300: "#0c101b",
        400: "#f2f0f0",
        500: "#141b2d",
        600: "#434957",
        700: "#727681",
        800: "#a1a4ab",
        900: "#d0d1d5",
      },
      greenAccent: {
        100: "#0f2922",
        200: "#1e5245",
        300: "#2e7c67",
        400: "#3da58a",
        500: "#4cceac",
        600: "#70d8bd",
        700: "#94e2cd",
        800: "#b7ebde",
        900: "#dbf5ee",
      },
      redAccent: {
        100: "#2c100f",
        200: "#58201e",
        300: "#832f2c",
        400: "#af3f3b",
        500: "#db4f4a",
        600: "#e2726e",
        700: "#e99592",
        800: "#f1b9b7",
        900: "#f8dcdb",
      },
      blueAccent: {
        100: "#151632",
        200: "#2a2d64",
        300: "#3e4396",
        400: "#535ac8",
        500: "#6870fa",
        600: "#868dfb",
        700: "#a4a9fc",
        800: "#c3c6fd",
        900: "#e1e2fe",
      },
      emotion: {
        'Anger': "hsl(2, 50%, 53%)",
        Happiness: "hsl(60, 50%, 53%)",
        Calmness: "hsl(129, 50%, 53%)",
        Sadness: "hsl(186, 50%, 53%)"
      }
    }
})

export const themeSettings = (mode) => {
  const colors = tokens(mode);

  return {
    palette: {
      mode: mode,
      ...(mode === 'dark')
        ? {
          primary: {
            main: colors.primary[400],
          },
          secondary: {
            main: colors.greenAccent[600],
          },
          neutral: {
            dark: colors.grey[700],
            main: colors.grey[500],
            light: colors.grey[100]
          },
          background: {
            default: colors.primary[500],
            paper: colors.background.paper
          }
        }
        : {
          primary: {
            main: colors.primary[100],
          },
          secondary: {
            main: colors.greenAccent[500],
          },
          neutral: {
            dark: colors.grey[700],
            main: colors.grey[500],
            light: colors.grey[100]
          },
          background: {
            default: "#fcfcfc"
          }
        }
    },
    typography: {
      fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
      h1: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: "3rem",
        fontWeight: 600,
        color: "rgb(160, 252, 221)"
      },
      h2: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: "1.75rem",
        fontWeight: 600
      },
      h3: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: "1.5rem",
        fontWeight: 600
      },
      h4: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: "1.35rem",
        fontWeight: 400
      },
      h5: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: "1.2rem",
        fontWeight: 400
      }
    },
    components: {
      MuiAccordionSummary: {
        styleOverrides: {
          content: {
            margin: 0
          },
          root: {
            height: "100%",
            minHeight: 0
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderTopLeftRadius: "6px",
            borderTopRightRadius: "6px",
            borderBottomLeftRadius: "6px",
            borderBottomRightRadius: "6px",
            backgroundColor: colors.purpleBlueAccent[900]
          }
        }
      },
      // MuiTabs: {
  
      //   styleOverrides: {
      //     indicator: {backgroundColor: "red !important"},
      //   },
      // },
      MuiButton: {
        styleOverrides: {
          root: {
            fontSize: "0.95rem",
            fontWeight: 500,
            color: "white",
            background: `linear-gradient(90deg, ${colors.primary[500]}, ${colors.greenAccent[500]})`,
            ':hover': {
              background: `linear-gradient(90deg, ${colors.primary[400]}, ${colors.greenAccent[400]})`,
            },
          }
        }
      }
    
    }
  }
}

export const ColorModeContext = createContext({
  toggleColorMode: () => {}
});

export const useMode = () => {
  const [mode, setMode] = useState("dark")

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () =>
      setMode((prev) => (prev === "light" ? "dark": "light"))
    })
  )

  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode])

  return [theme, colorMode];
}

// Grey #666666
// Primary Dark Blue #141b2d
// Green Accent #4cceac
// Red Accent #db4f4a
// Blue Accent #6870fa