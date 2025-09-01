# Profile API Documentation

## Edit Profile API

### Endpoint: `PUT /api/profile/edit`

This API allows users to update their profile information including name, email, and profile image.

**Authentication Required:** Yes (Bearer Token)

**Content-Type:** `multipart/form-data` (for file uploads)

### Request Parameters:

- **name** (optional): String - User's name
- **email** (optional): String - User's email address
- **profileImage** (optional): File - Profile image (supports: jpg, jpeg, png, gif, etc.)

### Example Request:

```bash
curl -X PUT \
  http://localhost:3000/api/profile/edit \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -F 'name=John Doe' \
  -F 'email=john.doe@example.com' \
  -F 'profileImage=@/path/to/image.jpg'
```

### Example Response:

```json
{
  "message": "Profile updated successfully",
  "statusCode": 200,
  "user": {
    "userId": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "profileImage": "/uploads/profileImage-1234567890-123456789.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### Get Profile API

### Endpoint: `GET /api/profile`

This API retrieves the current user's profile information.

**Authentication Required:** Yes (Bearer Token)

### Example Request:

```bash
curl -X GET \
  http://localhost:3000/api/profile \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### Example Response:

```json
{
  "statusCode": 200,
  "user": {
    "userId": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "profileImage": "/uploads/profileImage-1234567890-123456789.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### Error Responses:

- **400 Bad Request**: Invalid data or email already taken
- **401 Unauthorized**: Missing or invalid token
- **404 Not Found**: User not found
- **500 Internal Server Error**: Server error

### Notes:

1. All fields are optional - you can update just the fields you want to change
2. Email validation ensures no duplicate emails across users
3. Profile images are stored in the `/uploads` directory
4. Old profile images are automatically deleted when a new one is uploaded
5. Image file size limit: 5MB
6. Supported image formats: jpg, jpeg, png, gif, etc.
