const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const { SpeechClient } = require('@google-cloud/speech');
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');

// Initialize AI services
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const speechClient = new SpeechClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const ttsClient = new TextToSpeechClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio and video files are allowed'), false);
    }
  },
});

// Speech-to-Text endpoint
router.post('/speech-to-text', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const audioBytes = await fs.readFile(req.file.path);
    
    const audio = {
      content: audioBytes.toString('base64'),
    };

    const config = {
      encoding: 'WEBM_OPUS',
      sampleRateHertz: 48000,
      languageCode: 'en-US',
      alternativeLanguageCodes: ['ar-SA', 'es-ES', 'fr-FR'],
      enableAutomaticPunctuation: true,
      model: 'latest_long',
    };

    const request = {
      audio: audio,
      config: config,
    };

    const [response] = await speechClient.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');

    // Clean up uploaded file
    await fs.unlink(req.file.path);

    res.json({
      success: true,
      transcription: transcription,
      confidence: response.results[0]?.alternatives[0]?.confidence || 0,
    });

  } catch (error) {
    console.error('Speech-to-text error:', error);
    res.status(500).json({
      error: 'Speech recognition failed',
      message: error.message,
    });
  }
});

// Text-to-Speech endpoint
router.post('/text-to-speech', async (req, res) => {
  try {
    const { text, language = 'en-US', voice = 'en-US-Wavenet-D' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }

    const request = {
      input: { text: text },
      voice: {
        languageCode: language,
        name: voice,
        ssmlGender: 'NEUTRAL',
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 0.9,
        pitch: 0.0,
      },
    };

    const [response] = await ttsClient.synthesizeSpeech(request);
    const audioContent = response.audioContent;

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioContent.length,
    });

    res.send(audioContent);

  } catch (error) {
    console.error('Text-to-speech error:', error);
    res.status(500).json({
      error: 'Text-to-speech conversion failed',
      message: error.message,
    });
  }
});

// Sign Language Recognition endpoint
router.post('/sign-language-recognition', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    // In a real implementation, you would:
    // 1. Process the video with a sign language recognition model
    // 2. Use TensorFlow.js or PyTorch models
    // 3. Return the recognized text

    // For now, we'll simulate the process
    const mockSigns = [
      '123 Main Street',
      '456 Oak Avenue',
      '789 Pine Road',
      '321 Elm Street',
      '654 Maple Drive',
      '987 Cedar Lane',
      '147 Birch Street',
      '258 Willow Way'
    ];

    const randomSign = mockSigns[Math.floor(Math.random() * mockSigns.length)];
    const confidence = Math.random() * 0.3 + 0.7; // 70-100% confidence

    // Clean up uploaded file
    await fs.unlink(req.file.path);

    res.json({
      success: true,
      recognizedText: randomSign,
      confidence: confidence,
      processingTime: Math.random() * 2000 + 1000, // 1-3 seconds
    });

  } catch (error) {
    console.error('Sign language recognition error:', error);
    res.status(500).json({
      error: 'Sign language recognition failed',
      message: error.message,
    });
  }
});

// AI Problem Analysis endpoint
router.post('/analyze-problem', async (req, res) => {
  try {
    const { problem, userId } = req.body;

    if (!problem) {
      return res.status(400).json({ error: 'No problem description provided' });
    }

    const prompt = `
    Analyze the following user problem and provide a detailed technical summary and recommended actions:
    
    Problem: "${problem}"
    
    Please provide:
    1. A brief technical summary of the issue
    2. Likely causes
    3. Recommended troubleshooting steps
    4. Priority level (Low/Medium/High/Critical)
    5. Suggested escalation if needed
    
    Format your response as a structured analysis suitable for a support team.
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert technical support analyst specializing in accessibility and mobile applications. Provide clear, actionable analysis.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const analysis = completion.choices[0].message.content;

    res.json({
      success: true,
      analysis: analysis,
      timestamp: new Date().toISOString(),
      problemId: `prob_${Date.now()}`,
    });

  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({
      error: 'AI analysis failed',
      message: error.message,
    });
  }
});

// Voice Command Processing endpoint
router.post('/process-voice-command', async (req, res) => {
  try {
    const { command, context = 'general' } = req.body;

    if (!command) {
      return res.status(400).json({ error: 'No voice command provided' });
    }

    const prompt = `
    Process this voice command for a ride-sharing app: "${command}"
    
    Context: ${context}
    
    Extract:
    1. Pickup location (if mentioned)
    2. Destination (if mentioned)
    3. Ride type preference (if mentioned)
    4. Special requirements (if any)
    5. Intent (book_ride, cancel_ride, get_status, etc.)
    
    Respond with a JSON object containing the extracted information.
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a voice command processor for a ride-sharing app. Extract structured information from natural language commands.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.1,
    });

    const response = completion.choices[0].message.content;
    let parsedResponse;

    try {
      parsedResponse = JSON.parse(response);
    } catch (parseError) {
      // Fallback if JSON parsing fails
      parsedResponse = {
        intent: 'book_ride',
        pickup: null,
        destination: null,
        rideType: 'standard',
        specialRequirements: [],
        confidence: 0.5
      };
    }

    res.json({
      success: true,
      extractedData: parsedResponse,
      originalCommand: command,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Voice command processing error:', error);
    res.status(500).json({
      error: 'Voice command processing failed',
      message: error.message,
    });
  }
});

// Get available voices for TTS
router.get('/voices', async (req, res) => {
  try {
    const [result] = await ttsClient.listVoices({});
    const voices = result.voices.map(voice => ({
      name: voice.name,
      languageCode: voice.languageCodes[0],
      gender: voice.ssmlGender,
      naturalSampleRateHertz: voice.naturalSampleRateHertz,
    }));

    res.json({
      success: true,
      voices: voices,
    });

  } catch (error) {
    console.error('Error fetching voices:', error);
    res.status(500).json({
      error: 'Failed to fetch available voices',
      message: error.message,
    });
  }
});

module.exports = router;

