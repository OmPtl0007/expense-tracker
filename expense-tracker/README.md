# Expense Tracker Application

A full-stack expense tracking application built with the MERN stack (MongoDB, Express.js, React.js, Node.js). Features comprehensive income/expense categorization, monthly/yearly summaries, analytics with charts, and secure authentication.

![Dashboard Preview](./docs/dashboard.png)

## Features

- **User Authentication**: JWT-based secure authentication with password hashing
- **Transaction Management**: Full CRUD operations for income and expense transactions
- **Category Management**: Custom categories with color coding and icons
- **Monthly & Yearly Summaries**: Aggregated financial data with breakdowns
- **Analytics Dashboard**: Interactive charts showing spending trends and category distribution
- **Responsive Design**: Mobile-friendly UI with TailwindCSS
- **Secure APIs**: Rate limiting, input validation, NoSQL injection prevention

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Joi** - Input validation
- **Helmet** - Security headers
- **express-rate-limit** - Rate limiting

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router 6** - Routing
- **Axios** - HTTP client
- **Recharts** - Charts library
- **TailwindCSS** - Styling

## Project Structure

```
expense-tracker/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and app configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Helper functions
│   │   └── app.js           # Express app setup
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── common/      # Shared components (Header, Modal)
│   │   │   ├── transactions/
│   │   │   ├── categories/
│   │   │   └── analytics/
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── context/         # React Context providers
│   │   ├── services/        # API service layer
│   │   ├── utils/           # Helper functions
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd expense-tracker
   ```

2. **Set up Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   ```

3. **Set up Frontend**
   ```bash
   cd ../frontend
   npm install
   cp src/.env.example src/.env
   ```

4. **Start Development Servers**

   Backend (in one terminal):
   ```bash
   cd backend
   npm run dev
   # Server runs on http://localhost:5000
   ```

   Frontend (in another terminal):
   ```bash
   cd frontend
   npm run dev
   # App runs on http://localhost:5173
   ```

## Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expense_tracker
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7
FRONTEND_URL=http://localhost:5173
```

### Frontend (src/.env)
```env
VITE_API_URL=http://localhost:5000/api/v1
```

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/register` | Register new user | No |
| POST | `/api/v1/auth/login` | Login user | No |
| GET | `/api/v1/auth/logout` | Logout user | Yes |
| GET | `/api/v1/auth/me` | Get current user | Yes |
| PUT | `/api/v1/auth/updatedetails` | Update user details | Yes |
| PUT | `/api/v1/auth/updatepassword` | Update password | Yes |
| POST | `/api/v1/auth/forgotpassword` | Request password reset | No |
| PUT | `/api/v1/auth/resetpassword/:token` | Reset password | No |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/transactions` | Get all transactions (with filters) |
| GET | `/api/v1/transactions/:id` | Get single transaction |
| POST | `/api/v1/transactions` | Create new transaction |
| PUT | `/api/v1/transactions/:id` | Update transaction |
| DELETE | `/api/v1/transactions/:id` | Delete transaction |
| GET | `/api/v1/transactions/stats/overview` | Get transaction statistics |

**Query Parameters for GET /transactions:**
- `type` - Filter by 'income' or 'expense'
- `category` - Filter by category ID
- `startDate` - Filter from date (ISO format)
- `endDate` - Filter to date (ISO format)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `sort` - Sort field (default: '-createdAt')

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/categories/init` | Initialize default categories |
| GET | `/api/v1/categories` | Get all categories |
| GET | `/api/v1/categories/:id` | Get single category |
| POST | `/api/v1/categories` | Create new category |
| PUT | `/api/v1/categories/:id` | Update category |
| DELETE | `/api/v1/categories/:id` | Delete category |
| GET | `/api/v1/categories/defaults/list` | Get default categories |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/analytics/dashboard` | Get dashboard overview |
| GET | `/api/v1/analytics/monthly` | Get monthly summary |
| GET | `/api/v1/analytics/yearly` | Get yearly summary |
| GET | `/api/v1/analytics/trends` | Get spending trends |
| GET | `/api/v1/analytics/category-comparison` | Get category breakdown |

## Data Models

### User
```javascript
{
  name: String,
  email: String (unique, required),
  password: String (hashed, required),
  role: String (user/admin),
  createdAt: Date,
  updatedAt: Date
}
```

### Transaction
```javascript
{
  amount: Number (required, min: 0.01),
  type: String (income/expense, required),
  category: ObjectId (ref: Category, required),
  description: String,
  date: Date,
  user: ObjectId (ref: User, required),
  createdAt: Date,
  updatedAt: Date
}
```

### Category
```javascript
{
  name: String (required),
  type: String (income/expense, required),
  icon: String,
  color: String (hex color),
  user: ObjectId (ref: User, required),
  isDefault: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Default Categories

The app comes with pre-configured categories:

**Income:** Salary, Business, Investments, Gifts, Other Income

**Expense:** Food & Dining, Transportation, Shopping, Entertainment, Bills & Utilities, Healthcare, Housing, Education, Personal Care, Other Expense

## Security Features

- Password hashing with bcrypt (12 salt rounds)
- JWT token authentication with expiration
- Input validation using Joi
- NoSQL injection prevention (express-mongo-sanitize)
- XSS protection (xss-clean)
- Rate limiting (100 requests per 15 minutes)
- CORS configuration
- Security headers (Helmet)

## Production Deployment

### Backend
```bash
cd backend
npm install
npm run start
# Or use PM2: pm2 start server.js --name expense-tracker-api
```

### Frontend
```bash
cd frontend
npm run build
# Deploy the 'dist' folder to your hosting provider
```

## Testing

Run tests with:
```bash
# Backend
cd backend
npm test
```

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

Built with ❤️ using the MERN Stack
