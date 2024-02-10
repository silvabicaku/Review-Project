# Project Description: Build a User Review System

Project Structure:
controllers: contains the controller classes for handling user requests.
middlewares: Contains authentication and authorization middleware
models: Defines database models (e.g., User, Review)
routes: Defines API routes and their corresponding controllers
services: Provides utility functions for interacting with the database or external services

Design Decisions
Used Node.js for backend development due to its non-blocking I/O and event-driven architecture, suitable for handling concurrent requests.
Chose Express.js as the web framework for its simplicity and flexibility in building RESTful APIs.
Implemented JWT-based authentication for stateless authentication and improved security.
Used MongoDB as the database for its scalability and flexibility in handling unstructured data

Setting up the project:
package.json: Includes dependencies such as express, mongoose, bcryptjs, jsonwebtoken, and nodemon.
app.js: Imports required modules: express, body-parser, mongoose, authRoutes, and reviewRoutes.
Creates a new Express.js application and sets up middleware to parse JSON request bodies.
Defines a middleware function to set CORS headers.
Uses authRoutes and reviewRoutes modules to handle authentication and review-related routes.
Defines an error handling middleware function to log errors and send JSON responses.
Connects to a MongoDB database using mongoose.connect().
Starts the web server using app.listen() if the connection is successful.
Logs any errors during the connection to the console.
In development mode, starts the server using nodemon instead of plain node.

Coding Conventions
Used asynchronous functions and Promises for handling asynchronous operations to avoid blocking the event loop.

REST Calls
User Registration
PUT /signup
Description: Allows users to register with their details.
Request Body:
{
"email": String,
"password": String,
"name":String,
"isAdmin":boolean
}
Response:
{
message: "User created!",
userId: String
}

User login
POST /login
Description: Takes an email and password as input for users to log in
Request Body:
{
"email": "example@example.com",
"password": "password123"
}
Response:
{
"token": "String",
"userId": "String"
}
401 for "User not found!" or "Wrong password!"
200 for a successful login with the token and user ID.
422 for validation error (e.g., missing fields)

User profile
GET /user/userId
Returns information about a specific user by userID. Requires a valid JWT from header
Response:
{
"userId": "string",
"username": "string",
"email": "string"
}
It is sent with a status code of 200. If there are validation errors, the response will be an error object with a status code of 422 and an array of validation errors

Update User Profile
PATCH /user/:userId
Description: Allows authenticated users or Admins to update their profile information.
Request Body:
Same format as User Signup request body but only including changes. For example:
{
"name": "string",
"password": "string",
"email": "string"
}
Response:
200 OK on successful user profile update
400 Bad Request if invalid data is provided
403 Forbidden if attempting to update another user's profile
401 Unauthorized if no valid JWT present in header
422 Unprocessable Entity if there are any validation errors

Delete User Account
DELETE /user/:userId
Description: Deletes a specified user, given a valid JWT from the header of an admin account or from the same user who owns that userId. Returns status code 204 No Content upon success.
Description: Deletes an existing user account along with all associated data. Only accessible to admins.
Request Body: None
Response:message saying that the user has been deleted.

Review Listings
Create a Review
PUT /reviews
Description: Allows authenticated users to create a review.
Request Body:
{
"rate": "number",
"description": "string"
}
Response:
201 Created on successful review creation
400 Bad Request if invalid data is provided
401 Unauthorized if no valid JWT present in header

Get Reviews
POST /reviews/:reviewId,
Description:Returns the specified review searched but the reviewId
Request Body:None
Response:
{
"message": "Review created successfully!",
"review": {
"userId": "String",
"rate": number,
"description": "String",
"\_id": "string",
"\_\_v": number
},
"user": {
"\_id": string,
"name": String,
"isAdmin": boolean,
"nrOfReviews": number
}
}

Update a Review
PATCH /reviews/:reviewId
Description: Allows authenticated users to update their own review.
Request Body:
{
"rate": "number",
"description": "string"
}
Response:
200 OK on successful review update,and the body response contains the updated review object.
400 Bad Request if invalid data is provided
403 Forbidden if attempting to update another user's review
401 Unauthorized if no valid JWT present in header

Delete a Review
DELETE /reviews/:reviewId
Description: Allows authenticated users to delete their own review and Admins has premission to delete any reviews.
Request Body:none
Response:
message: "Review deleted successfully!"
204 No Content on successful review deletion
403 Forbidden if the user is not an admin
401 Unauthorized if there is no valid JWT present in the header
