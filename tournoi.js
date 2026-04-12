const socket = io();
let monNom = "";
let codeTournoi = "";
let estOrganisateur = false;
let equipeChoisie = false;

function creerTournoi() {
  let nomTournoi = document.getElementById("input-nom-tournoi").value.trim();
  let nomJoueur = document.getElementById("input-nom-joueur").value.trim();
  if (!nomTournoi || !nomJoueur) { alert("Entre un nom de tournoi et ton nom !"); return; }
  monNom = nomJoueur;
  estOrganisateur = true;
  socket.emit("creer-tournoi", { nomTournoi, nomJoueur });
}

function rejoindreTournoi() {
  let code = document.getElementById("input-code-tournoi").value.trim().toUpperCase();
  let nomJoueur = document.getElementById("input-nom-joueur2").value.trim();
  if (!code || !nomJoueur) { alert("Entre le code du tournoi et ton nom !"); return; }
  monNom = nomJoueur;
  codeTournoi = code;
  socket.emit("rejoindre-tournoi", { code, nomJoueur });
}

function allerChoisirEquipe() {
  localStorage.setItem("modeTournoi", "true");
  localStorage.setItem("nomJoueurTournoi", monNom);
  localStorage.setItem("codeTournoi", codeTournoi);
  window.location.href = "index.html";
}

function demarrerTournoi() {
  socket.emit("demarrer-tournoi", { code: codeTournoi });
}

function afficherSectionTournoi() {
  document.getElementById("section-creation").style.display = "none";
  document.getElementById("section-rejoindre").style.display = "none";
  document.getElementById("section-tournoi").classList.remove("cache");
}

function afficherJoueurs(joueurs) {
  let conteneur = document.getElementById("liste-joueurs");
  conteneur.innerHTML = "";
  joueurs.forEach(joueur => {
    let carte = document.createElement("div");
    carte.classList.add("carte-joueur-tournoi");
    carte.id = "joueur-carte-" + joueur;
    carte.textContent = joueur;
    conteneur.appendChild(carte);
  });
}

function afficherBracket(tours) {
  let bracket = document.getElementById("bracket");
  bracket.innerHTML = "";
  let container = document.createElement("div");
  container.classList.add("bracket-container");

  tours.forEach((tour, i) => {
    let colonne = document.createElement("div");
    colonne.classList.add("tour-bracket");

    let titre = document.createElement("div");
    titre.classList.add("titre-tour");
    titre.textContent = i === tours.length - 1 ? "🏆 Finale" : `Tour ${i + 1}`;
    colonne.appendChild(titre);

    tour.forEach((match, matchIndex) => {
      let matchDiv = document.createElement("div");
      matchDiv.classList.add("match-bracket");

      let j1 = document.createElement("div");
      j1.classList.add("joueur");
      j1.textContent = match.joueur1 || "???";
      if (match.gagnant === match.joueur1) j1.classList.add("gagnant");
      else if (match.gagnant && match.gagnant !== match.joueur1) j1.classList.add("perdant");

      let j2 = document.createElement("div");
      j2.classList.add("joueur");
      j2.textContent = match.joueur2 || "???";
      if (match.gagnant === match.joueur2) j2.classList.add("gagnant");
      else if (match.gagnant && match.gagnant !== match.joueur2) j2.classList.add("perdant");

      matchDiv.appendChild(j1);
      matchDiv.appendChild(j2);

      if (match.enCours && (match.joueur1 === monNom || match.joueur2 === monNom)) {
        let btnJouer = document.createElement("button");
        btnJouer.textContent = "⚔️ Lancer le match !";
        btnJouer.style.cssText = "margin-top:5px;background:#ffcb05;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;font-size:12px;width:100%;";
        btnJouer.addEventListener("click", () => {
          socket.emit("lancer-match-tournoi", {
            codeTournoi,
            nomJ1: match.joueur1,
            nomJ2: match.joueur2,
            tourIndex: i,
            matchIndex
          });
        });
        matchDiv.appendChild(btnJouer);
      } else if (match.enCours) {
        let enAttenteDiv = document.createElement("div");
        enAttenteDiv.style.cssText = "color:gray;font-size:11px;margin-top:5px;";
        enAttenteDiv.textContent = "⏳ En attente des joueurs";
        matchDiv.appendChild(enAttenteDiv);
      }

      colonne.appendChild(matchDiv);
    });

    container.appendChild(colonne);
  });

  bracket.appendChild(container);
}

