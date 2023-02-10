import Video from "../models/Video";

// trending

/* callback
  Video.find({}, (error, videos) => {
    return res.render("home", { pageTitle: "Home", videos });
  });
*/

/* promise */
export const home = async (req, res) => {
  const videos = await Video.find({});
  console.log(videos);
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
export const postUpload = async (req, res) => {
  const { title, description, hashtags } = req.body;
  await Video.create({
    title,
    description,
    createdAt: "lalala",
    hashtags: hashtags.split(",").map((word) => `#${word}`),
    meta: {
      views: 0,
      rating: 0,
    },
  });
  return res.redirect("/");
};
