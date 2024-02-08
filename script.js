document.addEventListener('DOMContentLoaded', function () {
  // Get the container element for the step sequencer
  const sequencerContainer = document.getElementById('sequencer-container');

  // Define the number of steps and rows in the sequencer
  const steps = 16;
  const rows = 8;

  // Array to store the checkboxes in a 2D grid
  const checkboxes = [];

  // Create checkboxes and initialize the array
  for (let i = 0; i < rows; i++) {
    // Create a row container
    const row = document.createElement('div');
    row.className = 'sequencer-row';

    // Array to store checkboxes for the current row
    const rowCheckboxes = [];

    for (let j = 0; j < steps; j++) {
      // Create a checkbox element
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'input-box';

      // Append the checkbox to the row and add it to the array
      row.appendChild(checkbox);
      rowCheckboxes.push(checkbox);
    }

    // Append the row to the sequencer container and add it to the checkboxes array
    sequencerContainer.appendChild(row);
    checkboxes.push(rowCheckboxes);
  }

  // Function to create an SVG element for play icon
  function createPlaySVG() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("width", "20px");
    svg.setAttribute("height", "20px");
    svg.setAttribute("viewBox", "0 0 16 16");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill", "white");
    path.setAttribute("d", "M14.005 7.134L5.5 2.217a1 1 0 0 0-1.5.866v9.834a1 1 0 0 0 1.5.866l8.505-4.917a1 1 0 0 0 0-1.732m.751 3.03c1.665-.962 1.665-3.366 0-4.329L6.251.918C4.585-.045 2.5 1.158 2.5 3.083v9.834c0 1.925 2.085 3.128 3.751 2.164z");

    svg.appendChild(path);
    return svg;
  }

  // Function to create an SVG element for pause icon
function createPauseSVG() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("width", "40px");
  svg.setAttribute("height", "40px");
  svg.setAttribute("viewBox", "0 0 25 32");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("fill", "white");
  path.setAttribute("d", "M14 19V5h4v14zm-8 0V5h4v14z");

  svg.style.margin = "auto";
  svg.style.display = "block";

  svg.appendChild(path);
  return svg;
}


  // Flag to track the play state
  let isPlaying = false;

  // Reference to the Nexus UI play toggle button
  const playToggle = document.querySelector("#nexus-play-toggle");

  // Create play and pause SVG elements
  const playSVG = createPlaySVG();
  const pauseSVG = createPauseSVG();

  // Set the initial play icon
  playToggle.appendChild(playSVG);

  // Event listener for the Nexus UI play toggle button
  playToggle.addEventListener("click", function () {
    // Toggle the play state
    isPlaying = !isPlaying;

    // Update the SVG based on the play state
    updatePlayToggleSVG();

    // Ensure Tone context is started before playing
    if (Tone.context.state !== 'running') {
      Tone.start();
    }

    // Start or stop Tone.Transport based on the play state
    if (Tone.Transport.state === "started") {
      Tone.Transport.stop();
    } else {
      // Start Tone.Transport
      Tone.Transport.start();
    }
  });

  // Function to update the SVG of the play toggle button
  function updatePlayToggleSVG() {
    // Remove existing SVG
    while (playToggle.firstChild) {
      playToggle.removeChild(playToggle.firstChild);
    }

    // Append the appropriate SVG based on the play state
    if (isPlaying) {
      playToggle.appendChild(pauseSVG);
    } else {
      playToggle.appendChild(playSVG);
    }
  }

  // Function to update the background image of the play toggle button
  function updatePlayToggleBackground() {
    // Get the play toggle container
    const playToggle = document.querySelector("#nexus-play-toggle");

    // Create the SVG based on the play state
    const svg = isPlaying ? createPauseSVG() : createPlaySVG();

    // Remove existing children of the play toggle container
    while (playToggle.firstChild) {
      playToggle.removeChild(playToggle.firstChild);
    }

    // Append the SVG to the play toggle container
    playToggle.appendChild(svg);
  }

  // URLs for the audio samples
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

  // Create Tone.Players for each audio sample
  const players = playerUrls.map((url) => new Tone.Player(url));

  // Create a volume control for the players
  const volume = new Tone.Volume().toDestination();

  // Connect each player to the volume control
  players.forEach((player) => player.connect(volume));

  // Initialize index for sequencing
  let index = 0;

  // Schedule a repeating function on Tone.Transport
  Tone.Transport.scheduleRepeat(repeat, "16n");

  // Function to be repeated on each step of the sequencer
  function repeat(time) {
    checkboxes.forEach((rowCheckboxes, i) => {
      const player = players[i];
      const input = rowCheckboxes[index % steps];

      // Trigger the player if the checkbox is checked
      if (input.checked) {
        player.start(time);
      }
    });

    // Move to the next step in the sequencer
    index = (index + 1) % steps;
  }

  // Tempo Control using NexusUI
  var number = new Nexus.Number("#nexus-tempo-control", {
    size: [50, 30],
    value: 120,
    min: 0,
    max: 200,
    step: 1
  });

  // Event listener for tempo change
  number.on("change", function (v) {
    Tone.Transport.bpm.value = v;
  });

  // Oscilloscope using NexusUI
  var oscilloscope = new Nexus.Oscilloscope("#oscilloscope", {
    size: [40, 40]
  });

  // Customize oscilloscope appearance
  oscilloscope.colorize("accent", "white");
  oscilloscope.colorize("fill", "black");
  oscilloscope.connect(volume);

  // Master Volume control using NexusUI
  var masterVolume = new Nexus.Dial("#master-volume", {
    size: [45, 45],
    interaction: "vertical",
    mode: "relative",
    min: -30,
    max: 10,
    step: 0,
    value: 10
  });

  // Customize master volume appearance
  masterVolume.colorize("accent", "white");
  masterVolume.colorize("fill", "#333");

  // Event listener for master volume change
  masterVolume.on("change", function (v) {
    volume.volume.value = v;
  });
});