socket.on("tournoi-cree", ({ code, nomTournoi, joueurs }) => {
  codeTournoi = code;
  afficherSectionTournoi();
  document.getElementById("titre-tournoi").textContent = nomTournoi;
  document.getElementById("code-tournoi-affiche").textContent = code;
  document.getElementById("statut-tournoi").textContent = "En attente de joueurs...";
  document.getElementById("btn-demarrer").classList.remove("cache");
  document.getElementById("btn-equipe").classList.remove("cache");
  afficherJoueurs(joueurs);
});

socket.on("joueur-rejoint", ({ nomTournoi, code, joueurs }) => {
  codeTournoi = code;
  afficherSectionTournoi();
  document.getElementById("titre-tournoi").textContent = nomTournoi;
  document.getElementById("code-tournoi-affiche").textContent = code;
  document.getElementById("statut-tournoi").textContent = "En attente du début...";
  document.getElementById("btn-equipe").classList.remove("cache");
  afficherJoueurs(joueurs);
});

socket.on("equipes-status", ({ prets, total }) => {
  document.getElementById("statut-equipes").textContent = `Équipes prêtes : ${prets.length} / ${total}`;
  prets.forEach(nom => {
    let carte = document.getElementById("joueur-carte-" + nom);
    if (carte) { carte.textContent = nom + " ✅"; carte.classList.add("pret"); }
  });
  if (prets.includes(monNom)) {
    document.getElementById("btn-equipe").textContent = "✅ Équipe choisie !";
    document.getElementById("btn-equipe").disabled = true;
  }
});

socket.on("tournoi-demarre", ({ tours }) => {
  document.getElementById("btn-demarrer").classList.add("cache");
  document.getElementById("btn-equipe").classList.add("cache");
  document.getElementById("statut-tournoi").textContent = "Tournoi en cours !";
  document.getElementById("statut-equipes").textContent = "";
  afficherBracket(tours);
});

socket.on("bracket-mis-a-jour", ({ tours }) => {
  afficherBracket(tours);
});

socket.on("match-lance", ({ codeCombat, role, equipeJ1, equipeJ2, adversaire, tourIndex, matchIndex }) => {
  localStorage.setItem("equipeJ1", JSON.stringify(equipeJ1));
  localStorage.setItem("equipeJ2", JSON.stringify(equipeJ2));
  localStorage.setItem("modeMultijoueur", "true");
  localStorage.setItem("roleMultijoueur", role);
  localStorage.setItem("codeMultijoueur", codeCombat);
  localStorage.setItem("retourTournoi", "true");
  localStorage.setItem("codeTournoi", codeTournoi);
  localStorage.setItem("nomJoueurTournoi", monNom);
  localStorage.setItem("adversaireTournoi", adversaire);
  localStorage.setItem("tourIndex", tourIndex);
  localStorage.setItem("matchIndex", matchIndex);
  window.location.href = "combat.html";
});

socket.on("tournoi-termine", ({ vainqueur }) => {
  document.getElementById("statut-tournoi").textContent = `🏆 Vainqueur du tournoi : ${vainqueur} !`;
});

socket.on("erreur", (message) => { alert(message); });

window.onload = () => {
  const equipeATournoi = localStorage.getItem("equipeATournoi");
  if (equipeATournoi) {
    const nomJoueur = localStorage.getItem("nomJoueurTournoi");
    const code = localStorage.getItem("codeTournoi");
    localStorage.removeItem("equipeATournoi");
    if (nomJoueur && code) {
      monNom = nomJoueur;
      codeTournoi = code;
      socket.emit("rejoindre-tournoi-retour", { code, nomJoueur });
      if (socket.connected) {
        socket.emit("equipe-tournoi", { code, nomJoueur, equipe: JSON.parse(equipeATournoi) });
      } else {
        socket.on("connect", () => {
          socket.emit("equipe-tournoi", { code, nomJoueur, equipe: JSON.parse(equipeATournoi) });
        });
      }
    }
    return;
  }

  const resultat = localStorage.getItem("resultatTournoi");
  if (resultat) {
    const { codeTournoiSave, tourIndex, matchIndex, gagnant, nomJoueur } = JSON.parse(resultat);
    localStorage.removeItem("resultatTournoi");
    monNom = nomJoueur;
    codeTournoi = codeTournoiSave;
    if (socket.connected) {
      socket.emit("rejoindre-tournoi-retour", { code: codeTournoi, nomJoueur });
      socket.emit("resultat-match", { codeTournoi, tourIndex, matchIndex, gagnant });
    } else {
      socket.on("connect", () => {
        socket.emit("rejoindre-tournoi-retour", { code: codeTournoi, nomJoueur });
        socket.emit("resultat-match", { codeTournoi, tourIndex, matchIndex, gagnant });
      });
    }
  }
};