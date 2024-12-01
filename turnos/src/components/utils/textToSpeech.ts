export const leerNombre = (nombre: string, consultorio: string) => {
    const speech = new SpeechSynthesisUtterance();
    speech.text = `${nombre} ${consultorio}`;
    speech.lang = "es-ES";
    speech.rate = 0.7;
    window.speechSynthesis.speak(speech);
};
