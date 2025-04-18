# VIT Bhopal Hostel Management System

This project is a web-based Hostel Management System for VIT Bhopal, featuring a chatbot for answering common hostel-related queries.

## Features
- Chatbot with FAQ-based responses for hostel queries (fees, rules, parents, ragging, room selection, etc.)
- Modern React frontend
- Easily extensible FAQ: just add new Q&A pairs in `frontend/src/Chatbot.tsx`

## Getting Started

### Prerequisites
- Node.js (v16 or higher recommended)
- npm

### Running the Project

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
   This will concurrently start both frontend and backend servers (if configured).

3. Open your browser and navigate to the provided local address (usually `http://localhost:3000` or `http://localhost:5173`).

### Directory Structure
```
VIT_Bhopal_Hostel/
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   └── Chatbot.tsx
│   └── ...
├── backend/ (if present)
└── README.md
```

## Customizing the Chatbot
- To add or update answers, edit the `faq` object in `frontend/src/Chatbot.tsx`.
- The chatbot uses string similarity to match user questions to FAQ entries.

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
This project is for educational/demo purposes.
