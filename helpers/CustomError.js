const customError = (status, code, message) => {
    const error = new Error(message);
    error.code = code;
    error.status = status;
    return error;
}


exports.customError = customError;
exports.inputErr = customError(
    422,
    "ERR_ASSERTION",
    "fullName, password, email must exist. password must include lower, upper, numbers, and special characters, and at least with length 8."
  );
exports.tokenError = customError(400, 'TOKEN_ERROR', 'You are not loggedin');
exports.authError = customError(401, 'AUTH_ERROR', 'invalid email or password');
exports.authorizationError = customError(403, 'AUTHORIZATION_ERROR', 'you are not authorized on this action');

