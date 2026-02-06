# AI Trip Planner App

## Overview
The AI Trip Planner App is an intelligent travel planning assistant that leverages artificial intelligence to create personalized, optimized itineraries for travelers worldwide.

## Problem Statement
Planning a trip involves numerous time-consuming decisions: researching destinations, finding suitable accommodations, identifying attractions, managing budgets, and coordinating logistics. Travelers often face:
- **Information Overload**: Difficulty filtering through countless tourism websites and reviews
- **Time Constraints**: Hours spent researching and planning
- **Personalization Gaps**: Generic travel guides don't account for individual preferences
- **Optimization Challenges**: Balancing budget, time, and experience preferences
- **Last-Minute Changes**: Difficulty adapting plans to unexpected circumstances

## Solution
This app uses AI to solve these problems by:
- **Generating Smart Itineraries**: AI analyzes preferences and creates customized day-by-day plans
- **Personalized Recommendations**: Suggests attractions, restaurants, and accommodations based on user interests
- **Budget Optimization**: Automatically adjusts recommendations within specified budget constraints
- **Real-Time Adaptation**: Modifies plans based on weather, availability, and user feedback
- **Seamless Experience**: Intuitive interface requiring minimal user effort

## Key Features
- AI-powered itinerary generation
- Personalized destination recommendations
- Budget-aware planning
- Real-time adjustments
- Multi-destination support
- Interactive maps and visuals
- Weather integration
- Restaurant and activity suggestions

## Tech Stack
- React Native Expo
- Firebase
- Firebase Auth
- Groq AI API
- Nativewind

## Getting Started
### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Firebase account
- Groq API key

### Installation
1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/AI-Trip-Planner-App.git
    cd AI-Trip-Planner-App
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Configure environment variables:
    ```bash
    cp .env.example .env.local
    ```
    Add your Firebase credentials and Groq API key.

4. Start the development server:
    ```bash
    expo start
    ```

## Usage
1. **Sign Up/Login**: Create an account using Firebase Authentication
2. **Set Preferences**: Specify your travel dates, budget, interests, and travel style
3. **Generate Itinerary**: Click "Plan My Trip" to get AI-generated recommendations
4. **Customize**: Edit suggestions, add personal notes, adjust activities
5. **Share & Export**: Download or share your itinerary

Example workflow:
- Select destination and travel dates
- Input budget range and interests
- Review AI-generated daily schedule
- Modify activities as needed
- Save or export for offline access

## Contributing
Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit changes (`git commit -m 'Add YourFeature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.