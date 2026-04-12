let pokemonJ1 = null;
let pokemonJ2 = null;
let tourJoueur = 1;
let equipeJ1 = JSON.parse(localStorage.getItem("equipeJ1")) || [];
let equipeJ2 = JSON.parse(localStorage.getItem("equipeJ2")) || [];
let indexJ1 = 0;
let indexJ2 = 0;
let modeMultijoueur = localStorage.getItem("modeMultijoueur") === "true";
let roleJoueur = localStorage.getItem("roleMultijoueur") || "joueur1";
let codePartie = localStorage.getItem("codeMultijoueur");
let retourTournoi = localStorage.getItem("retourTournoi") === "true";
let codeTournoiSave = localStorage.getItem("codeTournoi");
let nomJoueurTournoi = localStorage.getItem("nomJoueurTournoi");
let tourIndex = parseInt(localStorage.getItem("tourIndex") || "0");
let matchIndex = parseInt(localStorage.getItem("matchIndex") || "0");
let socket = null;
let combatTermine = false;
let monVote = null;
let voteAdversaire = null;

// ─── VOTE MAP ─────────────────────────────────────────────────────────────

function afficherEcranVote() {
  document.getElementById("ecran-vote-map").classList.remove("cache");
  document.getElementById("ecran-combat").classList.add("cache");

  afficherGrilleMaps((mapId) => {
    monVote = mapId;
    document.getElementById("attente-adversaire").classList.remove("cache");
    document.getElementById("statut-vote").textContent = `✅ Tu as voté pour : ${getMapById(mapId).nom}`;

    if (modeMultijoueur) {
      socket.emit("vote-map", { code: codePartie, mapId });
    } else {
      let mapAleatoire = MAPS[Math.floor(Math.random() * MAPS.length)].id;
      voteAdversaire = mapAleatoire;
      resoudreVote();
    }
  });
}

function resoudreVote() {
  let mapChoisie;
  if (monVote === voteAdversaire) {
    mapChoisie = monVote;
  } else {
    mapChoisie = Math.random() < 0.5 ? monVote : voteAdversaire;
  }
  let map = getMapById(mapChoisie);
  lancerCombatAvecMap(map);
}

function lancerCombatAvecMap(map) {
  document.getElementById("ecran-vote-map").classList.add("cache");
  document.getElementById("ecran-combat").classList.remove("cache");
  appliquerMap(map);
  demarrerCombat();
}

// ─── COMBAT ───────────────────────────────────────────────────────────────

function demarrerCombat() {
  if (equipeJ1.length === 0 || equipeJ2.length === 0) {
    log("Équipes manquantes ! Retourne sur la page d'accueil.");
    return;
  }
  Promise.all([
    chargerPokemon(equipeJ1[indexJ1].numero, equipeJ1[indexJ1].attaques, equipeJ1[indexJ1]),
    chargerPokemon(equipeJ2[indexJ2].numero, equipeJ2[indexJ2].attaques, equipeJ2[indexJ2])
  ]).then(([j1, j2]) => {
    pokemonJ1 = j1;
    pokemonJ1.objet = equipeJ1[indexJ1].objet || null;
    pokemonJ2 = j2;
    pokemonJ2.objet = equipeJ2[indexJ2].objet || null;
    afficherPokemon();
    afficherAttaques();
    log(`Le combat commence ! ${pokemonJ1.nom} affronte ${pokemonJ2.nom} !`);
  });
}

if (modeMultijoueur) {
  socket = io();
  socket.on("connect", () => {
    socket.emit("rejoindre-combat", { code: codePartie, role: roleJoueur });
  });
  socket.on("attaque-adverse", (attaque) => {
    let attaquant = roleJoueur === "joueur1" ? pokemonJ2 : pokemonJ1;
    let defenseur = roleJoueur === "joueur1" ? pokemonJ1 : pokemonJ2;
    appliquerAttaque(attaque, attaquant, defenseur);
  });
  socket.on("vote-map-adversaire", (mapId) => {
    voteAdversaire = mapId;
    if (monVote) resoudreVote();
  });
  socket.on("map-choisie", (mapId) => {
    let map = getMapById(mapId);
    lancerCombatAvecMap(map);
  });
  socket.on("adversaire-deconnecte", () => {
    log("Ton adversaire s'est déconnecté !");
    document.getElementById("boutons-attaques").innerHTML = "";
    document.querySelector("#zone-attaques h3").textContent = "Combat terminé !";
  });
  afficherEcranVote();
} else {
  afficherEcranVote();
}

