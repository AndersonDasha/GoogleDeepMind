import { useState, useEffect } from "react";

export function useAudioFrequency() {
  const [frequency, setFrequency] = useState(0);

  useEffect(() => {
    let audioContext: AudioContext;
    let analyser: AnalyserNode;
    let microphone: MediaStreamAudioSourceNode;
    let dataArray: Uint8Array;
    let animationId: number;

    const startAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new AudioContext();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);

        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        const updateFrequency = () => {
          analyser.getByteFrequencyData(dataArray);
          // Calculate average frequency
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const average = sum / bufferLength;
          setFrequency(average / 128); // Normalize to roughly 0-1
          animationId = requestAnimationFrame(updateFrequency);
        };

        updateFrequency();
      } catch (err) {
        console.warn("Microphone access denied or not available, falling back to simulation.", err);
        // Fallback simulation
        const simulate = () => {
          setFrequency(Math.sin(Date.now() / 500) * 0.1 + 0.2 + Math.random() * 0.05);
          animationId = requestAnimationFrame(simulate);
        };
        simulate();
      }
    };

    startAudio();

    return () => {
      cancelAnimationFrame(animationId);
      if (audioContext) audioContext.close();
    };
  }, []);

  return frequency;
}
