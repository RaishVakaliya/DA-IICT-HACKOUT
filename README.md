# HyDit - Hybrid Digital Platform

A modern web application built with React, TypeScript, and TailwindCSS, featuring a clean and responsive user interface with Clerk authentication.

## Features

- **Blazing Fast** - Built with Vite for optimal performance
- **Modern UI** - Beautifully designed with TailwindCSS and Radix UI components
- **Secure Authentication** - Integrated with Clerk for user management
- **Developer Friendly** - TypeScript support and ESLint for code quality

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: TailwindCSS, Radix UI
- **Authentication**: Clerk
- **Database**: Convex
- **State Management**: React Context
- **Routing**: React Router Dom
- **Build Tool**: Vite
- **Payment Processing**: Stripe

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/RaishVakaliya/DA-IICT-HACKOUT.git
   cd DA-IICT-HACKOUT
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory and add the following variables:

   ```env
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   # Add other environment variables as needed
   ```

4. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open in browser**
   The application will be available at `http://localhost:5173`

## 🛠 Build

```bash
# Build for production
npm run build

# Preview the production build
npm run preview
```

## Project Structure

```
src/
├── assets/           # Static assets (images, fonts, etc.)
├── components/       # Reusable UI components
│   └── ui/          # Radix UI components
├── context/          # React context providers
├── lib/              # Utility functions and helpers
├── pages/            # Application pages/routes
└── providers/        # Application providers
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
