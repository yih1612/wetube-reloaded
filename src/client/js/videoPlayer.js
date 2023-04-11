const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteIcon = muteBtn.querySelector("i");
const volumeRange = document.getElementById("volume");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenIcon = fullScreenBtn.querySelector("i");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");
const textarea = document.getElementById("commentTextarea");

let controlsTimeout = null;
let volumeValue = 0.5;
video.volume = volumeValue;

const handlePlayClick = (e) => {
  video.paused ? video.play() : video.pause();
  playIcon.classList = video.paused ? "fa-solid fa-play" : "fa-solid fa-pause";
};

const handleMute = (e) => {
  if (video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }
  muteIcon.classList = video.muted
    ? "fa-solid fa-volume-xmark"
    : "fa-solid fa-volume-high";
  volumeRange.value = video.muted ? 0 : volumeValue;
};

const handleVolumeChange = (event) => {
  const {
    target: { value },
  } = event;
  // if (video.muted) {
  //   video.muted = false;
  //   muteBtn.innerText = "Mute";
  // }
  volumeValue = value;
  video.volume = value;
  if (video.volume === 0) {
    video.muted = true;
    muteIcon.classList = "fa-solid fa-volume-xmark";
  } else {
    video.muted = false;
    muteIcon.classList = "fa-solid fa-volume-high";
  }
};

const formatTime = (seconds) => {
  const startIdx = seconds >= 3600 ? 11 : 14;
  return new Date(seconds * 1000).toISOString().substring(startIdx, 19);
};

const handleLoadedMetadata = () => {
  totalTime.innerText = formatTime(Math.floor(video.duration));
  timeline.max = Math.floor(video.duration);
};

const handleTimeUpdate = () => {
  currentTime.innerText = formatTime(Math.floor(video.currentTime));
  timeline.value = Math.floor(video.currentTime);
};

const handleTimelineChange = (event) => {
  const {
    target: { value },
  } = event;
  video.currentTime = value;
};

const handleFullScreen = () => {
  const fullscreen = document.fullscreenElement;
  if (fullscreen) {
    document.exitFullscreen();
  } else {
    videoContainer.requestFullscreen();
  }
};

const handleMouseMove = () => {
  if (controlsTimeout) {
    clearTimeout(controlsTimeout);
    controlsTimeout = null;
  }
  videoControls.classList.add("showing");
  controlsTimeout = setTimeout(() => {
    videoControls.classList.remove("showing");
  }, 1000);
};

const handlePlayKeydown = (event) => {
  if (event.target !== textarea) {
    if (event.key === " ") {
      event.preventDefault();
      handlePlayClick();
    }
    if (event.key === "F" || event.key === "f") {
      handleFullScreen();
    }
  }
};

const handleFullscreenChange = () => {
  const fullscreen = document.fullscreenElement;
  if (fullscreen) {
    fullScreenIcon.classList = "fa-solid fa-compress";
  } else {
    fullScreenIcon.classList = "fa-solid fa-expand";
  }
};

const handleEnded = () => {
  const { id } = videoContainer.dataset;
  fetch(`/api/videos/${id}/view`, {
    method: "POST",
  });
};

const isHeroku = process.env.NODE_ENV === "production";

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMute);
volumeRange.addEventListener("input", handleVolumeChange);
video.addEventListener("canplay", handleLoadedMetadata);
if (isHeroku) {
  handleLoadedMetadata();
}
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("mousemove", handleMouseMove);
// 비디오 클릭시 재생/멈춤
video.addEventListener("click", handlePlayClick);
video.addEventListener("ended", handleEnded);
timeline.addEventListener("input", handleTimelineChange);
fullScreenBtn.addEventListener("click", handleFullScreen);
// 스페이스바로 재생/멈춤
document.addEventListener("keydown", handlePlayKeydown);
// esc로 전체화면 나가기
document.addEventListener("fullscreenchange", handleFullscreenChange);
