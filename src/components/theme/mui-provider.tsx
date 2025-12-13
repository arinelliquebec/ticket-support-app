"use client";

import { ThemeProvider, createTheme, alpha } from "@mui/material/styles";
import { ReactNode, useState, useEffect } from "react";

// Criar tema customizado que combina com as cores existentes
const futuristicTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "hsl(195, 85%, 50%)", // Cyan/Sky blue
      light: "hsl(195, 85%, 65%)",
      dark: "hsl(195, 85%, 35%)",
      contrastText: "hsl(222, 28%, 8%)",
    },
    secondary: {
      main: "hsl(220, 20%, 16%)",
      light: "hsl(220, 20%, 25%)",
      dark: "hsl(220, 20%, 10%)",
      contrastText: "hsl(210, 15%, 95%)",
    },
    background: {
      default: "hsl(222, 28%, 8%)",
      paper: "hsl(222, 25%, 10%)",
    },
    text: {
      primary: "hsl(210, 15%, 95%)",
      secondary: "hsl(215, 12%, 60%)",
    },
    error: {
      main: "hsl(0, 65%, 50%)",
    },
    success: {
      main: "hsl(142, 70%, 45%)",
    },
    warning: {
      main: "hsl(38, 92%, 50%)",
    },
    info: {
      main: "hsl(195, 85%, 50%)",
    },
    divider: alpha("hsl(195, 85%, 50%)", 0.12),
  },
  typography: {
    fontFamily: "'Space Grotesk', system-ui, sans-serif",
    h1: {
      fontFamily: "'Orbitron', system-ui, sans-serif",
      fontWeight: 700,
      letterSpacing: "0.02em",
    },
    h2: {
      fontFamily: "'Orbitron', system-ui, sans-serif",
      fontWeight: 600,
      letterSpacing: "0.02em",
    },
    h3: {
      fontFamily: "'Orbitron', system-ui, sans-serif",
      fontWeight: 600,
      letterSpacing: "0.015em",
    },
    h4: {
      fontFamily: "'Orbitron', system-ui, sans-serif",
      fontWeight: 500,
    },
    h5: {
      fontFamily: "'Orbitron', system-ui, sans-serif",
      fontWeight: 500,
    },
    h6: {
      fontFamily: "'Orbitron', system-ui, sans-serif",
      fontWeight: 500,
    },
    button: {
      textTransform: "none" as const,
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "0.75rem",
          padding: "10px 24px",
          fontSize: "0.875rem",
          fontWeight: 500,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          position: "relative" as const,
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: "-100%",
            width: "100%",
            height: "100%",
            background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent)",
            transition: "left 0.5s ease",
          },
          "&:hover::before": {
            left: "100%",
          },
        },
        contained: {
          background: "linear-gradient(135deg, hsl(195, 85%, 50%), hsl(217, 91%, 60%))",
          boxShadow: "0 0 20px rgba(14, 165, 233, 0.3)",
          "&:hover": {
            background: "linear-gradient(135deg, hsl(195, 85%, 55%), hsl(217, 91%, 65%))",
            boxShadow: "0 0 30px rgba(14, 165, 233, 0.5), 0 0 60px rgba(14, 165, 233, 0.2)",
            transform: "translateY(-2px)",
          },
        },
        outlined: {
          borderColor: "rgba(14, 165, 233, 0.3)",
          "&:hover": {
            borderColor: "rgba(14, 165, 233, 0.6)",
            backgroundColor: "rgba(14, 165, 233, 0.1)",
            boxShadow: "0 0 20px rgba(14, 165, 233, 0.2)",
          },
        },
        text: {
          "&:hover": {
            backgroundColor: "rgba(14, 165, 233, 0.1)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: "rgba(14, 20, 33, 0.6)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(14, 165, 233, 0.15)",
          borderRadius: "1rem",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            borderColor: "rgba(14, 165, 233, 0.3)",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3), 0 0 30px rgba(14, 165, 233, 0.1)",
            transform: "translateY(-4px)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        elevation1: {
          background: "rgba(14, 20, 33, 0.6)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(14, 165, 233, 0.1)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "0.75rem",
            background: "rgba(14, 20, 33, 0.5)",
            transition: "all 0.3s ease",
            "& fieldset": {
              borderColor: "rgba(14, 165, 233, 0.2)",
              transition: "border-color 0.3s ease",
            },
            "&:hover fieldset": {
              borderColor: "rgba(14, 165, 233, 0.4)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "rgba(14, 165, 233, 0.6)",
              boxShadow: "0 0 20px rgba(14, 165, 233, 0.15)",
            },
            "&.Mui-focused": {
              background: "rgba(14, 20, 33, 0.7)",
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: "0.5rem",
          fontWeight: 500,
          background: "rgba(14, 165, 233, 0.15)",
          border: "1px solid rgba(14, 165, 233, 0.3)",
          "&:hover": {
            background: "rgba(14, 165, 233, 0.25)",
          },
        },
        colorPrimary: {
          background: "linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(59, 130, 246, 0.2))",
          border: "1px solid rgba(14, 165, 233, 0.4)",
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background: "rgba(14, 20, 33, 0.95)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(14, 165, 233, 0.2)",
          borderRadius: "0.5rem",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(14, 165, 233, 0.1)",
          fontSize: "0.75rem",
          padding: "8px 12px",
        },
        arrow: {
          color: "rgba(14, 20, 33, 0.95)",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: "rgba(14, 20, 33, 0.95)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(14, 165, 233, 0.2)",
          borderRadius: "1rem",
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5), 0 0 40px rgba(14, 165, 233, 0.1)",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: "rgba(14, 20, 33, 0.95)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(14, 165, 233, 0.15)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "rgba(14, 20, 33, 0.8)",
          backdropFilter: "blur(20px) saturate(180%)",
          borderBottom: "1px solid rgba(14, 165, 233, 0.1)",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.2)",
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: "3px 3px 0 0",
          background: "linear-gradient(90deg, hsl(195, 85%, 50%), hsl(217, 91%, 60%))",
          boxShadow: "0 0 10px rgba(14, 165, 233, 0.5)",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          transition: "all 0.3s ease",
          "&.Mui-selected": {
            color: "hsl(195, 85%, 50%)",
          },
          "&:hover": {
            color: "hsl(195, 85%, 60%)",
            backgroundColor: "rgba(14, 165, 233, 0.1)",
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 6,
          backgroundColor: "rgba(14, 165, 233, 0.1)",
        },
        bar: {
          borderRadius: 4,
          background: "linear-gradient(90deg, hsl(195, 85%, 50%), hsl(217, 91%, 60%))",
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: "hsl(195, 85%, 50%)",
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          "& .MuiSwitch-switchBase.Mui-checked": {
            color: "hsl(195, 85%, 50%)",
            "& + .MuiSwitch-track": {
              backgroundColor: "hsl(195, 85%, 50%)",
              opacity: 0.5,
            },
          },
        },
        track: {
          backgroundColor: "rgba(255, 255, 255, 0.2)",
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: "rgba(14, 165, 233, 0.5)",
          "&.Mui-checked": {
            color: "hsl(195, 85%, 50%)",
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: "rgba(14, 165, 233, 0.5)",
          "&.Mui-checked": {
            color: "hsl(195, 85%, 50%)",
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: "0.75rem",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(14, 165, 233, 0.2)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(14, 165, 233, 0.4)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(14, 165, 233, 0.6)",
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          background: "rgba(14, 20, 33, 0.95)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(14, 165, 233, 0.15)",
          borderRadius: "0.75rem",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(14, 165, 233, 0.1)",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: "0.5rem",
          margin: "4px 8px",
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: "rgba(14, 165, 233, 0.15)",
          },
          "&.Mui-selected": {
            backgroundColor: "rgba(14, 165, 233, 0.2)",
            "&:hover": {
              backgroundColor: "rgba(14, 165, 233, 0.25)",
            },
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundColor: "rgba(14, 165, 233, 0.15)",
            boxShadow: "0 0 15px rgba(14, 165, 233, 0.2)",
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          background: "linear-gradient(135deg, hsl(195, 85%, 50%), hsl(217, 91%, 60%))",
          boxShadow: "0 8px 20px rgba(14, 165, 233, 0.4)",
          "&:hover": {
            background: "linear-gradient(135deg, hsl(195, 85%, 55%), hsl(217, 91%, 65%))",
            boxShadow: "0 12px 30px rgba(14, 165, 233, 0.5), 0 0 40px rgba(14, 165, 233, 0.3)",
            transform: "translateY(-2px)",
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: "0.75rem",
          backdropFilter: "blur(12px)",
          border: "1px solid",
        },
        standardInfo: {
          background: "rgba(14, 165, 233, 0.15)",
          borderColor: "rgba(14, 165, 233, 0.3)",
        },
        standardSuccess: {
          background: "rgba(16, 185, 129, 0.15)",
          borderColor: "rgba(16, 185, 129, 0.3)",
        },
        standardWarning: {
          background: "rgba(245, 158, 11, 0.15)",
          borderColor: "rgba(245, 158, 11, 0.3)",
        },
        standardError: {
          background: "rgba(239, 68, 68, 0.15)",
          borderColor: "rgba(239, 68, 68, 0.3)",
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          fontWeight: 600,
          fontSize: "0.65rem",
        },
        colorPrimary: {
          background: "linear-gradient(135deg, hsl(195, 85%, 50%), hsl(217, 91%, 60%))",
          boxShadow: "0 0 10px rgba(14, 165, 233, 0.5)",
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(14, 165, 233, 0.1)",
          "&::after": {
            background: "linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.15), transparent)",
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "rgba(14, 165, 233, 0.15)",
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          border: "2px solid rgba(14, 165, 233, 0.3)",
          boxShadow: "0 0 15px rgba(14, 165, 233, 0.2)",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: "0.5rem",
          margin: "4px 8px",
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: "rgba(14, 165, 233, 0.1)",
          },
          "&.Mui-selected": {
            backgroundColor: "rgba(14, 165, 233, 0.15)",
            borderLeft: "3px solid hsl(195, 85%, 50%)",
            "&:hover": {
              backgroundColor: "rgba(14, 165, 233, 0.2)",
            },
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-root": {
            backgroundColor: "rgba(14, 165, 233, 0.1)",
            fontWeight: 600,
            color: "hsl(195, 85%, 60%)",
            borderBottom: "2px solid rgba(14, 165, 233, 0.2)",
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: "background-color 0.2s ease",
          "&:hover": {
            backgroundColor: "rgba(14, 165, 233, 0.05)",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid rgba(14, 165, 233, 0.1)",
        },
      },
    },
    MuiPagination: {
      styleOverrides: {
        root: {
          "& .MuiPaginationItem-root": {
            borderRadius: "0.5rem",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "rgba(14, 165, 233, 0.15)",
            },
            "&.Mui-selected": {
              background: "linear-gradient(135deg, hsl(195, 85%, 50%), hsl(217, 91%, 60%))",
              color: "white",
              boxShadow: "0 0 15px rgba(14, 165, 233, 0.4)",
            },
          },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          background: "rgba(14, 20, 33, 0.4)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(14, 165, 233, 0.1)",
          borderRadius: "0.75rem !important",
          marginBottom: "8px",
          "&:before": {
            display: "none",
          },
          "&.Mui-expanded": {
            borderColor: "rgba(14, 165, 233, 0.25)",
            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.2)",
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          borderRadius: "0.75rem",
          "&:hover": {
            backgroundColor: "rgba(14, 165, 233, 0.05)",
          },
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: "hsl(195, 85%, 50%)",
        },
        thumb: {
          boxShadow: "0 0 10px rgba(14, 165, 233, 0.5)",
          "&:hover": {
            boxShadow: "0 0 20px rgba(14, 165, 233, 0.7)",
          },
        },
        track: {
          background: "linear-gradient(90deg, hsl(195, 85%, 50%), hsl(217, 91%, 60%))",
        },
        rail: {
          backgroundColor: "rgba(14, 165, 233, 0.2)",
        },
      },
    },
    MuiStepIcon: {
      styleOverrides: {
        root: {
          color: "rgba(14, 165, 233, 0.3)",
          "&.Mui-active": {
            color: "hsl(195, 85%, 50%)",
          },
          "&.Mui-completed": {
            color: "hsl(142, 70%, 45%)",
          },
        },
      },
    },
    MuiStepConnector: {
      styleOverrides: {
        line: {
          borderColor: "rgba(14, 165, 233, 0.2)",
        },
      },
    },
  },
});

interface MuiProviderProps {
  children: ReactNode;
}

export function MuiProvider({ children }: MuiProviderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render children with theme only after mounting to avoid hydration issues
  // The ThemeProvider still wraps everything for context access
  return (
    <ThemeProvider theme={futuristicTheme}>
      {children}
    </ThemeProvider>
  );
}

