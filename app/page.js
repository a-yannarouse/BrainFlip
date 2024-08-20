'use client'
import Image from "next/image";
import { useUser } from '@clerk/nextjs';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Container, Typography, AppBar, Toolbar, Button, Box, Grid, ThemeProvider, createTheme, Paper, 
  Stack, IconButton } from "@mui/material";
import Head from 'next/head';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailIcon from '@mui/icons-material/Email';
import { motion } from "framer-motion";
import { useRouter } from 'next/navigation';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4a90e2', // Bright blue
    },
    secondary: {
      main: '#f6546a', // Coral pink
    },
    background: {
      default: '#f0f4f8', // Light grayish blue
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '4rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '3rem',
      fontWeight: 700,
    },
    h4: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
  },
});

export default function Home() {
  const router = useRouter();
  const { isSignedIn } = useUser();

  const handleStartFlipping = () => {
    if (isSignedIn) {
      router.push('/flashcards');
    } else {
      router.push('/sign-up');
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/checkout_session', {
        method: 'POST',
        headers: {
          'origin': 'http://localhost:3000',
        },
        body: JSON.stringify({ plan: 'pro' }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const checkoutSessionJson = await response.json();

      if (checkoutSessionJson.error) {
        console.error('Checkout session error:', checkoutSessionJson.error);
        // Handle the error (e.g., show an error message to the user)
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = checkoutSessionJson.url;
    } catch (error) {
      console.error('Checkout error:', error);
      // Handle the error (e.g., show an error message to the user)
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
        <Container maxWidth="100vw" sx={{ px: 0, flexGrow: 1 }}>
          <Head>
            <title>Brain Flip - AI-Powered Flashcard Generator</title>
            <meta name="description" content='Create flashcards from your text using AI' />
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
          </Head>
          <AppBar position='static' color="transparent" elevation={0} sx={{ backgroundColor: 'white' }}>
            <Toolbar>
              <Typography variant='h6' style={{ flexGrow: 1, fontWeight: 700, color: theme.palette.primary.main }}>
                Brain Flip
              </Typography>
              <SignedOut>
                <Button color="primary" href='/sign-in'>Login</Button>
                <Button color="secondary" variant="contained" href='.../sign-up'>Sign Up</Button>
              </SignedOut>
              <SignedIn>
                <Link href="/flashcards" passHref>
                  <Button color="primary" sx={{ mr: 2 }}>My Flashcards</Button>
                </Link>
                <UserButton />
              </SignedIn>
            </Toolbar>
          </AppBar>

          {/* Hero Section */}
          <Box sx={{ 
            textAlign: 'center', 
            py: 12,
            background: 'linear-gradient(135deg, #4a90e2 0%, #f6546a 100%)',
            color: 'white',
            borderRadius: '0 0 50% 50% / 10%',
            position: 'relative',
            overflow: 'hidden',
          }}>
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Typography variant="h1" gutterBottom sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>
                Flip Your Learning
              </Typography>
              <Typography variant="h5" gutterBottom sx={{ mb: 4, maxWidth: '800px', mx: 'auto' }}>
                Transform any text into interactive flashcards with our AI-powered platform
              </Typography>
              <Button 
                variant="contained" 
                color="secondary" 
                size="large" 
                onClick={handleStartFlipping}
                sx={{ 
                  fontSize: '1.2rem', 
                  py: 1.5, 
                  px: 4, 
                  borderRadius: '30px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 8px rgba(0,0,0,0.15)',
                  },
                }}
              >
                Start Flipping Now
              </Button>
            </motion.div>
          </Box>

          {/* Features Section */}
          <Box sx={{ my: 12, px: 4 }}>
            <Typography variant="h2" gutterBottom textAlign="center" sx={{ mb: 8, color: theme.palette.primary.main }}>
              Why Choose Brain Flip?
            </Typography>
            <Grid container spacing={6}>
              {[
                { icon: AutoStoriesIcon, title: "AI-Powered Generation", description: "Our advanced AI creates tailored flashcards from any text you provide.", color: "#4a90e2" },
                { icon: FlashOnIcon, title: "Quick Learning", description: "Efficient spaced repetition system for faster memorization and retention.", color: "#f6546a" },
                { icon: CloudSyncIcon, title: "Cloud Sync", description: "Access your flashcards from any device, anytime, anywhere.", color: "#50c878" },
              ].map((feature, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Paper elevation={3} sx={{ p: 4, height: '100%', borderRadius: '15px', backgroundColor: 'white' }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <feature.icon sx={{ fontSize: 80, color: feature.color, mb: 2 }} />
                        <Typography variant='h4' gutterBottom color={feature.color}>
                          {feature.title}
                        </Typography>
                        <Typography>
                          {feature.description}
                        </Typography>
                      </Box>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Pricing Section */}
          <Box sx={{ my: 12, px: 4, py: 12, backgroundColor: 'white', borderRadius: '50px' }}>
            <Typography variant='h2' gutterBottom textAlign="center" sx={{ mb: 8, color: theme.palette.primary.main }}>
              Choose Your Plan
            </Typography>
            <Grid container spacing={6} justifyContent="center">
              {[
                { title: "Basic", price: "$0", color: theme.palette.primary.main, features: ["100 AI-generated flashcards/month", "Basic analytics", "Cloud sync"], action: handleStartFlipping },
                { title: "Pro", price: "$10", color: theme.palette.secondary.main, features: ["Unlimited AI-generated flashcards", "Advanced analytics", "Priority support"], action: handleSubmit },
              ].map((plan, index) => (
                <Grid item xs={12} md={5} key={index}>
                  <motion.div whileHover={{ scale: 1.03 }}>
                    <Paper elevation={4} sx={{
                      p: 4,
                      borderRadius: '20px',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      backgroundColor: plan.color,
                      color: 'white',
                    }}>
                      <div>
                        <Typography variant='h3' gutterBottom>
                          {plan.title}
                        </Typography>
                        <Typography variant='h2' gutterBottom sx={{ mb: 4 }}>
                          {plan.price} <Typography component="span" variant="h5">/month</Typography>
                        </Typography>
                        {plan.features.map((feature, i) => (
                          <Typography key={i} sx={{ mb: 1 }}>✓ {feature}</Typography>
                        ))}
                      </div>
                      <Button 
                        variant="contained" 
                        size="large" 
                        sx={{ 
                          mt: 4, 
                          backgroundColor: 'white', 
                          color: plan.color,
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.9)',
                          }
                        }}
                        onClick={plan.action}
                      >
                        {plan.title === "Basic" ? "Get Started" : "Choose Pro"}
                      </Button>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      {/* Footer */}
      <Box
          component="footer"
          sx={{
            py: 4,
            px: 2,
            mt: 'auto',
            background: 'linear-gradient(135deg, #4a90e2 0%, #f6546a 100%)',
            color: 'white',
          }}>
          <Container maxWidth="lg" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Grid container>
              <Grid item xs={12} sm={6}>
                <Stack direction="row" spacing={2} justifyContent="flex-start">
                  <IconButton
                    color="inherit"
                    component="a"
                    href="mailto:yanni620@bu.edu"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ '&:hover': { color: '#00bcd4' } }}
                  >
                    <EmailIcon />
                  </IconButton>
                  <IconButton
                    color="inherit"
                    component="a"
                    href="https://www.linkedin.com/in/ayannarouse/"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ '&:hover': { color: '#00bcd4' } }}
                  >
                    <LinkedInIcon />
                  </IconButton>
                </Stack>
              </Grid>
            </Grid>
            <Box sx={{ mt: 'auto' }}>
              <Typography variant="body2" color="inherit" align="center">
                © {new Date().getFullYear()} Brain Flip - A&apos;Yanna Rouse. All rights reserved.
              </Typography> 
            </Box>
          </Container>
        </Box>
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