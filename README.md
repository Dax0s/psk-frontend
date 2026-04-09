# Frontend Template

A modern React application template with authentication, routing, and beautiful UI components.

## Tech Stack

- **Language**: TypeScript 5.7.2
- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.3.1
- **Router**: TanStack Router (latest)
- **State Management**: TanStack React Query 5.95.2
- **Styling**: Tailwind CSS 4.1.18
- **UI Components**: shadcn/ui with b0 preset (radix-ui based)
- **Authentication**: react-oidc-context 3.3.1 + oidc-client-ts 3.5.0
- **HTTP Client**: ky 1.14.3
- **Internationalization**: i18next 26.0.3 + react-i18next 17.0.2

## Features

- OAuth2/OIDC authentication with AWS Cognito
- Type-safe routing with TanStack Router
- Server state management with React Query
- Beautiful UI components from shadcn/ui
- Internationalization (English and Lithuanian included)
- Dark mode support
- Protected routes
- Responsive design
- Testing setup with Vitest
- Code quality with ESLint, Prettier, and Husky

## Prerequisites

- Node.js 18+ or Bun
- A running backend API (see backend README)
- AWS Cognito user pool (or compatible OIDC provider)

## Getting Started

### 1. Install Dependencies

```bash
npm install
# or
bun install
```

### 2. Configure Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Update the values:

```env
VITE_API_URL='http://localhost:8080'

VITE_COGNITO_AUTHORITY='https://cognito-idp.region.amazonaws.com/user-pool-id'
VITE_COGNITO_DOMAIN='https://your-domain.auth.region.amazoncognito.com'
VITE_COGNITO_CLIENT_ID='your-client-id'
VITE_COGNITO_REDIRECT_URI='http://localhost:3000/'
VITE_COGNITO_LOGOUT_REDIRECT_URI='http://localhost:3000/'
```

### 3. Run Development Server

```bash
npm run dev
# or
bun dev
```

The application will start on `http://localhost:3000`.

## Project Structure

```
src/
├── api/                  # API client and providers
├── components/           # Reusable components
│   ├── app/             # App-specific components (navbar, footer, etc.)
│   └── ui/              # shadcn/ui components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── routes/              # TanStack Router routes (all protected)
│   ├── __root.tsx      # Root layout
│   ├── index.tsx       # Home page with auth check
│   └── logout.tsx      # Logout handler
├── types/               # TypeScript type definitions
└── main.tsx            # App entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

## Features in Detail

### Authentication

The app uses OIDC/OAuth2 authentication with AWS Cognito. The auth flow:

1. User visits the application root (`/`)
2. If not authenticated, automatically redirected to Cognito hosted UI
3. After successful login, redirected back to `/`
4. JWT token automatically included in API requests
5. All routes require authentication by default

The main page (`src/routes/index.tsx`) checks authentication status and redirects to Cognito if needed. See `src/main.tsx` for auth configuration.

### Routing

Routes are defined using TanStack Router's file-based routing. All routes are protected by default:

- `/` - Home page with navbar (requires authentication)
- `/logout` - Logout and redirect

### Internationalization

The app supports multiple languages (English and Lithuanian by default). Add new languages by:

1. Creating a new JSON file in `public/locales/`
2. Updating the language switcher in the user menu

### UI Components

This template uses shadcn/ui components. Add new components:

```bash
npx shadcn@latest add [component-name]
```

See [shadcn/ui documentation](https://ui.shadcn.com/) for available components.

## Customization

This is a template project. Customize it by:

1. Updating branding in translation files (`public/locales/`)
2. Modifying the navbar and other components in `src/components/app/`
3. Adding your own routes in `src/routes/`
4. Customizing the home page content in `src/routes/index.tsx`
5. Customizing theme in `src/styles.css` and Tailwind config

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory. Deploy to:

- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting service

## Environment Variables

Required environment variables:

- `VITE_API_URL` - Backend API URL
- `VITE_COGNITO_AUTHORITY` - OIDC authority URL
- `VITE_COGNITO_DOMAIN` - Cognito domain
- `VITE_COGNITO_CLIENT_ID` - Cognito client ID
- `VITE_COGNITO_REDIRECT_URI` - OAuth redirect URI after login (e.g., `http://localhost:3000/`)
- `VITE_COGNITO_LOGOUT_REDIRECT_URI` - Redirect URI after logout (e.g., `http://localhost:3000/`)

## License

This template is free to use for any project.
