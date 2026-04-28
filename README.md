# CycleSense 🌸
AI-Based Personalized Menstrual Cycle Prediction

## Team
- Ayesha Raza (23k-3015) — Backend + Project Lead
- Khadija Atiq (23k-3016) — ML Engineer  
- Mehak (23k-3021) — Frontend Developer

## Tech Stack
- Python, FastAPI, Scikit-learn, MongoDB
- React Native (Expo)

## Setup Instructions
See each folder's README for setup steps.

## Project Structure
CycleSense/
├── backend/     → FastAPI + MongoDB
├── frontend/    → React Native App
└── ml/          → Jupyter Notebooks + Model Training

# how to run - we will need 3 terminals 
## terminal 1
cd CycleSense/backend

# Activate virtual environment
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Run the server
uvicorn main:app --reload --port 8000

## terminal 2 - in backend folder 
ngrok http --url=freckles-hardly-galvanize.ngrok-free.dev 8000

## terminal 3 
cd CycleSense/frontend/CycleSenseApp

npx expo start
