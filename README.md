# FertiShop - Online Fertilizer Store

A modern e-commerce application for selling fertilizers and related products. This project includes:

- React/Next.js frontend with a clean, responsive UI
- Python/Flask backend API with SQLite database
- Authentication system
- Product catalog and search functionality
- Shopping cart and order management

## Project Structure

- `/app` - Next.js frontend application pages
- `/components` - Reusable React components
- `/lib` - Frontend utilities and data models
- `/backend` - Python Flask REST API

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```
cd backend
```

2. Create a virtual environment (optional but recommended):
```
python -m venv venv
```

3. Activate the virtual environment:
- Windows: `venv\Scripts\activate`
- Mac/Linux: `source venv/bin/activate`

4. Install dependencies:
```
pip install -r requirements.txt
```

5. Initialize the database:
```
python init_db.py
```

6. Start the backend server:
```
python run.py
```

The backend will run at `http://localhost:5000`.

### Frontend Setup

1. Make sure you have Node.js installed.

2. Install dependencies (from the project root):
```
npm install --legacy-peer-deps
```

3. Start the development server:
```
npm run dev
```

The frontend will run at `http://localhost:3000`.

## Demo Credentials

For testing, use the following login:
- Email: demo@example.com
- Password: password

## Features

- Responsive design for mobile and desktop
- User authentication and account management
- Product browsing and filtering
- Shopping cart functionality
- Checkout process
- Order history and tracking

## Technologies Used

### Frontend
- Next.js 13+ (React framework)
- TypeScript
- Tailwind CSS for styling
- Shadcn/UI component library

### Backend
- Python 3.8+
- Flask web framework
- SQLite database
- JWT authentication
- RESTful API design
- Object-Oriented Programming 

## How The System Works

### Frontend Architecture
- **Next.js App Router**: Uses the latest Next.js App Router for efficient page routing and server components
- **Client-Server Model**: Employs a hybrid approach with server components for SEO and client components for interactivity
- **State Management**: Utilizes React context for global state management (cart, auth, etc.)
- **API Integration**: Custom API client that handles authentication, request formatting, and error handling
- **Responsive Design**: Built with a mobile-first approach using Tailwind CSS for adaptive layouts

### Backend Architecture
- **RESTful API**: Structured around resource-based endpoints following REST principles
- **MVC Pattern**: Organized with Models for data structure, Controllers for logic, and Routes for API endpoints
- **Authentication**: JWT-based authentication with token refresh mechanism
- **Database**: SQLite for simplicity, with models for Users, Products, Categories, Orders, etc.
- **Error Handling**: Comprehensive error handling with appropriate HTTP status codes and informative messages

### System Workflow
1. **User Authentication**: JWT-based auth flow with secure token storage
2. **Product Discovery**: Browsing categories, featured products, and search functionality
3. **Shopping Experience**: Adding products to cart, adjusting quantities, and removing items
4. **Checkout Process**: Address entry, order review, and order placement
5. **Order Management**: Order history viewing and status tracking
6. **Admin Functions**: Product management, inventory control, and order processing

## Use Cases

### For Customers
- **Home Gardeners**: Can purchase small quantities of specialized fertilizers
- **Small-scale Farmers**: Access to bulk ordering of essential agricultural inputs
- **Commercial Growers**: Enterprise accounts with customized pricing
- **Educational Institutions**: Special packages for agricultural programs and research

### For Business Owners
- **Inventory Management**: Track stock levels and get alerts for low inventory
- **Sales Analytics**: Monitor product performance and customer purchasing patterns
- **Marketing Campaigns**: Run promotions and discounts on specific product categories
- **Customer Relationship**: Build customer profiles based on purchase history
- **Supply Chain**: Manage relationships with suppliers and track incoming inventory

## Known Issues and Limitations

### Current Limitations
- **Payment Processing**: Currently uses a simulated payment gateway; integration with real payment processors needed for production
- **Shipping Calculation**: Fixed shipping rates that don't account for weight or distance
- **Inventory Management**: Basic inventory tracking without advanced features like backorders
- **User Permissions**: Limited role-based access control system
- **Mobile Experience**: While responsive, native mobile apps would provide better user experience
- **Localization**: Currently supports only English language and USD currency

### Potential Issues
- **Performance**: May experience slowdowns with large product catalogs or high traffic
- **Scalability**: SQLite database may become a bottleneck with significant growth
- **Security**: Requires additional hardening for production deployment
- **Browser Compatibility**: Optimized for modern browsers; may have issues with older versions
- **Image Optimization**: Large product images may affect page load performance
- **API Rate Limiting**: No rate limiting implemented for API endpoints

## Troubleshooting

### Fixing Common Errors
1. **Backend Connection Errors**
   - Make sure both backend and frontend are running
   - Verify that the API URL in .env.local is correct
   - Check for CORS issues in the browser console
   - For Windows users, try using `start.bat` which opens separate terminal windows for better visibility into errors 