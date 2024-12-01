import { MutableRefObject } from "react";

export const setupAudioContext = async (
    audioContextRef: MutableRefObject<AudioContext | null>,
    bufferRef: MutableRefObject<AudioBuffer | null>
) => {
    if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
    }
    const response = await fetch('/sounds/alerta.mp3');
    const arrayBuffer = await response.arrayBuffer();
    if (audioContextRef.current) {
        bufferRef.current = await audioContextRef.current.decodeAudioData(arrayBuffer);
    }
};

export const playSound = (
    audioContextRef: MutableRefObject<AudioContext | null>,
    bufferRef: MutableRefObject<AudioBuffer | null>
) => {
    if (audioContextRef.current && bufferRef.current) {
        const source = audioContextRef.current.createBufferSource();
        source.buffer = bufferRef.current;
        source.connect(audioContextRef.current.destination);
        source.start();
    }
};
