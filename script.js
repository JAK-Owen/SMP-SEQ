document.querySelector("tone-play-toggle").addEventListener("play", (e) => {
  const playing = e.detail;

  if (playing) {
    Tone.Transport.start();
  } else {
    Tone.Transport.stop();
  }
});

const playerUrls = [
  "https://oramics.github.io/sampled/DM/TR-909/Detroit/samples/kick.wav",
  "https://oramics.github.io/sampled/DM/TR-909/Detroit/samples/snare.wav",
  "https://oramics.github.io/sampled/DM/TR-909/Detroit/samples/clap-1.wav",
  "https://oramics.github.io/sampled/DM/TR-909/Detroit/samples/clap-2.wav",
  "https://oramics.github.io/sampled/DM/TR-909/Detroit/samples/hihat-closed.wav",
  "https://oramics.github.io/sampled/DM/TR-909/Detroit/samples/tom-h.wav",
  "https://oramics.github.io/sampled/DM/TR-909/Detroit/samples/tom-l.wav",
  "https://oramics.github.io/sampled/DM/TR-909/Detroit/samples/hihat-open-1.wav"
];

const Players = playerUrls.map((url) => new Tone.Player(url));
const volume = new Tone.Volume().toDestination();

Players.forEach((player) => player.connect(volume));

const rows = document.querySelectorAll("#seqencer-container > div");
let index = 0;

Tone.Transport.scheduleRepeat(repeat, "16n");

Tone.Transport.start();

function repeat(time) {
  let step = index % 16;
  rows.forEach((row, i) => {
    let player = Players[i];
    let input = row.querySelector(`input:nth-child(${step + 1})`);
    if (input.checked) player.start(time);
  });
  index++;
}

// ////////////////////////////////////////////////////////////////////////
// TEMPO CONTROL
// ///////////////////////////////////////////////////////////////////////

var number = new Nexus.Number("#tempo-control", {
  size: [45, 25],
  value: 120,
  min: 0,
  max: 200,
  step: 1
});

number.on("change", function (v) {
  Tone.Transport.bpm.value = v;
});

// //////////////////////////////////////////////////////////////////////

var oscilloscope = new Nexus.Oscilloscope("#oscilloscope", {
  size: [150, 50]
});

oscilloscope.colorize("accent", "white");
oscilloscope.colorize("fill", "black");
oscilloscope.connect(volume);

// /////////////////////////////////////////////////////////////////////
// /MASTER VOLUME
// ////////////////////////////////////////////////////////////////////

var masterVolume = new Nexus.Dial("#master-volume", {
  size: [55, 55],
  interaction: "vertical",
  mode: "relative",
  min: -30,
  max: 10,
  step: 0,
  value: 10
});

masterVolume.colorize("accent", "white");
masterVolume.colorize("fill", "#333");

masterVolume.on("change", function (v) {
  volume.volume.value = v;
});
