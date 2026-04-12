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
    salles[code] = { type: "combat", joueur1: { id: socket.id, equipe }, joueur2: null };
    socket.join(code);
    socket.emit("salle-creee", code);
  });

  socket.on("rejoindre-salle", ({ code, equipe }) => {
    const salle = salles[code];
    if (!salle) { socket.emit("erreur", "Salle introuvable !"); return; }
    if (salle.joueur2) { socket.emit("erreur", "Salle déjà pleine !"); return; }
    salle.joueur2 = { id: socket.id, equipe };
    socket.join(code);
    io.to(code).emit("combat-pret", { equipeJ1: salle.joueur1.equipe, equipeJ2: salle.joueur2.equipe });
  });

  socket.on("rejoindre-combat", ({ code }) => { socket.join(code); });

  socket.on("attaque", ({ code, attaque }) => { socket.to(code).emit("attaque-adverse", attaque); });

  socket.on("creer-tournoi", ({ nomTournoi, nomJoueur }) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    salles[code] = {
      type: "tournoi", nomTournoi,
      organisateur: socket.id,
      joueurs: [nomJoueur],
      socketIds: { [nomJoueur]: socket.id },
      equipes: {}, equipePrets: [],
      tours: [], enCours: false
    };
    socket.join(code);
    socket.emit("tournoi-cree", { code, nomTournoi, joueurs: [nomJoueur] });
  });

  socket.on("rejoindre-tournoi", ({ code, nomJoueur }) => {
    const salle = salles[code];
    if (!salle || salle.type !== "tournoi") { socket.emit("erreur", "Tournoi introuvable !"); return; }
    if (salle.enCours) { socket.emit("erreur", "Le tournoi a déjà commencé !"); return; }
    if (salle.joueurs.includes(nomJoueur)) { socket.emit("erreur", "Ce nom est déjà pris !"); return; }
    salle.joueurs.push(nomJoueur);
    salle.socketIds[nomJoueur] = socket.id;
    socket.join(code);
    io.to(code).emit("joueur-rejoint", { nomTournoi: salle.nomTournoi, code, joueurs: salle.joueurs });
  });

  socket.on("equipe-tournoi", ({ code, nomJoueur, equipe }) => {
    const salle = salles[code];
    if (!salle || salle.type !== "tournoi") return;
    salle.equipes[nomJoueur] = equipe;
    if (!salle.equipePrets.includes(nomJoueur)) salle.equipePrets.push(nomJoueur);
    io.to(code).emit("equipes-status", { prets: salle.equipePrets, total: salle.joueurs.length });
  });

  socket.on("demarrer-tournoi", ({ code }) => {
    const salle = salles[code];
    if (!salle || salle.organisateur !== socket.id) return;
    if (salle.joueurs.length < 2) { socket.emit("erreur", "Il faut au moins 2 joueurs !"); return; }
    if (salle.equipePrets.length < salle.joueurs.length) {
      socket.emit("erreur", `Tous les joueurs doivent choisir leur équipe ! (${salle.equipePrets.length}/${salle.joueurs.length} prêts)`);
      return;
    }
    salle.enCours = true;
    let joueurs = [...salle.joueurs];
    while ((joueurs.length & (joueurs.length - 1)) !== 0) joueurs.push("BYE");
    for (let i = joueurs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [joueurs[i], joueurs[j]] = [joueurs[j], joueurs[i]];
    }
    let premierTour = [];
    for (let i = 0; i < joueurs.length; i += 2) {
      premierTour.push({
        joueur1: joueurs[i], joueur2: joueurs[i + 1],
        gagnant: joueurs[i + 1] === "BYE" ? joueurs[i] : null,
        enCours: joueurs[i + 1] !== "BYE"
      });
    }
    salle.tours = [premierTour];
    io.to(code).emit("tournoi-demarre", { tours: salle.tours });
  });

  socket.on("lancer-match-tournoi", ({ codeTournoi, nomJ1, nomJ2, tourIndex, matchIndex }) => {
    const salle = salles[codeTournoi];
    if (!salle) return;
    const codeCombat = codeTournoi + "_" + tourIndex + "_" + matchIndex;
    const equipeJ1 = salle.equipes[nomJ1];
    const equipeJ2 = salle.equipes[nomJ2];
    salles[codeCombat] = { type: "combat-tournoi", codeTournoi, tourIndex, matchIndex, nomJ1, nomJ2 };
    const socketJ1 = io.sockets.sockets.get(salle.socketIds[nomJ1]);
    const socketJ2 = io.sockets.sockets.get(salle.socketIds[nomJ2]);
    if (socketJ1) { socketJ1.join(codeCombat); socketJ1.emit("match-lance", { codeCombat, role: "joueur1", equipeJ1, equipeJ2, adversaire: nomJ2, tourIndex, matchIndex }); }
    if (socketJ2) { socketJ2.join(codeCombat); socketJ2.emit("match-lance", { codeCombat, role: "joueur2", equipeJ1, equipeJ2, adversaire: nomJ1, tourIndex, matchIndex }); }
  });

  socket.on("rejoindre-tournoi-retour", ({ code, nomJoueur }) => {
    const salle = salles[code];
    if (!salle || salle.type !== "tournoi") return;
    salle.socketIds[nomJoueur] = socket.id;
    socket.join(code);
    socket.emit("joueur-rejoint", { nomTournoi: salle.nomTournoi, code, joueurs: salle.joueurs });
    if (salle.enCours) socket.emit("tournoi-demarre", { tours: salle.tours });
    socket.emit("equipes-status", { prets: salle.equipePrets, total: salle.joueurs.length });
  });

  socket.on("resultat-match", ({ codeTournoi, tourIndex, matchIndex, gagnant }) => {
    const salle = salles[codeTournoi];
    if (!salle || salle.type !== "tournoi") return;
    const match = salle.tours[tourIndex][matchIndex];
    if (match.gagnant) return;
    match.gagnant = gagnant;
    match.enCours = false;
    const tourActuel = salle.tours[tourIndex];
    const tousTermines = tourActuel.every(m => m.gagnant !== null);
    if (tousTermines) {
      const gagnants = tourActuel.map(m => m.gagnant);
      if (gagnants.length === 1) {
        io.to(codeTournoi).emit("tournoi-termine", { vainqueur: gagnants[0] });
        io.to(codeTournoi).emit("bracket-mis-a-jour", { tours: salle.tours });
        return;
      }
      let nouveauTour = [];
      for (let i = 0; i < gagnants.length; i += 2) {
        nouveauTour.push({
          joueur1: gagnants[i], joueur2: gagnants[i + 1] || "BYE",
          gagnant: (!gagnants[i + 1] || gagnants[i + 1] === "BYE") ? gagnants[i] : null,
          enCours: !!(gagnants[i + 1] && gagnants[i + 1] !== "BYE")
        });
      }
      salle.tours.push(nouveauTour);
    }
    io.to(codeTournoi).emit("bracket-mis-a-jour", { tours: salle.tours });
  });

  socket.on("disconnect", () => {
    for (let code in salles) {
      const salle = salles[code];
      if (salle.type === "combat" && (salle.joueur1.id === socket.id || (salle.joueur2 && salle.joueur2.id === socket.id))) {
        io.to(code).emit("adversaire-deconnecte");
        delete salles[code];
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => { console.log(`Serveur démarré sur le port ${PORT}`); });