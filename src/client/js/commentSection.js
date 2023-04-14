const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const deleteIcon = document.querySelectorAll(".delete__icon");

const addComment = (text, id, commentUser, avatar, name) => {
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  newComment.dataset.id = id;
  newComment.className = "video__comment";

  // avatar
  const a = document.createElement("a");
  a.href = "/users/" + commentUser;
  if (!avatar) {
    // const a = document.createElement("a");
    a.className = "comment__no-avatar";
    const commentNoImage = document.createElement("span");
    commentNoImage.innerText = name.substring(0, 1);
    a.appendChild(commentNoImage);
    newComment.appendChild(a);
  } else {
    // const a = document.createElement("a");
    const img = document.createElement("img");
    img.src = "/" + avatar;
    img.className = "comment__avatar";
    img.crossOrigin = "crossorigin";
    console.log(img);
    a.appendChild(img);
    newComment.appendChild(a);
  }

  const commentBox = document.createElement("div");
  const commentBoxTitle = document.createElement("div");
  commentBoxTitle.className = "comment__title";
  const commentId = document.createElement("span");
  commentId.className = "comment__id";
  commentId.innerText = name;
  const commentTime = document.createElement("span");
  commentTime.className = "comment__time";
  commentTime.innerText = "Just now";
  const commentText = document.createElement("span");
  commentText.innerText = `${text}`;
  const deleteIcon = document.createElement("span");
  deleteIcon.innerText = "❌";
  deleteIcon.className = "delete__icon";
  commentBoxTitle.appendChild(commentId);
  commentBoxTitle.appendChild(commentTime);
  commentBox.appendChild(commentBoxTitle);
  commentBox.appendChild(commentText);
  newComment.appendChild(commentBox);
  newComment.appendChild(deleteIcon);
  videoComments.prepend(newComment);

  deleteIcon.addEventListener("click", handleDelete);
};

const handleSubmit = async (event) => {
  event.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  const videoId = videoContainer.dataset.id;
  if (text === "") {
    return;
  }
  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  if (response.status === 201) {
    textarea.value = "";
    const { newCommentId, commentUser, commentAvatarUrl, commentName } =
      await response.json();
    addComment(text, newCommentId, commentUser, commentAvatarUrl, commentName);
  }
};

const handleDelete = async (event) => {
  const deleteComment = event.target.parentElement;
  const {
    dataset: { id },
  } = deleteComment;
  const videoId = videoContainer.dataset.id;
  const response = await fetch(`/api/videos/${videoId}/comment/delete`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ commentId: id }),
  });
  if (response.status === 200) {
    deleteComment.remove();
  }
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}
if (deleteIcon) {
  deleteIcon.forEach((icon) => icon.addEventListener("click", handleDelete));
}
