const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const textarea = form.querySelector("textarea");
const btn = form.querySelector("button");

const handleSubmit = (event) => {
  event.preventDefault();
  const text = textarea.value;
  console.log(videoContainer.dataset.id);
  const video = videoContainer.dataset.id;
};

form.addEventListener("submit", handleSubmit);
