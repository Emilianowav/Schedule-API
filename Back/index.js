const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const WebSocket = require('ws');

const app = express();
app.use(cors());
app.use(bodyParser.json());

let turnos = [];

// Configuración del servidor WebSocket
const wss = new WebSocket.Server({ noServer: true });

let currentClient = null;

wss.on('connection', ws => {
  currentClient = ws;

  // Cuando el cliente se desconecta, limpiamos la referencia
  ws.on('close', () => {
    currentClient = null;
  });
});

// Enviar turnos al cliente conectado
const sendTurnosToClient = () => {
  if (currentClient && currentClient.readyState === WebSocket.OPEN) {
    currentClient.send(JSON.stringify(turnos));
  }
};

// Ruta para recibir turnos desde Clarion
app.post('/api/turnos', (req, res) => {
  const turno = req.body;
  console.log("Esta es la data del body", req.body);
  
  // Verificación de que el objeto tenga todas las propiedades requeridas
  if (turno == null) {
    return res.status(400).json({ error: 'Sin datos del turno recibos' });
  }
  
  console.log("Turno recibido:", turno); // Muestra el turno recibido en consola
  turnos.push(turno); // Agrega el turno al array
  sendTurnosToClient(); // Enviar el array actualizado por WebSocket
  res.status(200).send('Turno recibido');
});

// Ruta para que el frontend obtenga los turnos (opcional)
app.get('/api/turnos', (req, res) => {
  res.status(200).json(turnos);
});

// Nueva ruta para eliminar un turno por ID
app.delete('/api/turnos/:id', (req, res) => {
  const { id } = req.params;

  // Convierte el id a número si es necesario, o compara como string si así lo estás almacenando
  const turnoId = parseInt(id, 10); // Convierte el id a un número entero
  
  const turnosFiltrados = turnos.filter((turno) => turno.id !== turnoId);  // Compara con el id numérico

  if (turnos.length === turnosFiltrados.length) {
    return res.status(404).json({ error: 'Turno no encontrado' });
  }

  turnos = turnosFiltrados;
  sendTurnosToClient(); // Enviar los turnos actualizados a todos los clientes conectados
  res.status(200).send('Turno eliminado');
});

// Inicializar el servidor
const server = app.listen(4000, () => {
  console.log('Servidor escuchando en http://localhost:4000');
});

// Asociar el servidor HTTP con el WebSocket
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});
