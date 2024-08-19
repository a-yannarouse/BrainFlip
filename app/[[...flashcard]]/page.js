'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { collection, doc, getDocs, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { Box, Button, Card, CardContent, Container, Grid, IconButton, Typography, AppBar, Toolbar } from '@mui/material'
import { UserButton } from '@clerk/nextjs'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import FlipIcon from '@mui/icons-material/Flip'
import EmailIcon from '@mui/icons-material/Email'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import { motion } from 'framer-motion'

export default function Flashcard() {
    const { isLoaded, isSignedIn, user } = useUser()
    const [flashcards, setFlashcards] = useState([])
    const [currentCardIndex, setCurrentCardIndex] = useState(0)
    const [isFlipped, setIsFlipped] = useState(false)
    const searchParams = useSearchParams()
    const search = searchParams.get('id')
    const router = useRouter()

    useEffect(() => {
        async function getFlashCard() {
            if (!search || !user) return
            const colRef = collection(doc(collection(db, 'users'), user.id), search)
            const docs = await getDocs(colRef)
            const flashcards = []
            docs.forEach((doc) => {
                flashcards.push({id: doc.id, ...doc.data()})
            })
            setFlashcards(flashcards)
        }
        getFlashCard()
    }, [search, user])

    if (!isLoaded || !isSignedIn || flashcards.length === 0) {
        return <Typography>Loading...</Typography>
    }

    const handleFlip = () => {
        setIsFlipped(!isFlipped)
    }

    const handleNext = () => {
        setCurrentCardIndex((prevIndex) => 
            prevIndex === flashcards.length - 1 ? 0 : prevIndex + 1
        )
        setIsFlipped(false)
    }

    const handlePrevious = () => {
        setCurrentCardIndex((prevIndex) => 
            prevIndex === 0 ? flashcards.length - 1 : prevIndex - 1
        )
        setIsFlipped(false)
    }
    
    const currentCard = flashcards[currentCardIndex]

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'background.default' }}>
            <AppBar position="static" color="transparent" elevation={0} sx={{ backgroundColor: 'white' }}>
                <Toolbar>
                    <Typography variant="h6" style={{ flexGrow: 1, fontWeight: 700, color: '#4a90e2' }}>
                        Brain Flip
                    </Typography>
                    <UserButton />
                </Toolbar>
            </AppBar>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Button
                        color="primary"
                        onClick={() => router.push('/flashcards')}
                        startIcon={<ArrowBackIosIcon />}
                        sx={{
                            fontWeight: 600,
                            mb: 2,
                            '&:hover': {
                                backgroundColor: 'rgba(74, 144, 226, 0.1)',
                                transform: 'scale(1.05)',
                            },
                            transition: 'all 0.3s ease',
                        }}
                    >
                        Back to Dashboard
                    </Button>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Typography variant="h4" gutterBottom sx={{ color: '#4a90e2', fontWeight: 700, mb: 3 }}>
                        {search}
                    </Typography>
                </motion.div>
                <Card sx={{ 
                    minHeight: 300, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    cursor: 'pointer',
                    perspective: 1000,
                    mt: 3,
                    boxShadow: 3,
                    borderRadius: '15px',
                }}
                onClick={handleFlip}
                >
                    <Box sx={{
                        width: '100%',
                        height: '100%',
                        transition: 'transform 0.6s',
                        transformStyle: 'preserve-3d',
                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    }}>
                        <CardContent sx={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            backfaceVisibility: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 4,
                        }}>
                            <Typography variant="h5" component="div" align="center">
                                {currentCard.front}
                            </Typography>
                        </CardContent>
                        <CardContent sx={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            backfaceVisibility: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transform: 'rotateY(180deg)',
                            padding: 4,
                        }}>
                            <Typography variant="h5" component="div" align="center">
                                {currentCard.back}
                            </Typography>
                        </CardContent>
                    </Box>
                </Card>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 5 }}>
                    <IconButton onClick={handlePrevious} color="primary" sx={{ fontSize: '2rem' }}>
                        <ArrowBackIcon fontSize="inherit" />
                    </IconButton>
                    <Button 
                        variant="contained" 
                        startIcon={<FlipIcon />}
                        onClick={handleFlip}
                        sx={{ 
                            px: 4,
                            py: 1.5,
                            fontSize: '1.2rem',
                            borderRadius: '20px',
                            boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
                            transition: '0.3s',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 6px 10px 4px rgba(255, 105, 135, .3)',
                            },
                        }}
                    >
                        Flip
                    </Button>
                    <IconButton onClick={handleNext} color="primary" sx={{ fontSize: '2rem' }}>
                        <ArrowForwardIcon fontSize="inherit" />
                    </IconButton>
                </Box>
                <Typography sx={{ mt: 3, textAlign: 'center' }} color="primary">
                    Card {currentCardIndex + 1} of {flashcards.length}
                </Typography>
            </Container>
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
                            <Box sx={{ display: 'flex', gap: 2 }}>
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
                            </Box>
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
    )
}