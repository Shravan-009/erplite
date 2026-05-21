# Erplite React Frontend

## Setup

1. Open a terminal in `frontend`
2. Run `npm install`
3. Start the app with `npm run dev`

## Usage

- The React app calls the backend at `http://localhost:8080/api/users`
- Backend CORS is enabled for `http://localhost:5173`

## Notes

- Start the Spring Boot backend before using the React frontend.
- If your backend uses a different port, update `VITE_API_URL` in `.env` or `src/App.jsx`.
