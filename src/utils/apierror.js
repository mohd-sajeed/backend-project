// Define a class called apiError which extends the built-in Error class

class apiError extends Error {
  constructor(
    statusCode, // Constructor parameter for HTTP status code
    message = "Something went wrong", // Constructor parameter for error message with default value
    error = [], // Constructor parameter for error array with default value of empty array
    stack = "" // Constructor parameter for stack trace with default value of empty string
  ) {
    super(message); // Call the constructor of the parent class (Error) and pass the error message

    this.statusCode = statusCode; // Set the statusCode property of the instance to the provided HTTP status code
    this.data = null; // Initialize data property to null
    this.message = message; // Set the message property of the instance to the provided error message
    this.success = false; // Set success property to false by default
    this.errors = this.errors; // Initialize errors property - should likely be set to `error` instead of `this.errors`

    if (stack) { 
      this.stack = stack; // If a stack trace is provided, set it to the instance's stack property
    } else {
      Error.captureStackTrace(this, this.constructor); // Otherwise capture a new stack trace using Error.captureStackTrace method and pass in current instance and its constructor function
    }
  }
}

export default apiError; // Export the apiError class as a default export from this module/script
