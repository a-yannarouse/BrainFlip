'use client';

import React, { useState, useEffect } from 'react';
import { SignIn } from "@clerk/nextjs";
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  ThemeProvider, 
  createTheme,
  useMediaQuery,
  CssBaseline,
  IconButton,
  Fade
} from '@mui/material';

import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import BrainIcon from '@mui/icons-material/Psychology';
import { useRouter } from "next/navigation";

const theme = createTheme({
    palette: {
        primary: {
        main: '#4a90e2',
        },
        secondary: {
        main: '#f6546a',
        },
        background: {
        default: '#f0f4f8',
        },
    },
    typography: {
        fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    },
});

const BrainFlipAnimation = () => {
    const [flip, setFlip] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setFlip(prev => !prev);
        }, 2000);

    return () => clearInterval(interval);
    }, []);

    return (
        <Box sx={{ perspective: '1000px', mb: 4 }}>
            <Fade in={flip} timeout={1000}>
            <BrainIcon 
                sx={{ 
                fontSize: '5rem', 
                color: theme.palette.primary.main,
                transform: flip ? 'rotateY(180deg)' : 'rotateY(0deg)',
                transition: 'transform 1s',
                }} 
            />
            </Fade>
        </Box>
    );
};

export default function SignInPage() {
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const router = useRouter();
    const back = () => {
        router.push('/');
    }

return (
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
            sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(135deg, #4a90e2 0%, #f6546a 100%)',
            position: 'relative',
            overflow: 'hidden',
            }}
        >
        {/* Animated background elements */}
        {[...Array(10)].map((_, i) => (
            <Box
                key={i}
                sx={{
                    position: 'absolute',
                    width: '20px',
                    height: '20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    borderRadius: '50%',
                    animation: `float ${Math.random() * 10 + 5}s infinite ease-in-out`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    }}
                />
        ))}

        <Box sx={{mt: 3, ml: 3, zIndex: 1}}>
            <IconButton onClick={back} sx={{ color: 'white' }}>
                <ArrowBackIosIcon fontSize='medium' />
            </IconButton>        
        </Box>

        <Container component="main" maxWidth="sm" sx={{ zIndex: 1 }}>
            <Box
                sx={{
                    marginTop: 8,
                    marginBottom: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
            <Paper 
                elevation={3} 
                sx={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    p: 4, 
                    width: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: '15px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                }}
            >
            <BrainFlipAnimation />
            <Typography component="h1" variant="h4" sx={{ color: theme.palette.primary.main, mb: 4, fontWeight: 700 }}>
                Welcome to Brain Flip
            </Typography>
            <SignIn
                appearance={{
                    elements: {
                        formButtonPrimary: 
                        'bg-gradient-to-r from-[#4a90e2] to-[#f6546a] hover:from-[#f6546a] hover:to-[#4a90e2] text-sm normal-case',
                        card: 'shadow-none bg-transparent',
                        headerTitle: 'hidden',
                        headerSubtitle: 'hidden',
                        socialButtonsBlockButton: 
                        'border-2 border-[#4a90e2] text-[#4a90e2] hover:bg-[#4a90e2] hover:text-white',
                        formFieldInput: 
                        'border-2 border-[#4a90e2] focus:border-[#f6546a] focus:ring-[#f6546a] bg-white text-gray-900',
                        footerActionLink: 'text-[#4a90e2] hover:text-[#f6546a]',
                        formFieldLabel: 'text-[#4a90e2]',
                        dividerLine: 'bg-[#4a90e2]',
                        dividerText: 'text-[#4a90e2]',
                    },
                    layout: {
                        socialButtonsPlacement: isMobile ? 'bottom' : 'top',
                        socialButtonsVariant: 'iconButton',
                    },
                }}
            />
            </Paper>
            </Box>
        </Container>
        </Box>
            <style jsx global>
                {`
                    @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                    }
                `}
            </style>
    </ThemeProvider>
    );
}