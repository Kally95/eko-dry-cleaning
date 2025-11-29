# EKO Dry Cleaning - Uniform Ticketing System

A secure, database-backed ticketing system for uniform dry cleaning services at corporate client sites. The system supports both customer self-service and staff-assisted ticket creation, with a comprehensive admin panel for central operations management.

## Overview

### Key Features

- **Dual-Mode Ticket Creation**: Supports both customer self-service and staff-assisted workflows
- **Site-Level Security**: PIN-protected access for each site location
- **Guided User Experience**: Simple, step-by-step flow suitable for first-time users
- **Print-Integrated Workflow**: Built-in ticket printing with enforcement checks
- **Comprehensive Admin Panel**: Full order management, search, filtering, and editing
- **Complete Audit Trail**: Tracks all changes, print history, and order lifecycle
- **Multi-Site Support**: Manages multiple companies and their various site locations

### User Roles

1. **Customers** - End users dropping off uniforms for cleaning (self-service)
2. **On-Site Staff** - Reception/security staff who assist customers or process orders on their behalf
3. **Admins** - Central office staff who manage all orders via the admin panel

## System Architecture

### Technology Stack

#### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod

#### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: Single-page application with state-based navigation

### Project Structure

```
eko-dry-cleaning/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── routes/           # API route definitions
│   │   ├── services/         # Business logic
│   │   ├── middleware/       # Auth and other middleware
│   │   ├── utils/            # Helper functions
│   │   └── index.ts          # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── seed.ts           # Seed data
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API service layer
│   │   ├── stores/           # State management
│   │   └── App.tsx           # Main app component
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd eko-dry-cleaning
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   cd ..
   ```

3. **Set up the database**

   Create a PostgreSQL database:
   ```bash
   createdb eko_dry_cleaning
   ```

4. **Configure environment variables**

   Backend (`backend/.env`):
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/eko_dry_cleaning?schema=public"
   PORT=3001
   NODE_ENV=development
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=http://localhost:5173
   ```

   Frontend (`frontend/.env`):
   ```env
   VITE_API_URL=http://localhost:3001
   ```

5. **Initialize the database**
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

6. **Start the development servers**

   From the root directory:
   ```bash
   npm run dev
   ```

   Or individually:
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev

   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - API Health Check: http://localhost:3001/health

### Default Credentials

After seeding the database, you can use these credentials:

**Admin Login:**
- Email: `admin@eko-cleaning.com`
- Password: `admin123`

**Site PINs:**
- Canary Wharf Tower: `1234`
- The Shard: `5678`
- Liverpool Street Station: `9012`
- Waterloo Station: `3456`

## User Journeys

### Customer/Staff Ticket Creation Flow

1. **Mode Selection**
   - Choose between "I'm a Customer" or "I'm Staff"
   - Determines wording and tracking in the system

2. **Company Selection**
   - Select from available companies
   - Data loaded from central database

3. **Site Selection**
   - Choose specific location for selected company
   - Displays site name and address

4. **PIN Entry**
   - Enter site-specific numeric PIN
   - Security control for location access
   - Different messaging for customer vs staff mode

5. **Order Form**
   - **Customer Details**: Name, phone, email
   - **Garment Selection**: Quantities for each item type
   - **Notes**: Optional alterations or special instructions
   - Real-time item count display
   - Validation ensures at least one item selected

6. **Confirmation**
   - Review all order details
   - Checkbox confirmation required
   - Must trigger print before finishing
   - "Print Ticket" button
   - "Finish & Submit" button (enabled after printing)

7. **Success**
   - Display ticket reference and order summary
   - Options to:
     - Print ticket again
     - Create new ticket for same site
     - Change site or company

### Admin Panel Workflow

1. **Login**
   - Email and password authentication
   - JWT token issued and stored

2. **Dashboard**
   - View all orders across all sites
   - Search by:
     - Ticket reference
     - Customer name
     - Customer email
   - Filter by:
     - Status
     - Date range
   - Pagination for large datasets

3. **Order Details**
   - View complete order information
   - See customer details, site, items, notes
   - View change history and audit trail
   - Edit capabilities:
     - Update customer details
     - Change order status
     - Modify notes
     - Adjust garment quantities
   - Reprint tickets
   - All changes logged with timestamp and admin user

## Database Schema

### Core Models

#### AdminUser
- Admin panel authentication
- Tracks who makes changes

#### Company
- Client companies (e.g., Securicorp, Fortress Security)
- One-to-many with Sites

#### Site
- Physical locations for each company
- Has unique PIN for access control
- Address and contact information

#### Order
- Main ticket/order record
- Links to Company and Site
- Customer information
- Status tracking (SUBMITTED, IN_CLEANING, READY_FOR_COLLECTION, COLLECTED, CANCELLED)
- Print tracking
- Created by (CUSTOMER or STAFF)

#### GarmentType
- Available uniform items
- Display order for UI
- Active/inactive flag

#### OrderItem
- Garment quantities for each order
- Links Order to GarmentType

#### PrintLog
- Tracks every print attempt
- Timestamp and identifier

#### OrderChangeLog
- Complete audit trail
- Tracks field-level changes
- Records who made changes and when

## API Documentation

### Public Endpoints (No Authentication)

```
GET  /api/companies                      # List all companies
GET  /api/companies/:companyId/sites     # List sites for company
POST /api/sites/verify-pin               # Verify site PIN
GET  /api/garment-types                  # List available garment types
POST /api/orders                         # Create new order
GET  /api/orders/:orderId                # Get order details
POST /api/orders/:orderId/print          # Record print attempt
```

### Admin Endpoints (Require Authentication)

```
POST /api/admin/login                    # Admin login
GET  /api/admin/me                       # Get current admin user
GET  /api/admin/orders                   # Search/filter orders
GET  /api/admin/orders/:orderId          # Get order with full details
PUT  /api/admin/orders/:orderId          # Update order
POST /api/admin/orders/:orderId/reprint  # Reprint ticket
GET  /api/admin/statistics               # Get order statistics
GET  /api/admin/companies                # Get companies (for filters)
GET  /api/admin/sites                    # Get sites (for filters)
```

### Authentication

Admin endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

## Security Features

### Implemented Security

1. **Site-Level PINs**: Each site has unique numeric PIN
2. **Admin Authentication**: JWT-based auth for admin panel
3. **Password Hashing**: bcrypt for admin passwords
4. **Input Validation**: Zod schemas for all inputs
5. **CORS**: Configured for specific frontend origin
6. **SQL Injection Protection**: Prisma ORM with parameterized queries
7. **XSS Protection**: React's built-in sanitization

### Best Practices

- **Environment Variables**: Sensitive config in `.env` files
- **Token Expiry**: JWT tokens expire after configured time
- **HTTPS**: Use HTTPS in production
- **Database Credentials**: Never commit to version control
- **Input Sanitization**: All user inputs validated

## Printing Functionality

### Print Workflow

1. **Confirmation Step**: User must tick checkbox confirming details
2. **Print Trigger**: "Print Ticket" button triggers browser print dialog
3. **Print Logging**: System records each print attempt
4. **Enforcement**: "Finish & Submit" only enabled after print triggered
5. **Reprint**: Available from success screen and admin panel

### Print Layout

- Professional ticket design
- All order details clearly displayed
- Prominent ticket reference
- Warning to place ticket in bag
- Print-friendly CSS (`@media print`)
- Hidden navigation elements when printing

## Development

### Running Tests

```bash
# Backend tests (if implemented)
cd backend && npm test

