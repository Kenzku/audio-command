/**
 * Audio visualizer component using WaveSurfer.js
 */

import WaveSurfer from 'wavesurfer.js';

export function setupVisualizer(containerId, recorder) {
  let wavesurfer = null;
  
  // Initialize wavesurfer when recording starts
  document.addEventListener('recordingStarted', (event) => {
    const { stream } = event.detail;
    
    if (wavesurfer) {
      wavesurfer.destroy();
    }
    
    // Create new WaveSurfer instance
    wavesurfer = WaveSurfer.create({
      container: `#${containerId}`,
      waveColor: '#4f46e5',
      progressColor: '#818cf8',
      height: 60,
      cursorWidth: 0,
      barWidth: 2,
      barGap: 1,
      responsive: true
    });
    
    // Initialize microphone plugin for live visualization
    if (WaveSurfer.microphone) {
      const micInstance = wavesurfer.registerPlugin(WaveSurfer.microphone());
      micInstance.start(stream);
    } else {
      console.warn('WaveSurfer microphone plugin not available');
      
      // Fallback visualization
      createFallbackVisualization(containerId, stream);
    }
  });
}

// Fallback visualization if WaveSurfer microphone plugin is not available
function createFallbackVisualization(containerId, stream) {
  const container = document.getElementById(containerId);
  const canvas = document.createElement('canvas');
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
  container.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioContext.createAnalyser();
  const source = audioContext.createMediaStreamSource(stream);
  
  source.connect(analyser);
  analyser.fftSize = 256;
  
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  
  function draw() {
    if (!stream.active) return;
    
    requestAnimationFrame(draw);
    
    analyser.getByteFrequencyData(dataArray);
    
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * canvas.height;
      
      ctx.fillStyle = `rgb(79, 70, ${229 - dataArray[i] / 3})`;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      
      x += barWidth + 1;
    }
  }
  
  draw();
}
