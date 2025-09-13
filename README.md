# Access Rides - Accessible Transportation App

A comprehensive React Native application for accessible transportation with full support for people with disabilities.

## Key Features

### 🚗 Accessible Transportation System
- Easy ride booking
- Driver matching system
- Real-time trip tracking
- Accessible vehicle options

### 🎤 Voice Communication
- Voice recording and speech-to-text conversion
- Text-to-speech functionality
- VoiceOver support
- Audio message support

### 👋 Sign Language Integration
- Advanced sign language camera
- Sign-to-text translation
- Driver message translation to sign language
- Interactive sign language dictionary

### 💬 Advanced Chat System
- Text chat with drivers
- Voice messages
- Sign language messages
- Real-time message translation
- Multi-modal communication

### ♿ Accessibility Features
- Full support for people with disabilities
- Customizable accessibility settings
- Enhanced user interface
- VoiceOver and screen reader support
- Haptic feedback
- High contrast mode

## Technologies Used

- **React Native** - Core framework
- **Expo** - Development platform
- **TypeScript** - Programming language
- **Expo Camera** - Sign language camera
- **Expo Speech** - Text-to-speech
- **Expo Audio** - Voice recording
- **Google Maps** - Navigation and location services
- **AI Integration** - Advanced translation and accessibility features

## Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development)

### Installation Steps

1. **Clone the repository**
```bash
git clone https://github.com/ahmedgamal985/Access-Rides.git
cd Access-Rides
```

2. **Install dependencies**
```bash
npm install
cd backend && npm install
```

3. **Environment Setup**
```bash
# Create environment file for backend
cp backend/env.example backend/.env
# Add your API keys to backend/.env
```

4. **Start the application**
```bash
# Start the frontend
npm start

# Start the backend (in a separate terminal)
cd backend && npm start
```

5. **Run on devices**
```bash
# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

## Project Structure

```
Access-Rides/
├── components/              # React components
│   ├── AccessibilitySettings.tsx
│   ├── DriverChatInterface.tsx
│   ├── SignLanguageCamera.tsx
│   ├── VoiceRecorder.tsx
│   └── ...
├── backend/                 # Backend server
│   ├── routes/             # API routes
│   ├── server.js           # Main server file
│   └── package.json
├── config/                 # Configuration files
├── types/                  # TypeScript definitions
├── assets/                 # Images and icons
├── App.tsx                 # Main application file
└── package.json           # Project dependencies
```

## Advanced Features

### Sign Language Translation
- Comprehensive sign language dictionary
- Interactive animations
- Visual sign language guide
- Real-time translation

### Chat System
- Instant messaging with drivers
- Multi-modal message support
- Automatic message translation
- Voice and sign language integration

### Accessibility
- VoiceOver support
- Haptic feedback
- High contrast themes
- Alternative text for images
- Screen reader optimization
- Customizable font sizes

## API Integration

### Required API Keys
- Google Maps API (for navigation)
- OpenAI API (for AI features)
- Google Cloud Service Account (for advanced features)

### Environment Variables
Create a `backend/.env` file with:
```
GOOGLE_MAPS_API_KEY=your_google_maps_key
OPENAI_API_KEY=your_openai_key
PORT=3000
```

## Contributing

We welcome contributions! Please:

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Ensure accessibility compliance
- Document new features
- Follow the existing code style

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

- **Developer**: Ahmed Gamal
- **GitHub**: [@ahmedgamal985](https://github.com/ahmedgamal985)
- **Repository**: [Access-Rides](https://github.com/ahmedgamal985/Access-Rides)

## Acknowledgments

- Expo team for excellent support
- React Native community
- All contributors to the project
- Accessibility advocates and testers

## Roadmap

- [ ] Enhanced AI translation
- [ ] Offline mode support
- [ ] Multi-language support
- [ ] Advanced accessibility features
- [ ] Integration with more transportation services

---

**Note**: This project is designed to improve transportation accessibility for people with disabilities and make transportation more inclusive and accessible for everyone.