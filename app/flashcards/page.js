'use client'
import { useUser, SignedIn, SignedOut } from '@clerk/nextjs'
import Image from 'next/image';
import { useEffect, useState } from 'react'
import { collection, doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { useRouter, usePathname } from 'next/navigation'
import { Box, Button, Card, CardActionArea, CardContent, Container, Grid, 
    Typography, AppBar, Toolbar, IconButton, Fab, Stack } from '@mui/material'
import { UserButton } from '@clerk/nextjs'
import HomeIcon from '@mui/icons-material/Home'
import AddIcon from '@mui/icons-material/Add'
import EmailIcon from '@mui/icons-material/Email'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import { motion } from 'framer-motion'
import { loadStripe } from '@stripe/stripe-js'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

const MotionGrid = motion(Grid);
const MotionCard = motion(Card);

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
  },
});

const DeleteButton = styled(Button)(({ theme }) => ({
  position: 'absolute',
  top: 8,
  right: 8,
  minWidth: 'auto',
  padding: '4px',
  borderRadius: '50%',
  color: theme.palette.error.main,
  backgroundColor: 'transparent',
  '&:hover': {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
  },
  '& .MuiSvgIcon-root': {
    fontSize: '1.2rem',
  },
}));

export default function Flashcards() {
    const { isLoaded, isSignedIn, user } = useUser()
    const [flashcards, setFlashcards] = useState([])
    const [isPro, setIsPro] = useState(false)
    const router = useRouter()

    useEffect(() => {
        async function getFlashcards() {
            if (!user) return
            const docRef = doc(collection(db, 'users'), user.id)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                const userData = docSnap.data()
                setFlashcards(userData.flashcards || [])
                setIsPro(userData.isPro || false)
            } else {
                await setDoc(docRef, { flashcards: [], isPro: false })
            }
        }
        getFlashcards()
    }, [user])

    const handleDelete = async (flashcardName, event) => {
      event.stopPropagation();
      if (confirm(`Are you sure you want to delete the "${flashcardName}" flashcard set?`)) {
        try {
          const userDocRef = doc(collection(db, 'users'), user.id);
          const updatedFlashcards = flashcards.filter(fc => fc.name !== flashcardName);
          await setDoc(userDocRef, { flashcards: updatedFlashcards }, { merge: true });
          setFlashcards(updatedFlashcards);
        } catch (error) {
          console.error("Error deleting flashcard set:", error);
          alert("An error occurred while deleting the flashcard set. Please try again.");
        }
      }
    };

    const handleSubmit = async () => {
        const checkoutSession = await fetch('/api/checkout_session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'origin': 'http://localhost:3000'
            },
            body: JSON.stringify({ plan: 'pro' }),
        })

        const checkoutSessionJson = await checkoutSession.json()

        if (checkoutSession.status === 500) {
            console.error(checkoutSessionJson.error)
            return
        }

        const stripe = await stripePromise;
        if (!stripe) {
            console.error('Stripe failed to initialize');
            return;
        }

        const { error } = await stripe.redirectToCheckout({
            sessionId: checkoutSessionJson.id,
        })

        if (error) {
            console.warn(error.message)
        }
    }

    if (!isLoaded || !isSignedIn) {
        return null
    }

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'background.default' }}>
                <AppBar position="static" color="transparent" elevation={0} sx={{ backgroundColor: 'white' }}>
                    <Toolbar>
                        <Typography variant="h6" style={{ flexGrow: 1, fontWeight: 700, color: theme.palette.primary.main }}>
                            Brain Flip
                        </Typography>
                        <Button color="primary" onClick={() => router.push('/')} startIcon={<HomeIcon />}>Home</Button>
                        <UserButton />
                    </Toolbar>
                </AppBar>
                <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Typography variant="h4" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>
                            Welcome, {user.firstName}!
                        </Typography>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Box sx={{ mb: 4, p: 2, backgroundColor: 'white', borderRadius: 2, boxShadow: 1 }}>
                            <Typography variant="body1" gutterBottom>
                                Subscription Status: <strong>{isPro ? 'Pro User' : 'Basic User'}</strong>
                            </Typography>
                            {!isPro && (
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    sx={{ mt: 2 }}
                                    onClick={handleSubmit}
                                >
                                    Upgrade to Pro
                                </Button>
                            )}
                        </Box>
                    </motion.div>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h5" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                            Your Flashcards
                        </Typography>
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<AddIcon />}
                            onClick={() => router.push('/generate')}
                            sx={{
                                borderRadius: '20px',
                                boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
                                transition: '0.3s',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 6px 10px 4px rgba(255, 105, 135, .3)',
                                },
                            }}
                        >
                            Add Flashcards
                        </Button>
                    </Box>
                    <MotionGrid container spacing={3}>
                        {flashcards.map((flashcard, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <MotionCard
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    sx={{ 
                                      height: '100%', 
                                      display: 'flex', 
                                      flexDirection: 'column', 
                                      transition: '0.3s', 
                                      position: 'relative',
                                      '&:hover': { 
                                        transform: 'translateY(-5px)', 
                                        boxShadow: 3,
                                        '& .delete-button': {
                                          opacity: 1,
                                        },
                                      },
                                    }}
                                >
                                    <CardActionArea onClick={() => router.push(`/flashcard?id=${flashcard.name}`)} sx={{ flexGrow: 1 }}>
                                        <CardContent>
                                            <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main }}>
                                                {flashcard.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Click to view this flashcard set
                                            </Typography>
                                        </CardContent>
                                    </CardActionArea>
                                    <DeleteButton
                                      className="delete-button"
                                      onClick={(e) => handleDelete(flashcard.name, e)}
                                      sx={{
                                        opacity: 0,
                                        transition: 'opacity 0.3s',
                                      }}
                                    >
                                      <DeleteIcon />
                                    </DeleteButton>
                                </MotionCard>
                            </Grid>
                        ))}
                    </MotionGrid>
                    {flashcards.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <Box sx={{ mt: 4, textAlign: 'center', p: 3, backgroundColor: 'white', borderRadius: 2, boxShadow: 1 }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    You don&apos;t have any flashcards yet. Let&apos;s create your first set!
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    startIcon={<AddIcon />}
                                    onClick={() => router.push('/generate')}
                                    sx={{
                                        borderRadius: '20px',
                                        boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
                                        transition: '0.3s',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 6px 10px 4px rgba(255, 105, 135, .3)',
                                        },
                                    }}
                                >
                                    Create Flashcards
                                </Button>
                            </Box>
                        </motion.div>
                    )}
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
        </ThemeProvider>
    )
}