// Jihad Piano Keyboard
// Idea: listen for keyboard presses (keydown / keyup) and react.

// 1. The key map: keyboard letter -> note name, solfege and frequency (Hz)
const notes = {
  a: { note: "C",  solfege: "Do",  freq: 262 },
  s: { note: "D",  solfege: "Re",  freq: 294 },
  d: { note: "E",  solfege: "Mi",  freq: 330 },
  f: { note: "F",  solfege: "Fa",  freq: 349 },
  g: { note: "G",  solfege: "Sol", freq: 392 },
  h: { note: "A",  solfege: "La",  freq: 440 },
  j: { note: "B",  solfege: "Ti",  freq: 494 },
  k: { note: "C",  solfege: "Do",  freq: 523 },
  // Bonus: black keys (sharps)
  w: { note: "C#", solfege: "",    freq: 277 },
  e: { note: "D#", solfege: "",    freq: 311 },
  t: { note: "F#", solfege: "",    freq: 370 },
  y: { note: "G#", solfege: "",    freq: 415 },
  u: { note: "A#", solfege: "",    freq: 466 }
};

// 2. Things we need from the page
const ctx = new AudioContext();
const waveSelect = document.querySelector("#wave");
const lastNote = document.querySelector("#last-note");

// 3. Sound helper: plays one note for half a second.
// The gain fades the sound out so there is no harsh "click" at the end.
function playNote(freq) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = waveSelect.value;           // bonus: sound selector
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.35, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.5);
}

// 4. Press a key: light it up, play the note, show the note name
function pressKey(letter) {
  const info = notes[letter];
  if (!info) return;                      // not a piano key: do nothing

  const keyElement = document.querySelector(`[data-key="${letter}"]`);
  if (keyElement.classList.contains("active")) return; // already pressed

  ctx.resume();                           // browsers block sound until user interacts
  keyElement.classList.add("active");
  playNote(info.freq);
  lastNote.textContent = info.solfege ? `${info.solfege} (${info.note})` : info.note;
  checkSong(letter);
}

// 5. Release a key: turn the light off
function releaseKey(letter) {
  const keyElement = document.querySelector(`[data-key="${letter}"]`);
  if (!keyElement) return;                // not a piano key: do nothing
  keyElement.classList.remove("active");
}

// 6. Keyboard listeners. We listen on document because the keyboard
// is not "inside" any one piano key.
document.addEventListener("keydown", function (e) {
  if (e.repeat) return;                   // ignore auto-repeat while holding
  pressKey(e.key.toLowerCase());          // toLowerCase makes Caps Lock work
});

document.addEventListener("keyup", function (e) {
  releaseKey(e.key.toLowerCase());
});

// 7. Bonus: click / touch to play. Pointer events work for mouse and touch.
const allKeys = document.querySelectorAll(".key, .black-key");
allKeys.forEach(function (keyElement) {
  const letter = keyElement.dataset.key;
  keyElement.addEventListener("pointerdown", function () { pressKey(letter); });
  keyElement.addEventListener("pointerup", function () { releaseKey(letter); });
  keyElement.addEventListener("pointerleave", function () { releaseKey(letter); });
});

// 8. Bonus: song mode. Play the highlighted letters in order.
const songs = {
  mary: "d s a s d d d s s s d g g",
  twinkle: "a a g g h h g f f d d s s a"
};
const songSelect = document.querySelector("#song");
const songBox = document.querySelector("#song-letters");
const songMessage = document.querySelector("#song-message");
let songLetters = [];
let songIndex = 0;

function loadSong() {
  songLetters = songs[songSelect.value].split(" ");
  songIndex = 0;
  songMessage.textContent = "Play the gold letter!";
  drawSong();
}

function drawSong() {
  songBox.innerHTML = "";
  songLetters.forEach(function (letter, i) {
    const span = document.createElement("span");
    span.textContent = letter.toUpperCase();
    if (i < songIndex) span.className = "done";
    if (i === songIndex) span.className = "next";
    songBox.appendChild(span);
  });
}

function checkSong(letter) {
  if (songIndex >= songLetters.length) return;
  if (letter === songLetters[songIndex]) {
    songIndex++;
    drawSong();
    if (songIndex === songLetters.length) {
      songMessage.textContent = "You played the whole song! Mozart is nervous.";
    }
  }
}

songSelect.addEventListener("change", loadSong);
loadSong();
