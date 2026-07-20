import React from "react";
import WaveSurfer from "wavesurfer.js";
import Timeline from "wavesurfer.js/dist/plugins/timeline";

interface WaveformProps {
  waveform: Int8Array[];
  sr: number;
}

export default function WaveformView({ waveform, sr }: WaveformProps) {
  const wavesurferRef = React.useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);

  React.useEffect(() => {
    const audioBlob = pcmToWav(waveform, sr);
    const audioUrl = URL.createObjectURL(audioBlob);

    const wavesurfer = WaveSurfer.create({
      container: "#waveform",
      url: audioUrl,
      waveColor: "#999",
      progressColor: "#333",
      height: 128,

      interact: true,

      splitChannels: [{ height: 64 }, { height: 64 }],

      plugins: [
        Timeline.create({
          container: "#timeline",
        }),
      ],
    });

    wavesurferRef.current = wavesurfer;

    wavesurfer.on("play", () => setIsPlaying(true));
    wavesurfer.on("pause", () => setIsPlaying(false));
    wavesurfer.on("finish", () => setIsPlaying(false));

    return () => {
      wavesurfer.destroy();
      wavesurferRef.current = null;
    };
  }, [waveform, sr]);

  const togglePlayback = () => {
    wavesurferRef.current?.playPause();
  };

  return (
    <div>
      <button onClick={togglePlayback}>{isPlaying ? "Pause" : "Play"}</button>

      <div id="waveform" />
      <div id="timeline" />
    </div>
  );
}

function pcmToWav(samples: Int8Array[], sampleRate: number): Blob {
  const bytesPerSample = 1;
  const channels = samples.length;

  const blockAlign = channels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.reduce((sum, channel) => sum + channel.length, 0);
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i++) {
      view.setUint8(offset + i, value.charCodeAt(i));
    }
  };

  // RIFF header
  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");

  // fmt chunk
  writeString(12, "fmt ");
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 8, true); // bits per sample

  // data chunk
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  // Copy PCM data
  for (let ch = 0; ch < samples.length; ch++) {
    const channel = samples[ch];
    for (let i = 0; i < channel.length; i++) {
      view.setInt8(44 + i * channels + ch, channel[i] + 128);
    }
  }

  return new Blob([buffer], { type: "audio/wav" });
}