function afficherPokemon() {
  // Images
  document.getElementById("img-j1").src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonJ1.numero}.png`;
  document.getElementById("img-j2").src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${pokemonJ2.numero}.png`;

  // Infos J1
  document.getElementById("nom-j1").textContent = pokemonJ1.nom;
  document.getElementById("texte-pv-j1").textContent = `${pokemonJ1.pvActuels} / ${pokemonJ1.pvMax}`;
  let pct1 = (pokemonJ1.pvActuels / pokemonJ1.pvMax) * 100;
  document.getElementById("pv-j1").style.width = `${pct1}%`;
  document.getElementById("pv-j1").style.backgroundColor = pct1 > 50 ? "#4CAF50" : pct1 > 20 ? "#ff9800" : "#f44336";

  // Infos J2
  document.getElementById("nom-j2").textContent = pokemonJ2.nom;
  document.getElementById("texte-pv-j2").textContent = `${pokemonJ2.pvActuels} / ${pokemonJ2.pvMax}`;
  let pct2 = (pokemonJ2.pvActuels / pokemonJ2.pvMax) * 100;
  document.getElementById("pv-j2").style.width = `${pct2}%`;
  document.getElementById("pv-j2").style.backgroundColor = pct2 > 50 ? "#4CAF50" : pct2 > 20 ? "#ff9800" : "#f44336";
}

function log(message) {
  document.getElementById("log-combat").innerHTML = `<p>${message}</p>`;
}

function estMonTour() {
  if (!modeMultijoueur) return true;
  if (roleJoueur === "joueur1" && tourJoueur === 1) return true;
  if (roleJoueur === "joueur2" && tourJoueur === 2) return true;
  return false;
}

function afficherAttaques() {
  let conteneur = document.getElementById("boutons-attaques");
  conteneur.innerHTML = "";
  let attaques = tourJoueur === 1 ? pokemonJ1.attaques : pokemonJ2.attaques;
  let attaquant = tourJoueur === 1 ? pokemonJ1 : pokemonJ2;
  let defenseur = tourJoueur === 1 ? pokemonJ2 : pokemonJ1;

  if (estMonTour()) {
    document.querySelector("#zone-attaques h3").textContent = `${attaquant.nom} attaque ! Choisir une attaque :`;
    attaques.forEach(attaque => {
      let btn = document.createElement("button");
      btn.classList.add("btn-attaque");
      btn.textContent = attaque.nom;
      btn.addEventListener("click", () => {
        if (modeMultijoueur) socket.emit("attaque", { code: codePartie, attaque });
        utiliserAttaque(attaque, attaquant, defenseur);
      });
      conteneur.appendChild(btn);
    });
  } else {
    document.querySelector("#zone-attaques h3").textContent = "⏳ En attente de l'adversaire...";
  }
}

function terminerCombat(gagnantRole) {
  if (combatTermine) return;
  combatTermine = true;

  document.getElementById("boutons-attaques").innerHTML = "";
  document.querySelector("#zone-attaques h3").textContent = "Combat terminé !";

  if (retourTournoi && codeTournoiSave) {
    let nomGagnant = "";
    if (gagnantRole === 1) {
      nomGagnant = roleJoueur === "joueur1" ? nomJoueurTournoi : localStorage.getItem("adversaireTournoi") || "Joueur 1";
    } else {
      nomGagnant = roleJoueur === "joueur2" ? nomJoueurTournoi : localStorage.getItem("adversaireTournoi") || "Joueur 2";
    }

    localStorage.removeItem("modeMultijoueur");
    localStorage.removeItem("roleMultijoueur");
    localStorage.removeItem("codeMultijoueur");
    localStorage.removeItem("retourTournoi");
    localStorage.removeItem("equipeJ1");
    localStorage.removeItem("equipeJ2");

    localStorage.setItem("resultatTournoi", JSON.stringify({
      codeTournoiSave,
      tourIndex,
      matchIndex,
      gagnant: nomGagnant,
      nomJoueur: nomJoueurTournoi
    }));

    setTimeout(() => { window.location.href = "tournoi.html"; }, 2000);
  }
}

