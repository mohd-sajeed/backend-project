

// Defining a class called apiResponse
class apiResponse{
    // Constructor function for the class with parameters statusCode, data, and an optional message with default value "Success"
    constructor(statusCode,data,message = "Success"){
        // Assigning the value of statusCode to the instance property statusCode
        this.statusCode=statusCode
        // Assigning the value of data to the instance property data
        this.data=data
        // Assigning the value of message to the instance property message
        this.message=message
        // Creating a boolean property success based on whether the statusCode is less than 400 (indicating a successful response)
        this.success=statusCode < 400
    }
}

// Exporting the apiResponse class as default from this module
export default apiResponse
