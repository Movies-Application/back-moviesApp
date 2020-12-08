function usernameLength(username) {
  return username.length < 6 || username.length > 64;
}

function passwordLength(password) {
  return password.length < 8 || password.length > 64;
}

module.exports = {
  validateUserData: (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    if (
      (!username || usernameLength(username)) &&
      (!password || passwordLength(password))
    ) {
      return res
        .status(400)
        .json({ mesg: "Username and password does not follow the rules." });
    } else if (!username || usernameLength(username)) {
      return res
        .status(400)
        .json({ mesg: "Username does not follow the rules." });
    } else if (!password || passwordLength(password)) {
      return res
        .status(400)
        .json({ mesg: "Password does not follow the rules." });
    }
    next();
  },
};
