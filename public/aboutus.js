document.addEventListener("DOMContentLoaded", () => {
  const sound = document.getElementById("click-sound");

  sound.play().catch(err => {
    console.log("Autoplay blocked by browser. Will play on first click.");
    // fallback: play on first user interaction
    document.body.addEventListener("click", () => {
      sound.play();
    }, { once: true });
  });
});