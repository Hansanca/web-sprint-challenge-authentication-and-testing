const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { insert, getByUsername } = require("./model");

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.send("username and password required");
  }

  const userExist = await getByUsername(username);
  if (userExist) {
    return res.send("username taken");
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);
  const newUser = await insert({ username, password: passwordHash });
  return res.send(newUser);
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.send("username and password required");
  }

  const userExist = await getByUsername(username);

  if (!userExist || !bcrypt.compareSync(password, userExist.password)) {
    return res.send("invalid credentials");
  } else {
    const token = jwt.sign(
      {
        id: userExist.id,
        username: userExist.username,
      },
      process.env.SECRET,
      {
        expiresIn: '1d'
      }
    );
    return res.send({
      message: `welcome, ${username}`,
      token,
    });
  }
});

module.exports = router;
