const startBtn = document.getElementById("startBtn");
const video = document.getElementById("preview");

const handleStart = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
  video.srcObject = stream;
  video.play();
};

startBtn.addEventListener("click", handleStart);
