"use client";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import TurnosList from "../components/TurnosList";
import { setupAudioContext, playSound } from "../components/utils/sound";
import { leerNombre } from "../components/utils/textToSpeech";
import styles from "./page.module.css";

interface Turno {
    id: number;
    nombre: string;
    consultorio: string;
}

const TurnosPage: React.FC = () => {
    const [turnos, setTurnos] = useState<Turno[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);
    const bufferRef = useRef<AudioBuffer | null>(null);

    useEffect(() => {
        setupAudioContext(audioContextRef, bufferRef);

        const fetchTurnos = async () => {
            try {
                const response = await axios.get("http://localhost:4000/api/turnos");
                setTurnos(response.data.reverse());
            } catch (error) {
                console.error("Error al obtener los turnos:", error);
            }
        };

        fetchTurnos();

        // Configuración del WebSocket
        let ws: WebSocket;
        const connectWebSocket = () => {
            ws = new WebSocket("ws://localhost:4000");

            ws.onopen = () => console.log("Conexión WebSocket establecida");

            ws.onmessage = (event) => {
                try {
                    const nuevosTurnos: Turno[] = JSON.parse(event.data);
                    console.log("Nuevos turnos recibidos:", nuevosTurnos);

                    setTurnos(nuevosTurnos.reverse());
                    // Aquí se debería reproducir el sonido
                    playSound(audioContextRef, bufferRef);

                    if (nuevosTurnos.length > 0) {
                        setTimeout(() => {
                            console.log("Ejecutando leerNombre después del retardo...");
                            leerNombre(nuevosTurnos[0].nombre, nuevosTurnos[0].consultorio);
                        }, 2000); // Retardo de 2 segundos
                    }
                } catch (error) {
                    console.error("Error procesando mensaje de WebSocket:", error);
                }
            };

            ws.onclose = () => {
                console.warn("WebSocket cerrado, intentando reconectar...");
                setTimeout(connectWebSocket, 1000); // Reconexión después de 1 segundo
            };

            ws.onerror = (error) => console.error("Error en WebSocket:", error);
        };

        connectWebSocket();

        return () => {
            if (ws) ws.close();
        };
    }, []);

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`http://localhost:4000/api/turnos/${id}`);
            setTurnos((prevTurnos) => prevTurnos.filter((turno) => turno.id !== id));
        } catch (error) {
            console.error("Error al eliminar el turno:", error);
        }
    };

    return (
        <div className={styles.container}>
            <Header />
            <TurnosList turnos={turnos} onDelete={handleDelete} />
        </div>
    );
};

export default TurnosPage;
