const http = require("http");
const fs = require("fs");
const path = require("path");
const { Server } = require("socket.io");

const server = http.createServer((req, res) => {
  let filePath = "." + req.url;
  if (filePath === "./") filePath = "./accueil.html";

  const ext = path.extname(filePath);
  const contentTypes = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css"
  };

  const contentType = contentTypes[ext] || "text/plain";

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end("Fichier non trouvé");
      return;
    }
    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  });
});

const io = new Server(server);
const salles = {};

io.on("connection", (socket) => {
  console.log("Joueur connecté :", socket.id);

  socket.on("creer-salle", (equipe) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    salles[code] = {
      joueur1: { id: socket.id, equipe: equipe },
      joueur2: null,
      equipeJ1: null,
      equipeJ2: null
    };
    socket.join(code);
    socket.emit("salle-creee", code);
    console.log(`Salle créée : ${code}`);
  });

  socket.on("rejoindre-salle", ({ code, equipe }) => {
    const salle = salles[code];
    if (!salle) {
      socket.emit("erreur", "Salle introuvable !");
      return;
    }
    if (salle.joueur2) {
      socket.emit("erreur", "Salle déjà pleine !");
      return;
    }

    salle.joueur2 = { id: socket.id, equipe: equipe };
    socket.join(code);

    io.to(code).emit("combat-pret", {
      equipeJ1: salle.joueur1.equipe,
      equipeJ2: salle.joueur2.equipe
    });

    console.log(`Salle ${code} complète, combat prêt !`);
  });

  socket.on("rejoindre-combat", ({ code, role }) => {
  socket.join(code);
});
    if (!salles[code]) return;

    if (role === "joueur1") {
      salles[code].equipeJ1 = equipeJ1;
    } else {
      salles[code].equipeJ2 = equipeJ2;
    }

    let salle = salles[code];
    if (salle.equipeJ1 && salle.equipeJ2) {
      io.to(code).emit("equipes-recues", {
        equipeJ1: salle.equipeJ1,
        equipeJ2: salle.equipeJ2
      });
    }
  });

  socket.on("attaque", ({ code, attaque }) => {
    socket.to(code).emit("attaque-adverse", attaque);
  });

  socket.on("disconnect", () => {
    console.log("Joueur déconnecté :", socket.id);
    for (let code in salles) {
      const salle = salles[code];
      if (salle.joueur1.id === socket.id || (salle.joueur2 && salle.joueur2.id === socket.id)) {
        io.to(code).emit("adversaire-deconnecte");
        delete salles[code];
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});