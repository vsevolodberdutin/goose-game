# The Last of Guss - Goose Tapping Game

A browser-based multiplayer game where players compete to tap a virtual goose that has mutated with G-42, racing to achieve the highest score.

## Features

### Authentication
- Simple username/password login
- Automatic account creation for new users
- Admin access with special credentials (username: "admin", password: "pass")

### Rounds Management
- View list of active and scheduled rounds
- Admin-only: Create new rounds
- Real-time round status updates

### Gameplay
- Interactive ASCII art goose
- Tap the goose to increase your score
- Real-time countdown timer
- Live score updates
- End-of-round statistics (total taps, winner, personal score)

## Technology Stack

- **Frontend Framework:** React 18 with TypeScript
- **Routing:** React Router v7
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** React Hooks (useState, useEffect)

## Getting Started

### Prerequisites
- Node.js 20.17.0 or higher
- Yarn package manager

### Installation

1. Clone the repository
2. Navigate to the project directory:
   ```bash
   cd goose-game
   ```

3. Install dependencies:
   ```bash
   yarn install
   ```

4. Start the development server:
   ```bash
   yarn dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
yarn build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
yarn preview
```

## Project Structure

```
goose-game/
├── src/
│   ├── pages/
│   │   ├── AuthPage.tsx          # Login/registration page
│   │   ├── RoundsListPage.tsx    # List of all rounds
│   │   └── RoundDetailPage.tsx   # Individual round gameplay
│   ├── services/
│   │   └── api.ts                # API service for backend communication
│   ├── types/
│   │   └── index.ts              # TypeScript type definitions
│   ├── App.tsx                   # Main app component with routing
│   ├── main.tsx                  # App entry point
│   └── index.css                 # Global styles
├── public/                       # Static assets
├── index.html                    # HTML template
├── package.json                  # Dependencies and scripts
├── tailwind.config.js            # Tailwind CSS configuration
├── vite.config.ts                # Vite configuration
└── tsconfig.json                 # TypeScript configuration
```

## API Integration

The application integrates with the backend API at `http://v2991160.hosted-by-vdsina.ru`

### API Endpoints Used:
- `POST /auth/login` - User authentication
- `GET /rounds` - Get list of rounds
- `GET /rounds/:id` - Get round details
- `POST /rounds` - Create new round (admin only)
- `POST /rounds/:id/tap` - Tap the goose
- `GET /rounds/:id/stats` - Get round statistics

## Game Rules

1. **Login**: Enter your username and password (new accounts are created automatically)
2. **Select a Round**: Choose an active or scheduled round from the list
3. **Wait for Start**: If the round is scheduled, wait for the start time
4. **Tap Away**: Once active, tap the goose as many times as possible before time runs out
5. **View Results**: See the final statistics including the winner and your score

## Admin Features

Users logged in with admin credentials can:
- Create new rounds via the "Create New Round" button
- Automatically navigate to newly created rounds

## Development

### Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn lint` - Run ESLint

### Code Style

The project follows these conventions:
- Multi-line className formatting for better readability
- Functional components with hooks
- TypeScript for type safety
- Async/await for API calls

## Browser Support

Modern browsers with ES6+ support:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project was created as a test task.
