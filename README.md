<<<<<<< HEAD
# Gold and Silver Price Calculator System

A web-based Gold and Silver Calculator System built with Vue.js 3, featuring user authentication and real-time price calculations.

## Features

- **User Authentication**
  - User registration with validation
  - Secure login system
  - Protected routes (calculator accessible only after login)
  - Session persistence using localStorage

- **Price Calculator**
  - Support for Gold and Silver
  - Purity selection (18K, 22K, 24K for gold; 92.5%, 99.9% for silver)
  - Weight input in grams
  - Current market rate input
  - Making charge calculation (percentage-based)
  - Automatic tax calculation (12% fixed rate)
  - Real-time calculation and result display

- **User Interface**
  - Modern, responsive design
  - Form validation with error messages
  - User-friendly interface
  - Beautiful gradient styling

## Calculation Formula

```
Total Amount = (grams × metal rate) + making charge + 12% tax
```

Where:
- **Metal Rate**: Market rate adjusted for purity (weight × rate × purity percentage)
- **Making Charge**: Percentage of base price
- **Tax**: 12% of (base price + making charge)

## Project Structure

```
src/
├── composables/
│   └── useAuth.js          # Authentication state management
├── router/
│   └── index.js            # Vue Router configuration with guards
├── views/
│   ├── LoginView.vue       # Login page
│   ├── RegisterView.vue    # Registration page
│   └── CalculatorView.vue  # Calculator page (protected)
├── App.vue                 # Root component
└── main.js                 # Application entry point
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Usage

1. **Register**: Create a new account by providing your name, email, and password
2. **Login**: Sign in with your registered credentials
3. **Calculate**: 
   - Select metal type (Gold or Silver)
   - Choose purity level
   - Enter weight in grams
   - Enter current market rate per gram
   - Enter making charge percentage
   - Click "Calculate" to see the detailed breakdown and total amount

## Technologies Used

- Vue.js 3 (Composition API)
- Vue Router 4
- Vite
- LocalStorage (for user data persistence)

## Notes

- User data is stored in browser localStorage (for demo purposes)
- In a production environment, this should be replaced with a proper backend API
- Passwords are stored in plain text (for demo only - should be hashed in production)
=======
# gold-silver-calculator
Activity3
>>>>>>> 709ce6a3b41ad0985370dda72ebcb8277f58ebe9
