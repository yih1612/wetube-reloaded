import Video from "../models/Video";

// trending

/*
  console.log("start")
  Video.find({}, (error, videos) => {
    if(error) {
      return res.render("server-error")
    }
    return res.render("home", { pageTitle: "Home", videos });
  });
  console.log("finished");
*/
export const home = async (req, res) => {
  const videos = await Video.find({});
  return res.render("home", { pageTitle: "Home", videos });
};

// watch
export const watch = (req, res) => {
  const { id } = req.params; // const id = req.param.id;
  return res.render("watch", { pageTitle: `Watching` });
};

// edit
export const getEdit = (req, res) => {
  const { id } = req.params;
  return res.render("edit", { pageTitle: `Editing` });
};
export const postEdit = (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  return res.redirect(`/videos/${id}`);
};

// upload
export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};
export const postUpload = (req, res) => {
  const { title } = req.body;
  return res.redirect("/");
};