function appliquerAttaque(attaque, attaquant, defenseur) {
  let multiplicateur = getMultiplicateur(attaque.type, defenseur.types);
  let bonusAttaque = 1;

  if (attaquant.objet) {
    if (attaquant.objet.effet === "orbe-vie") bonusAttaque = 1.3;
    if (attaquant.objet.effet === "ceinture-choix") bonusAttaque = 1.5;
    if (attaquant.objet.effet === "lunettes-choix") bonusAttaque = 1.5;
  }

  let estSpecial = ["water", "feu", "electric", "grass", "ice", "psychic", "dragon", "dark", "fairy"].includes(attaque.type);
  let statAtk = estSpecial ? attaquant.attaqueSpeciale : attaquant.attaque;
  let statDef = estSpecial ? defenseur.defenseSpeciale : defenseur.defense;

  if (defenseur.objet && defenseur.objet.effet === "veste-agression") statDef = Math.floor(statDef * 1.5);
  if (defenseur.objet && defenseur.objet.effet === "caillou-dur") statDef = Math.floor(statDef * 1.5);

  let degats = Math.max(1, Math.floor(
    (statAtk / statDef) * attaque.puissance * 0.5 * multiplicateur * bonusAttaque
  ));

  if (defenseur.objet && defenseur.objet.effet === "focusband" && !defenseur.focusbanduise) {
    if (defenseur.pvActuels - degats <= 0) {
      degats = defenseur.pvActuels - 1;
      defenseur.focusbanduise = true;
      log(`${defenseur.nom} tient grâce au Focusband !`);
    }
  }

  defenseur.pvActuels = Math.max(0, defenseur.pvActuels - degats);

  let messageEfficacite = "";
  if (multiplicateur === 0) messageEfficacite = " Ça n'affecte pas l'adversaire...";
  else if (multiplicateur >= 2) messageEfficacite = " C'est super efficace !";
  else if (multiplicateur <= 0.5) messageEfficacite = " Ce n'est pas très efficace...";

  log(`${attaquant.nom} utilise ${attaque.nom} et inflige ${degats} dégâts à ${defenseur.nom} !${messageEfficacite}`);
  afficherPokemon();

  setTimeout(() => {
    if (attaquant.objet && attaquant.objet.effet === "orbe-vie") {
      let pvPerdu = Math.floor(attaquant.pvMax * 0.1);
      attaquant.pvActuels = Math.max(1, attaquant.pvActuels - pvPerdu);
      log(`${attaquant.nom} perd ${pvPerdu} PV à cause de l'Orbe Vie !`);
      afficherPokemon();
    }
    if (attaquant.objet && attaquant.objet.effet === "restes") {
      let pvRecup = Math.floor(attaquant.pvMax * 0.06);
      attaquant.pvActuels = Math.min(attaquant.pvMax, attaquant.pvActuels + pvRecup);
      log(`${attaquant.nom} récupère ${pvRecup} PV grâce aux Restes !`);
      afficherPokemon();
    }
    if (attaquant.objet && attaquant.objet.effet === "baie-sitrus" && !attaquant.baieUtilisee) {
      if (attaquant.pvActuels < attaquant.pvMax * 0.5) {
        let pvRecup = Math.floor(attaquant.pvMax * 0.25);
        attaquant.pvActuels = Math.min(attaquant.pvMax, attaquant.pvActuels + pvRecup);
        attaquant.baieUtilisee = true;
        log(`${attaquant.nom} mange la Baie Sitrus et récupère ${pvRecup} PV !`);
        afficherPokemon();
      }
    }

    if (defenseur.pvActuels <= 0) {
      log(`${defenseur.nom} est K.O. !`);
      let equipeDefenseur = tourJoueur === 1 ? equipeJ2 : equipeJ1;
      let indexDefenseur = tourJoueur === 1 ? indexJ2 : indexJ1;
      let gagnantJoueur = tourJoueur;

      indexDefenseur++;
      if (tourJoueur === 1) indexJ2 = indexDefenseur; else indexJ1 = indexDefenseur;

      if (indexDefenseur >= equipeDefenseur.length) {
        let msg = tourJoueur === 1
          ? "Joueur 2 n'a plus de Pokémon ! Joueur 1 a gagné ! 🏆"
          : "Joueur 1 n'a plus de Pokémon ! Joueur 2 a gagné ! 🏆";
        log(msg);
        terminerCombat(gagnantJoueur);
        return;
      }

      let indexSuivant = indexDefenseur;
      let equipeSuivante = equipeDefenseur;
      chargerPokemon(equipeSuivante[indexSuivant].numero, equipeSuivante[indexSuivant].attaques, equipeSuivante[indexSuivant]).then(p => {
        p.objet = equipeSuivante[indexSuivant].objet || null;
        if (tourJoueur === 1) { pokemonJ2 = p; log(`Joueur 2 envoie ${pokemonJ2.nom} !`); }
        else { pokemonJ1 = p; log(`Joueur 1 envoie ${pokemonJ1.nom} !`); }
        afficherPokemon();
        tourJoueur = tourJoueur === 1 ? 2 : 1;
        afficherAttaques();
      });
      return;
    }

    tourJoueur = tourJoueur === 1 ? 2 : 1;
    afficherAttaques();
  }, 500);
}

