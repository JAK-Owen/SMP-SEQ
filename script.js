// Wait for the DOM to be fully loaded before executing the script
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

  // Event listener for the play toggle button
  document.querySelector("tone-play-toggle").addEventListener("play", (e) => {
    const playing = e.detail;

    // Start or stop Tone.Transport based on the play state
    if (playing) {
      Tone.Transport.start();
    } else {
      Tone.Transport.stop();
    }
  });

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

  // Start Tone.Transport
  Tone.Transport.start();

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
  var number = new Nexus.Number("#tempo-control", {
    size: [45, 25],
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
    size: [150, 50]
  });

  // Customize oscilloscope appearance
  oscilloscope.colorize("accent", "white");
  oscilloscope.colorize("fill", "black");
  oscilloscope.connect(volume);

  // Master Volume control using NexusUI
  var masterVolume = new Nexus.Dial("#master-volume", {
    size: [55, 55],
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
