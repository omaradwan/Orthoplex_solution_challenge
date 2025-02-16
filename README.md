# User Management System

This project is a user management system built using PostgreSQL with Docker. The system supports two roles: **Admin** and **User**. The Admin role has elevated privileges, such as the ability to manage users, delete users, and view all user data, while Users have limited access. Two Admin users are created when the server is initially set up.

## Table of Contents
- [Overview](#overview)
- [Roles and Privileges](#roles-and-privileges)
- [Technologies Used](#technologies-used)
- [Setup](#setup)
- [Running the Application](#running-the-application)
- [Database Management](#database-management)

## Overview

The user management system allows for the creation, deletion, and management of users. There are two roles:
1. **Admin**: Admins have full control over the system. They can:
   - View all users.
   - Create, update, and delete users.
   - Access sensitive data.
2. **User**: Regular users have limited privileges. They can:
   - View and update their own profile.
   - Access non-sensitive data.

At the initial setup of the system, two Admin users are created automatically. These Admins have more privileges than regular Users, including the ability to delete users and view all users.

## Roles and Privileges

### Admin
- **Create users**: Admins can add new users to the system.
- **Delete users**: Admins can delete any user.
- **View all users**: Admins can see a list of all users.
- **Modify users**: Admins can modify user details and roles.
  
### User
- **View and update own profile**: Users can update their personal information and change their password.
- **Access non-sensitive data**: Users can view publicly available data, but cannot access administrative data or delete other users.

The system is designed to ensure that only Admin users can perform sensitive actions, such as deleting users or viewing all user data. Regular users are restricted from performing these actions.

## Technologies Used

- **PostgreSQL**: Used for storing user data and handling database operations.
- **Docker**: Containerization for consistent development and deployment environments.
- **pgAdmin**: Web-based database management tool to interact with PostgreSQL.
- **Docker Compose**: Used to define and run multi-container Docker applications.

 ## API Testing with Postman

To test the API endpoints, I used **Postman**. You can view and import the Postman collection for the API from the following link:

[Postman Collection - API Testing](https://web.postman.co/documentation/31765464-3076ddf1-8796-474d-8475-03fc4306e595/publish?workspaceId=873661cf-9c8b-43aa-8951-35aad6068032)
This collection includes all the API endpoints available for this project, along with sample requests and responses.

## Database Design
![image](https://github.com/user-attachments/assets/c013875b-c637-4490-b065-ad181b91d916)

### Sample Endpoints
- `GET /users`
- `POST /users/create`





## Setup

### 1. Clone the Repository
Clone this repository to your local machine:
```bash
git clone https://github.com/your-username/user-management-app.git
docker-compose up  for containers
