# PocketCloud – Secure File Storage & Sharing

PocketCloud is a minimal and secure file storage service that allows users to upload files, manage them, and share access publicly using file keys. The system supports authentication and optimal handling of expired access keys and stored files.

## Features

- User authentication (signup and login)
- Upload files (up to 10MB limit)
- Retrieve all uploaded files for authenticated users
- Access individual files publicly via file ID
- Retrieve expired file keys
- Cleanup of expired files
- Automatic file expiration with configurable expiration hours (default: 78 hours)
- Presigned URLs for secure file access

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Bun |
| Backend | Node.js, Express.js |
| Database | PostgreSQL (via TypeORM) |
| Authentication | JWT |
| Storage | AWS S3 |
| Containerization | Docker (optional) |

## Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/pocketcloud.git
cd pocketcloud
```

### 2. Install Dependencies

```bash
bun install
```

Or using npm:

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3002
DATABASE_URL=<your-postgresql-connection-url>
JWT_SECRET=<your-jwt-secret>
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=<your-aws-access-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret-key>
AWS_S3_BUCKET=<your-s3-bucket-name>
BASE_URL=http://localhost:3002
```

**Required Environment Variables:**
- `PORT` - Server port (default: 3002)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT token signing
- `AWS_REGION` - AWS region for S3 (default: ap-south-1)
- `AWS_ACCESS_KEY_ID` - AWS access key ID
- `AWS_SECRET_ACCESS_KEY` - AWS secret access key
- `AWS_S3_BUCKET` - S3 bucket name for file storage
- `BASE_URL` - Base URL for generating file links

### 4. Run the Server

```bash
bun run src/server.ts
```

Or using npm:

```bash
npm run dev
```

The server will start on port 3002 (or the port specified in your `.env` file).

## Running with Docker

### Build Image

```bash
docker build -t pocketcloud .
```

### Run Container

```bash
docker run -p 3002:3002 \
  -e PORT=3002 \
  -e DATABASE_URL="<your postgresql url>" \
  -e JWT_SECRET="<your secret>" \
  -e AWS_REGION="ap-south-1" \
  -e AWS_ACCESS_KEY_ID="<your aws access key>" \
  -e AWS_SECRET_ACCESS_KEY="<your aws secret key>" \
  -e AWS_S3_BUCKET="<your s3 bucket>" \
  -e BASE_URL="http://localhost:3002" \
  pocketcloud
```

## API Endpoints

### Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login and receive JWT token |

**Signup Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Login Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Login Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### File Endpoints (`/api`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/upload` | Yes | Upload a file (max 10MB) |
| GET | `/api/files` | Yes | Fetch all files of authenticated user |
| GET | `/api/files/:fileId` | No | Public access to a specific file by ID |
| GET | `/api/files/expired-keys` | Yes | Retrieve expired file keys |
| DELETE | `/api/expired` | No* | Delete expired files |

*Add authentication if required for your deployment.

**Upload File:**
- Method: `POST /api/upload`
- Headers: `Authorization: Bearer <token>`, `Content-Type: */*`
- Query Parameters:
  - `fileName` (optional): Name of the file
  - `fileType` (optional): Type of file (default: 'txt')
  - `expirationHours` (optional): Hours until expiration (default: 78)
- Body: Raw binary file data (max 10MB)

**Upload Response:**
```json
{
  "message": "File uploaded successfully",
  "fileId": "12345",
  "fileName": "document.pdf",
  "expirationHours": 78,
  "publicLink": "http://localhost:3002/files/12345"
}
```

**Get User Files Response:**
```json
{
  "files": [
    {
      "id": "12345",
      "name": "document.pdf",
      "fileType": "pdf",
      "createdAt": "2025-01-12T10:00:00Z",
      "expirationTime": "2025-01-15T16:00:00Z",
      "presignedUrl": "https://s3.amazonaws.com/..."
    }
  ],
  "count": 1
}
```

**Get File by ID Response:**
```json
{
  "file": {
    "id": "12345",
    "name": "document.pdf",
    "fileType": "pdf",
    "createdAt": "2025-01-12T10:00:00Z",
    "expirationTime": "2025-01-15T16:00:00Z"
  },
  "presignedUrl": "https://s3.amazonaws.com/..."
}
```

**Get Expired File Keys Response:**
```json
{
  "files": [
    {
      "id": "12345",
      "s3Key": "files/12345"
    }
  ]
}
```

**Delete Expired Files Response:**
```json
{
  "deletedCount": 5
}
```

## Error Responses

- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing or invalid token)
- `404` - File not found
- `410` - File has expired
- `500` - Internal server error

## Project Structure

```
PocketCloud/
├── src/
│   ├── config/
│   │   └── db.ts              # Database configuration
│   ├── controllers/
│   │   ├── authController.ts  # Authentication handlers
│   │   └── fileController.ts  # File operation handlers
│   ├── entities/
│   │   ├── File.ts            # File entity model
│   │   └── User.ts            # User entity model
│   ├── middleware/
│   │   └── auth.ts            # JWT authentication middleware
│   ├── repositories/
│   │   ├── fileRepository.ts  # File database operations
│   │   └── userRepository.ts  # User database operations
│   ├── routes/
│   │   ├── auth.ts            # Authentication routes
│   │   └── file.ts            # File routes
│   ├── services/
│   │   ├── cleanupService.ts  # Expired file cleanup service
│   │   ├── fileService.ts     # File business logic
│   │   └── s3Service.ts       # AWS S3 integration
│   ├── app.ts                 # Express app configuration
│   └── server.ts              # Server entry point
├── Dockerfile
├── package.json
├── tsconfig.json
└── README.md
```

## Development

This project uses:
- **Bun** as the JavaScript runtime
- **TypeScript** for type safety
- **TypeORM** for database operations
- **Express.js** for the web framework
- **AWS SDK v3** for S3 integration

## License

[Add your license here]