# Frontend tests (if implemented)
cd frontend && npm test
```

### Database Management

```bash
# Generate Prisma client after schema changes
npx prisma generate

# Push schema changes to database
npx prisma db push

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database
npx prisma db push --force-reset
npx prisma db seed
```

### Adding New Garment Types

Update `backend/prisma/seed.ts` and run:
```bash
cd backend && npx prisma db seed
```

Or add via Prisma Studio or direct database insert.

## Production Deployment

### Environment Setup

1. **Database**: Provision PostgreSQL instance
2. **Environment Variables**: Set production values
   - Secure `JWT_SECRET`
   - Production `DATABASE_URL`
   - HTTPS `FRONTEND_URL`
3. **Build Applications**:
   ```bash
   npm run build
   ```

### Recommended Hosting

- **Backend**: Railway, Render, Fly.io, or AWS
- **Frontend**: Vercel, Netlify, or Cloudflare Pages
- **Database**: Railway, Supabase, or managed PostgreSQL

### Production Checklist

- [ ] Change default admin password
- [ ] Update all site PINs
- [ ] Set strong `JWT_SECRET`
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up database backups
- [ ] Configure logging and monitoring
- [ ] Remove development credentials from seed data
- [ ] Set `NODE_ENV=production`

## Troubleshooting

### Common Issues

**Database Connection Failed**
- Check PostgreSQL is running
- Verify `DATABASE_URL` in `.env`
- Ensure database exists

**Port Already in Use**
- Change `PORT` in backend `.env`
- Update proxy in frontend `vite.config.ts`

**Prisma Client Not Generated**
- Run `npx prisma generate` in backend directory

**CORS Errors**
- Check `FRONTEND_URL` in backend `.env`
- Verify frontend is running on expected port

**Print Not Working**
- Ensure browser print dialog is not blocked
- Check print CSS media queries
- Try different browser

## Future Enhancements

Potential features for future versions:

- [ ] Email notifications (order confirmations, status updates)
- [ ] SMS notifications for order ready
- [ ] QR code generation for tickets
- [ ] Mobile app version
- [ ] Photo upload for damage documentation
- [ ] Payment integration
- [ ] Customer portal for order tracking
- [ ] Automated status updates via API
- [ ] Analytics and reporting dashboard
- [ ] Multi-language support
- [ ] Barcode scanning for collection
- [ ] Integration with dry cleaning management software

## Support and Maintenance

### Backup Strategy

- Regular database backups (recommended: daily)
- Store backups in secure, off-site location
- Test restore procedures regularly

### Monitoring

Recommended metrics to monitor:
- API response times
- Database connection pool
- Failed login attempts
- Order creation rate
- Print failure rate

### Logs

Important log locations:
- Backend: Console output (configure file logging for production)
- Database: PostgreSQL logs
- Web server: Nginx/Apache logs (if applicable)

## License

[Specify your license here]

## Contributing

[Add contribution guidelines if applicable]

## Contact

For support or questions, contact [your contact information]

---

**Built with ❤️ for EKO Dry Cleaning**
