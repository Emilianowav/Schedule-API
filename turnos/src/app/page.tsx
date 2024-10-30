"use client";
import axios from "axios";
import Image from "next/image";
// Interface
import { useEffect, useRef, useState } from "react";
import Turno from "./interface/turno";
// Styles
import styles from './page.module.css';
// Sound
import useSound from "use-sound";
import alerta from "../../public/sounds/alerta.mp3"; // Ruta desde la carpeta `public`
//Assets
import alertSvg from "../../public/assets/Alert.svg";

const Index: React.FC = () => {
    const [turnos, setTurnos] = useState<Turno[]>([]);
    const [play, { stop }] = useSound(alerta, { volume: 1 });

    const audioContextRef = useRef<AudioContext | null>(null);
    const bufferRef = useRef<AudioBuffer | null>(null);
    const h3Refs = useRef<(HTMLHeadingElement | null)[]>([]);

    const setupAudioContext = async () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new AudioContext();
        }
    
        const response = await fetch('/sounds/alerta.mp3');
        const arrayBuffer = await response.arrayBuffer();
        if (audioContextRef.current) {
            const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
            bufferRef.current = audioBuffer;
        }
    };

    // Crear el AudioContext
    useEffect(() => {
        setupAudioContext();

        const context = new (window.AudioContext || (window as any).webkitAudioContext)();

        // Reproduce un sonido al cargar el componente para probar
        const playTestSound = () => {
            if (context.state === 'suspended') {
                context.resume().then(() => {
                    play(); // Reproducir el sonido
                });
            } else {
                play(); // Reproducir el sonido
            }
        };

        // Prueba el sonido cuando el componente se monte
        playTestSound();

        return () => {
            context.close(); // Cierra el contexto cuando el componente se desmonte
        };
    }, [play]);

    // Recibir turnos con WebSocket
    useEffect(() => {
        const fetchTurnos = async () => {
            try {
                // Usa la dirección IP de tu computadora
                const response = await axios.get('http://192.168.0.224:4000/api/turnos');
                setTurnos(response.data.reverse());
            } catch (error) {
                console.error('Error al obtener los turnos:', error);
            }
        };

        fetchTurnos();

        const connectWebSocket = () => {
            // Asegúrate de que sea la IP correcta
            const ws = new WebSocket('ws://192.168.0.224:4000');

            ws.onopen = () => {
                console.log('Conectado al WebSocket');
            };

            ws.onmessage = (event) => {
                const nuevosTurnos: Turno[] = JSON.parse(event.data);
                console.log('Nuevos turnos recibidos:', nuevosTurnos); // Debug: log los nuevos turnos

                // Reproducir sonido al recibir nuevos turnos
                if (audioContextRef.current && bufferRef.current) {
                    const source = audioContextRef.current.createBufferSource();
                    source.buffer = bufferRef.current;
                    source.connect(audioContextRef.current.destination);
                    source.start();
                }

                // Actualizar el estado con los nuevos turnos
                setTurnos(nuevosTurnos.reverse());
            };

            ws.onclose = () => {
                console.log('Conexión cerrada, intentando reconectar...');
                setTimeout(connectWebSocket, 1000);
            };

            ws.onerror = (error) => {
                console.error('Error en WebSocket:', error);
                ws.close();
            };
        };

        connectWebSocket();
    }, []);

    const handleDelete = async (id: number) => {
        try {
            console.log('Intentando eliminar el turno con id:', id); // Verificar el ID
            const response = await axios.delete(`http://192.168.0.224:4000/api/turnos/${id}`); // ID en la URL
            const deleted = turnos.filter((turno) => turno.id !== id).reverse();
            setTurnos(deleted);
        } catch (error) {
            console.error('Error al eliminar el turno:', error);
        }
    };

    // AJUSTAR EL TAMAÑO DEL H3
    const adjustFontSize = (element: HTMLElement) => {
        const maxLines = 2;
        const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
        const maxHeight = lineHeight * maxLines;

        // Restablece el tamaño de la fuente al tamaño original antes de ajustar
        element.style.fontSize = ''; // Deja que el estilo CSS determine el tamaño base

        let currentFontSize = parseFloat(getComputedStyle(element).fontSize);

        // Mientras el elemento exceda el máximo de dos líneas, reducir el tamaño de la fuente
        while (element.scrollHeight > maxHeight && currentFontSize > 1) {
            currentFontSize -= 0.1;  // Disminuir el tamaño de la fuente gradualmente
            element.style.fontSize = `${currentFontSize}px`; // Usar px para mayor precisión
        }
    };

    useEffect(() => {
        h3Refs.current.forEach(element => {
            if (element) adjustFontSize(element);
        });
    }, [turnos]);

    return (
        <div className={styles.container}>
            <h1 className={styles.h1}>Turnos</h1>
            <ul className={styles.ul}>
                {turnos.map((turno, index) => (
                    <div className={styles.div} key={index}>
                        <h3
                            className={styles.h3}
                            ref={(el) => {
                                h3Refs.current[index] = el;
                            }}
                        >
                            {turno.nombre}
                        </h3>
                        <h4 className={styles.h4}>{turno.hora}</h4>
                        <h5 className={styles.h5}>{turno.consultorio}</h5>
                        <h6 className={styles.h6}>{turno.profesional}</h6>
                        {/* Descomentar si se desea incluir el botón para eliminar */}
                        {/* <button className={styles.trash} onClick={() => handleDelete(turno.id)}>
                            <Image src={trash} alt="trash" />
                        </button> */}
                    </div>
                ))}
            </ul>
            <button className={styles.button} onClick={() => play()}>
                <Image className={styles.image} src={alertSvg} alt="alerta" />
            </button>
        </div>
    );
};

export default Index;
