# 📱 Expense Tracker App

## 🌟 Overview
A modern mobile application built with React Native for tracking personal expenses and managing finances efficiently. This app helps users monitor their spending habits, manage multiple wallets, and visualize their financial data through statistics.

## ✨ Features
- 💰 Multiple wallet management
- 📊 Transaction tracking and categorization
- 📈 Statistical analysis of expenses
- 👤 User authentication and profile management
- 🔍 Search functionality for transactions
- 📱 Modern and responsive UI

## 🛠️ Tech Stack
- React Native
- Firebase (Authentication & Database)
- TypeScript
- TailwindCSS (for styling)
- Reanimation
- Expo

## 🚀 Getting Started

### Prerequisites
- Node.js (v20 or higher)
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository
```bash
git clone [your-repo-link]
```

2. Install dependencies
```bash
npm install
```

3. Configure Firebase
- Create a Firebase project
- Add your Firebase configuration in `config/firebase.ts`

4. Start the development server
```bash
npm start
```

## 📱 App Structure

```
├── app/                  # Main application screens
│   ├── (auth)/          # Authentication screens
│   ├── (modals)/        # Modal components
│   └── (tabs)/          # Tab-based navigation screens
├── components/          # Reusable components
├── config/             # Configuration files
├── constants/          # Constants and theme
├── context/            # Context providers
├── hooks/              # Custom hooks
├── service/            # API and service functions
└── utils/              # Utility functions
```

## 🔐 Authentication
The app uses Firebase Authentication for user management, supporting:
- Email/Password login
- User registration
- Profile management

## 💾 Data Management
- Transactions are stored in Firebase
- Real-time updates for transaction data
- Secure data access and management

## 🎨 UI/UX Features
- Custom animated components
- Responsive design
- Dark/Light theme support
- Intuitive navigation

## 📝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.


---

⭐️ If you found this project helpful, please give it a star!
