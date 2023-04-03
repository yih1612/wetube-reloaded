import User from "../models/User";
import Video from "../models/Video";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });
export const postJoin = async (req, res) => {
  const { name, username, email, password, password2, location } = req.body;
  const pageTitle = "Join";
  if (password !== password2) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "Password confirmation does not match.",
    });
  }
  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (exists) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "This username/email is already taken.",
    });
  }
  try {
    await User.create({
      name,
      username,
      email,
      password,
      location,
    });
    return res.redirect("/login");
  } catch (error) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: error._message,
    });
  }
};
export const getLogin = (req, res) =>
  res.render("login", { pageTitle: "Login" });
export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const pageTitle = "Login";
  const user = await User.findOne({ username, socialOnly: false });
  if (!user) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "An account with this username does not exists.",
    });
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res
      .status(400)
      .render("login", { pageTitle, errorMessage: "Wrong password" });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
  // 역할: 몇몇 configuration parameter를 가지고 URL을 만드는 것
  // URL을 설정하는 이유: URL이 Github에게 뭔가를 알려줄 수 있어서
  const baseUrl = `https://github.com/login/oauth/authorize`;
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    // Github가 우리에게 준 code
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      // set notification (why? 유저한테 Github로 로그인했다는걸 알려주기 위해서)
      return res.redirect("/login");
    }
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      user = await User.create({
        avatarUrl: userData.avatar_url,
        name: userData.name,
        username: userData.login,
        email: emailObj.email,
        password: "",
        socialOnly: true,
        location: userData.location,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};
export const getEdit = (req, res) => {
  return res.render("edit-profile", { pageTitle: "Edit Profile" });
};
export const postEdit = async (req, res) => {
  // ES6
  const {
    session: {
      user: { _id, avatarUrl, email: sessionEmail, username: sessionUsername },
    },
    body: { name, email, username, location },
    file,
  } = req;
  // 두줄을 간단히
  // const { id } = req.session.user;
  // const { name, email, username, location } = req.body;
  let searchParam = [];
  if (sessionEmail !== email) {
    searchParam.push({ email });
  }
  if (sessionUsername !== username) {
    searchParam.push({ username });
  }
  // 변경된 값이 있다면 실행되는 if문
  if (searchParam.length > 0) {
    // 같은 username OR email을 사용하는 유저가 있는지 확인
    const foundUser = await User.findOne({ $or: searchParam });
    if (foundUser && foundUser._id.toString() !== _id) {
      // 겹치는 유저가 존재하는데, 그게 본인이 아님 (다른 누군가가 사용중)
      return res.status(400).render("edit-profile", {
        pageTitle: "Edit Profile",
        errorMessage: "This username/email is already taken.",
      });
    }
  }
  const isHeroku = process.env.NODE_ENV === "production";
  // 사용중인 다른 유저가 없는 username AND email이라면, 내껄로 저장 & UPDATE
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? (isHeroku ? file.location : file.path) : avatarUrl,
      name,
      email,
      username,
      location,
    },
    { new: true }
  );

  req.session.user = updatedUser;
  // req.session.message = "success";
  return res.redirect("/users/edit");
};
export const logout = async (req, res) => {
  await req.flash("info", "Bye Bye");
  req.session.loggedIn = false;
  req.session.user = null;
  // req.session.destroy();
  return res.redirect("/");
};

export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly === true) {
    req.flash("error", "Can't change password.");

    return res.redirect("/");
  }
  return res.render("./users/change-password", {
    pageTitle: "Change Password",
  });
};
export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { oldPwd, newPwd, newPwdConfirmation },
  } = req;
  const user = await User.findById(_id);
  const ok = await bcrypt.compare(oldPwd, user.password);
  const pageTitle = "Change Password";
  if (!ok) {
    return res.status(400).render("./users/change-password", {
      pageTitle,
      errorMessage: "The current password is incorrect",
    });
  }
  if (newPwd !== newPwdConfirmation) {
    return res.status(400).render("./users/change-password", {
      pageTitle,
      errorMessage: "The password does not match the confirmation",
    });
  }
  if (oldPwd === newPwd) {
    return res.status(400).render("users/change-password", {
      pageTitle,
      errorMessage: "The old password equals new password",
    });
  }
  user.password = newPwd;
  // password hash
  await user.save();
  // redirect를 logout으로 하고 있기 때문에 세션에 굳이 넣을 필요가 없다
  // logout을 안하고 login중이라면 아래 문구가 필요!
  // req.session.user.password = user.password;
  req.session.loggedIn = false;
  req.session.user = null;
  // req.session.destroy();
  req.flash("info", "Password updated");
  return res.redirect("/login");
};
export const see = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate("videos");
  if (!user) {
    return res.status(404).render("404", { pageTitle: "User not found." });
  }
  console.log(user.videos[0].thumbUrl);
  return res.render("users/profile", {
    pageTitle: user.name,
    user,
  });
};
