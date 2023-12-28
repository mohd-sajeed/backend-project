// Create a function called asyncHandler that takes a requestHandler as a parameter
const asyncHandler = (requestHandler) => {
  // Return a function that takes req, res, and next as parameters
  return (req, res, next) => {
    // Resolve the promise returned by calling requestHandler with req, res, and next
    Promise.resolve(requestHandler(req, res, next))
      // If there's an error, call the 'next' middleware function with the error
      .catch((err) => next(err));
  };
};

// Export the asyncHandler function as the default export from this module
export default asyncHandler;






















// const asyncHandler=()=>{}
// const asyncHandler=(fun)=>()=>{}
// const asyncHandler=(fun)=>async()=>{}

// const asyncHandler = (fn) => async (req, res, next) => {
//   try {
//     await fn(req, res, next);
//   } catch (error) {
//     res.status(err.code || 500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };
