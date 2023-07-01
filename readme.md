# Todo App

The Todo App is a Node.js application built with TypeScript that helps you manage tasks and users effectively.

## Features

- **Add Tasks**: Easily add tasks to your todo list.
- **Mark as Complete**: Mark tasks as complete once you finish them.
- **Delete Tasks**: Remove tasks from your list that you no longer need.
- **Prioritize Tasks**: Set priorities for tasks to manage your workflow efficiently.
- **Assign Users**: Associate tasks with specific users for better organization.

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/your-username/todo-app.git
   ```

2. Change into the project directory:

   ```
   cd todo-app
   ```

3. Install the dependencies:

   ```
   npm install
   ```

4. Build the TypeScript code:

   ```
   npm run build
   ```

5. Start the application:

   ```
   npm start
   ```

## Technologies Used

- Node.js: A JavaScript runtime for server-side applications.
- TypeScript: A typed superset of JavaScript that compiles to plain JavaScript.
- Express.js: A minimalist web application framework for Node.js.
- MongoDB: A NoSQL database for storing tasks and user information.

## API Endpoints

# User

1 Create User

- Endpoint: `/users/signup`
- Method: POST
- Description: Creates a new user account.
- Request Body:
  - `name`: The name of the user (string).
  - `email`: The email address of the user (string).
  - `password`: The user's password (string).
  - `confirmPassword`: The confirmation password (string).
  - `gender`: The gender of the user (string).
  - `country`: The country of the user (string).
- Response: The API will respond with the created user object, including a unique ID.

2 Verify User

- Endpoint: `/users/verify-user/:token`
- Method: POST
- Description: Verifies a user account.
- Request Parameters:
  - `token`: The verification token sent to the user's email address (string).
- Response: The API will respond with a success message if the user is successfully verified.

3 Login User

- Endpoint: `/users/login`
- Method: POST
- Description: Authenticates a user and generates an access token.
- Request Body:
  - `email`: The email address of the user (string).
  - `password`: The user's password (string).
- Response: The API will respond with an access token upon successful authentication.

4 Update User Details

- Endpoint: `/users/:userId`
- Method: PATCH
- Description: Updates the details of a user.
- Request Parameters:
  - `userId`: The ID of the user to update (string).
- Request Body: Any of the following fields can be included to update:
  - `name`: The updated name of the user (string).
  - `email`: The updated email address of the user (string).
  - `gender`: The updated gender of the user (string).
  - `country`: The updated country of the user (string).
- Response: The API will respond with the updated user object.

5 Update User Password

- Endpoint: `/users/update-password/:userId`
- Method: PATCH
- Description: Updates the password of a user.
- Request Parameters:
  - `userId`: The ID of the user to update (string).
- Request Body:
  - `currentPassword`: The current password of the user (string).
  - `newPassword`: The new password to set (string).
  - `confirmPassword`: The confirmation password (string).
- Response: The API will respond with a success message upon successful password update.

6 Update User Email

- Endpoint: `/users/update-email/:userId`
- Method: PATCH
- Description: Updates the email address of a user.
- Request Parameters:
  - `userId`: The ID of the user to update (string).
- Request Body:
  - `newEmail`: The new email address to set (string).
- Response: The API will respond with a success message upon successful email update.

7 Update User Image

- Endpoint: `/users/update-image/:userId`
- Method: PATCH
- Description: Updates the profile image of a user.
- Request Parameters:
  - `userId`: The ID of the user to update (string).
- Request Body:
  - `image`: The new profile image to upload (file).
- Response: The API will respond with a success message upon successful image update.

8 Forgot Password

- Endpoint: `/users/forgot-password`
- Method: POST
- Description: Sends a password reset link to the user's email address.
- Request Body:
  - `email`: The email address of the user (string).
- Response: The API will respond with a

# Tasks

### Get All Tasks

- Endpoint: `/tasks`
- Method: GET
- Description: Retrieves all tasks for a specific user.
- Response: The API will respond with an array of task objects belonging to the user.

### Create Task

- Endpoint: `/tasks`
- Method: POST
- Description: Creates a new task for a specific user.
- Request Body:

  - `title`: The title of the task (string).
  - `description`: The description of the task (string).
  - `userId`: The ID of the user to associate the task with (string).
  - `priority`: The updated priority level of the task (string).

- Response: The API will respond with the created task object, including a unique ID.

### Update Task

- Endpoint: `/tasks/:taskId`
- Method: PATCH
- Description: Updates a specific task.
- Request Parameters:
  - `taskId`: The ID of the task to update (string).
- Request Body: Any of the following fields can be included to update:
  - `title`: The title of the task (string).
  - `description`: The updated description of the task (string).
  - `priority`: The updated priority level of the task (string).
- Response: The API will respond with the updated task object.

### Delete Task

- Endpoint: `/tasks/:taskId`
- Method: DELETE
- Description: Deletes a specific task.
- Request Parameters:
  - `taskId`: The ID of the task to delete (string).
- Response: The API will respond with a success message upon successful deletion.

Please note that you should include proper authentication and authorization mechanisms to ensure that only authorized users can perform these operations on tasks and users.

## Contributing

Contributions are welcome! If you would like to contribute to the Todo App, follow these steps:

1. Fork the repository.
2. Create a new branch: `git checkout -b my-new-feature`.
3. Make changes and commit them: `git commit -m 'Add some feature'`.
4. Push to the branch: `git push origin my-new-feature`.
5. Submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

If you have any questions, suggestions, or feedback, please feel free to reach out to us at [your-email@example.com](mailto:your-email@example.com).
