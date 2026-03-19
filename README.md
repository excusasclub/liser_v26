# Liser v26 - AI-Powered Excuse Generator

Liser v26 is a modern web application that uses artificial intelligence to generate creative and context-aware excuses for various situations. Built with React and Flask, it provides a seamless user experience for finding the perfect excuse when you need one.

## Features

- **AI-Powered Generation**: Generates excuses using advanced AI models
- **Modern UI**: Clean, responsive interface with Tailwind CSS
- **User Authentication**: Secure login and profile management
- **Bag List Management**: Create, view, and manage your excuse lists
- **Explore**: Discover trending and popular excuses
- **Saved Excuses**: Save your favorite excuses for quick access

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd liser_v26
   ```

2. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   # Create .env file based on .env.example
   cp .env.example .env
   # Configure your API keys in .env
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

### Running the Application

1. **Start the backend**
   ```bash
   cd backend
   python server.py
   ```

2. **Start the frontend**
   ```bash
   cd frontend
   npm start
   ```

The application will be available at `http://localhost:3000`

## Project Structure

```
liser_v26/
├── backend/              # Flask backend application
│   ├── server.py         # Main server file
│   ├── requirements.txt  # Python dependencies
│   └── .env              # Environment variables
├── frontend/             # React frontend application
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Page components
│   │   ├── context/      # React Context
│   │   └── hooks/        # Custom hooks
│   ├── public/           # Public assets
│   ├── package.json      # Frontend dependencies
│   └── tailwind.config.js# Tailwind configuration
├── memory/               # AI memory and prompts
├── test_reports/         # Test results
└── tests/                # Unit tests
```

## Development

### Adding New Features

1. Create a new branch:
   ```bash
   git checkout -b feature/new-feature
   ```

2. Make your changes in the `frontend/` or `backend/` directories

3. Test your changes

4. Commit and push:
   ```bash
   git add .
   git commit -m "Add new feature"
   git push origin feature/new-feature
   ```

### Running Tests

**Backend Tests**
```bash
cd backend
pytest
```

**Frontend Tests**
```bash
cd frontend
npm test
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