function utiliserAttaque(attaque, attaquant, defenseur) {
  appliquerAttaque(attaque, attaquant, defenseur);
}

function calculerStat(base, iv, ev, niveau, estPV) {
  niveau = niveau || 50;
  iv = iv !== undefined ? iv : 31;
  ev = ev || 0;
  if (estPV) {
    return Math.floor(((base * 2 + iv + Math.floor(ev / 4)) * niveau / 100) + niveau + 10);
  } else {
    return Math.floor(((base * 2 + iv + Math.floor(ev / 4)) * niveau / 100) + 5);
  }
}

function chargerPokemon(numero, attaquesPerso, pokeData) {
  return fetch(`https://pokeapi.co/api/v2/pokemon/${numero}`)
    .then(response => response.json())
    .then(data => {
      let types = data.types.map(t => t.type.name);
      let stats = {};
      data.stats.forEach(s => { stats[s.stat.name] = s.base_stat; });

      let attaquesACharger = attaquesPerso && attaquesPerso.length > 0
        ? attaquesPerso
        : data.moves.slice(0, 4).map(m => ({ nom: m.move.name }));

      let attaquesPromises = attaquesACharger.map(a =>
        fetch(`https://pokeapi.co/api/v2/move/${a.nom}`)
          .then(r => r.json())
          .then(moveData => ({
            nom: moveData.name,
            puissance: moveData.power || 50,
            type: moveData.type.name
          }))
          .catch(() => ({ nom: a.nom, puissance: 50, type: "normal" }))
      );

      return Promise.all(attaquesPromises).then(attaques => {
        let ivs = (pokeData && pokeData.ivs) || { hp: 31, attack: 31, defense: 31, "special-attack": 31, "special-defense": 31, speed: 31 };
        let evs = (pokeData && pokeData.evs) || { hp: 0, attack: 0, defense: 0, "special-attack": 0, "special-defense": 0, speed: 0 };

        return {
          nom: data.name,
          numero: data.id,
          types,
          pvMax: calculerStat(stats["hp"], ivs.hp, evs.hp, 50, true),
          pvActuels: calculerStat(stats["hp"], ivs.hp, evs.hp, 50, true),
          attaque: calculerStat(stats["attack"], ivs.attack, evs.attack, 50, false),
          defense: calculerStat(stats["defense"], ivs.defense, evs.defense, 50, false),
          attaqueSpeciale: calculerStat(stats["special-attack"], ivs["special-attack"], evs["special-attack"], 50, false),
          defenseSpeciale: calculerStat(stats["special-defense"], ivs["special-defense"], evs["special-defense"], 50, false),
          vitesse: calculerStat(stats["speed"], ivs.speed, evs.speed, 50, false),
          attaques,
          objet: null,
          focusbanduise: false,
          baieUtilisee: false
        };
      });
    });
}