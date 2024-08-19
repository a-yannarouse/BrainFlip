'use client'

import { useUser } from '@clerk/nextjs'
import { useState } from 'react'
import { writeBatch, doc, collection, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Box, Button, Card, CardActionArea, CardContent, Container, Dialog, DialogActions, 
DialogContent, DialogContentText, DialogTitle, Grid, Paper, TextField, Typography, Stack, IconButton } from '@mui/material'
import EmailIcon from '@mui/icons-material/Email'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import { UserButton } from '@clerk/nextjs'

export default function Generate() {
    const { isLoaded, isSignedIn, user } = useUser()
    const [flashcards, setFlashcards] = useState([])
    const [flipped, setFlipped] = useState({})
    const [text, setText] = useState('')
    const [name, setName] = useState('')
    const [open, setOpen] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const router = useRouter()

    const handleSubmit = async () => {
        if (!isSignedIn) {
            router.push('/sign-up')
            return
        }
        setIsGenerating(true)
        try {
            const response = await fetch('api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            })
            const data = await response.json()
            setFlashcards(data)
        } catch (error) {
            console.error('Error generating flashcards:', error)
        } finally {
            setIsGenerating(false)
        }
    }

    const handleCardClick = (id) => {
        setFlipped((prev) => ({
            ...prev,
            [id]: !prev[id],
        }))
    }

    const handleOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    const saveFlashcards = async () => {
        if (!isLoaded || !isSignedIn) {
            alert('Please sign in to save flashcards')
            return
        }

        if (!user) {
            alert('User data is not available. Please try again.')
            return
        }

        if (!name) {
            alert('Please enter a name')
            return
        }

        const batch = writeBatch(db)
        const userDocRef = doc(collection(db, 'users'), user.id)
        const docSnap = await getDoc(userDocRef)
        
        if (docSnap.exists()) {
            const collections = docSnap.data().flashcards || []
            if (collections.find((f) => f.name === name)) {
                alert("Flashcard collection with this name already exists")
                return
            } else {
                collections.push({name})
                batch.set(userDocRef, {flashcards: collections}, {merge: true})
            }
        } else {
            batch.set(userDocRef, {flashcards: [{name}]})
        }

        const colRef = collection(userDocRef, name)
        flashcards.forEach((flashcard) => {
            const cardDocRef = doc(colRef)
            batch.set(cardDocRef, flashcard)
        })

        await batch.commit()
        handleClose()
        router.push('/flashcards')
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', p: 2, backgroundColor: 'white' }}>
                <Typography variant="h4" sx={{ ml: 2, color: '#f6546a', fontWeight: 600 }}>Generate Flashcards</Typography>
                <Box sx={{ flexGrow: 1 }} />
                <UserButton />
            </Box>

            <Container maxWidth="md" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', py: 4 }}>
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
                <Box sx={{ mb: 10 }} /> {/* This adds space between the button and the Box component */}
                <Box
                    component={motion.div}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    sx={{
                        mb: 6,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Paper 
                        elevation={3}
                        sx={{ 
                            p: 4, 
                            width: '100%', 
                            backgroundColor: '#f0f4f8',
                            borderRadius: '15px',
                            border: '2px solid #4a90e2'
                        }}
                    >
                        <TextField
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            label="Enter text"
                            fullWidth
                            multiline
                            rows={4}
                            variant='outlined'
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: '#4a90e2',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#f6546a',
                                    },
                                },
                            }}
                        />
                        <Button
                            variant='contained'
                            sx={{
                                backgroundColor: '#f6546a',
                                '&:hover': {
                                    backgroundColor: '#4a90e2',
                                },
                            }}
                            onClick={handleSubmit}
                            fullWidth
                            disabled={isGenerating}
                        >
                            {isGenerating ? 'Generating...' : 'Generate Flashcards'}
                        </Button>
                    </Paper>
                </Box>

                {flashcards.length > 0 && (
                    <Box 
                        component={motion.div}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Typography variant="h5" sx={{ color: '#4a90e2', fontWeight: 600, mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', }}>Flashcards Preview</Typography>
                        <Grid container spacing={3}>
                            {flashcards.map((flashcard, index) => (
                                <Grid item xs={12} sm={6} md={4} key={index}>
                                    <Card
                                        component={motion.div}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        sx={{
                                            perspective: '1000px',
                                            cursor: 'pointer',
                                            borderRadius: '12px',
                                            boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                                            border: '2px solid #4a90e2',
                                            height: '250px',
                                        }}
                                        onClick={() => handleCardClick(index)}
                                    >
                                        <motion.div
                                            style={{
                                                position: 'relative',
                                                width: '100%',
                                                height: '100%',
                                                transformStyle: 'preserve-3d',
                                                transform: flipped[index] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                                transition: 'transform 0.6s ease',
                                            }}
                                        >
                                            <CardContent sx={{ 
                                                position: 'absolute', 
                                                width: '100%', 
                                                height: '100%', 
                                                backfaceVisibility: 'hidden', 
                                                display: 'flex', 
                                                flexDirection: 'column',
                                                justifyContent: 'center', 
                                                alignItems: 'center',
                                                backgroundColor: '#ffffff',
                                                borderRadius: '12px',
                                                padding: '20px',
                                                overflow: 'auto'
                                            }}>
                                                <Typography variant='body1' component='div' sx={{ 
                                                    fontWeight: 500,
                                                    fontSize: '1.1rem',
                                                    lineHeight: 1.5,
                                                    textAlign: 'center'
                                                }}>
                                                    {flashcard.front}
                                                </Typography>
                                            </CardContent>
                                            <CardContent sx={{ 
                                                position: 'absolute', 
                                                width: '100%', 
                                                height: '100%', 
                                                backfaceVisibility: 'hidden', 
                                                display: 'flex', 
                                                flexDirection: 'column',
                                                justifyContent: 'center', 
                                                alignItems: 'center',
                                                backgroundColor: '#f0f4f8',
                                                borderRadius: '12px',
                                                transform: 'rotateY(180deg)',
                                                padding: '20px',
                                                overflow: 'auto'
                                            }}>
                                                <Typography variant='body1' component='div' sx={{ 
                                                    fontWeight: 500, 
                                                    color: '#4a90e2',
                                                    fontSize: '1.1rem',
                                                    lineHeight: 1.5,
                                                    textAlign: 'center'
                                                }}>
                                                    {flashcard.back}
                                                </Typography>
                                            </CardContent>
                                        </motion.div>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                            <Button 
                                variant='contained' 
                                sx={{
                                    backgroundColor: '#f6546a',
                                    '&:hover': {
                                        backgroundColor: '#4a90e2',
                                    },
                                }}
                                onClick={handleOpen}
                            >
                                Save Flashcards
                            </Button>
                        </Box>
                    </Box>
                )}
            </Container>

            <Dialog 
                open={open} 
                onClose={handleClose}
                PaperProps={{
                    style: {
                        borderRadius: '16px',
                        padding: '24px',
                        background: 'linear-gradient(135deg, #f0f4f8 0%, #ffffff 100%)',
                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                    },
                }}
            >
                <DialogTitle sx={{ 
                    color: '#f6546a', 
                    fontWeight: 600, 
                    fontSize: '1.5rem',
                    textAlign: 'center',
                    mb: 2
                }}>
                    Save Flashcard
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ 
                        color: '#4a90e2', 
                        mb: 3,
                        textAlign: 'center'
                    }}>
                        Please enter a name for your flashcards collection
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin='dense'
                        label='Collection Name'
                        type='text'
                        fullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        variant='outlined'
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: '#4a90e2',
                                    borderRadius: '12px',
                                },
                                '&:hover fieldset': {
                                    borderColor: '#f6546a',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#f6546a',
                                },
                            },
                            '& .MuiInputLabel-root': {
                                color: '#4a90e2',
                            },
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', mt: 3 }}>
                    <Button 
                        onClick={handleClose}
                        sx={{
                            color: '#4a90e2',
                            borderColor: '#4a90e2',
                            '&:hover': {
                                backgroundColor: 'rgba(74, 144, 226, 0.1)',
                            },
                            borderRadius: '20px',
                            px: 3,
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={saveFlashcards}
                        variant="contained"
                        sx={{
                            backgroundColor: '#f6546a',
                            '&:hover': {
                                backgroundColor: '#4a90e2',
                            },
                            borderRadius: '20px',
                            px: 3,
                        }}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

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
                            © {new Date().getFullYear()} Brain Flip - A'Yanna Rouse. All rights reserved.
                        </Typography>
                    </Box>
                </Container>
            </Box>
        </Box>
    )
}