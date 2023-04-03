import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { createTheme, CssBaseline, ThemeProvider, typography } from '@mui/material';

const root = ReactDOM.createRoot(document.getElementById('root'));

const theme = createTheme({
  palette: {
    primary: {
      main: "rgb(160, 252, 221)"
    },
    secondary: {
      main: "rgb(50, 51, 67)"
    }
  },
  typography: {
    allVariants: {
      color: "#f3e5f5"
    },
    h1: {
      fontSize: "3rem",
      fontWeight: 600,
      color: "rgb(160, 252, 221)"
    },
    h2: {
      fontSize: "1.75rem",
      fontWeight: 600
    },
    h3: {
      fontSize: "1.5rem",
      fontWeight: 600
    },
    h4: {
      fontSize: "1.35rem",
      fontWeight: 400
    },
    h5: {
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
          borderTopLeftRadius: "12px",
          borderTopRightRadius: "12px",
          borderBottomLeftRadius: "12px",
          borderBottomRightRadius: "12px"
        }
      }
    }
  }

})

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
