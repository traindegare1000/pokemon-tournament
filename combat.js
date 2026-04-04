let pokemonJ1 = null;
let pokemonJ2 = null;
let tourJoueur = 1;
let equipeJ1 = JSON.parse(localStorage.getItem("equipeJ1")) || [];
let equipeJ2 = JSON.parse(localStorage.getItem("equipeJ2")) || [];
let indexJ1 = 0;
let indexJ2 = 0;

function afficherPokemon() {
  document.getElementById("img-j1").src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonJ1.numero}.png`;
  document.getElementById("nom-j1").textContent = pokemonJ1.nom;
  document.getElementById("texte-pv-j1").textContent = `PV: ${pokemonJ1.pvActuels} / ${pokemonJ1.pvMax}`;
  document.getElementById("pv-j1").style.width = `${(pokemonJ1.pvActuels / pokemonJ1.pvMax) * 100}%`;

  document.getElementById("img-j2").src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${pokemonJ2.numero}.png`;
  document.getElementById("nom-j2").textContent = pokemonJ2.nom;
  document.getElementById("texte-pv-j2").textContent = `PV: ${pokemonJ2.pvActuels} / ${pokemonJ2.pvMax}`;
  document.getElementById("pv-j2").style.width = `${(pokemonJ2.pvActuels / pokemonJ2.pvMax) * 100}%`;
}

function log(message) {
  document.getElementById("log-combat").innerHTML = `<p>${message}</p>`;
}

function afficherAttaques() {
  let conteneur = document.getElementById("boutons-attaques");
  conteneur.innerHTML = "";

  let attaques = tourJoueur === 1 ? pokemonJ1.attaques : pokemonJ2.attaques;
  let attaquant = tourJoueur === 1 ? pokemonJ1 : pokemonJ2;
  let defenseur = tourJoueur === 1 ? pokemonJ2 : pokemonJ1;

  document.querySelector("#zone-attaques h3").textContent =
    `${attaquant.nom} attaque ! Choisir une attaque :`;

  attaques.forEach(attaque => {
    let btn = document.createElement("button");
    btn.classList.add("btn-attaque");
    btn.textContent = attaque.nom;
    btn.addEventListener("click", () => utiliserAttaque(attaque, attaquant, defenseur));
    conteneur.appendChild(btn);
  });
}

function utiliserAttaque(attaque, attaquant, defenseur) {
  let multiplicateur = getMultiplicateur(attaque.type, defenseur.types);
  let bonusAttaque = 1;

  if (attaquant.objet) {
    if (attaquant.objet.effet === "orbe-vie") bonusAttaque = 1.3;
    if (attaquant.objet.effet === "ceinture-choix") bonusAttaque = 1.5;
  }

  let degats = Math.max(1, Math.floor(
    (attaquant.attaque / defenseur.defense) * attaque.puissance * 0.5 * multiplicateur * bonusAttaque
  ));

  if (defenseur.objet && defenseur.objet.effet === "caillou-dur") {
    degats = Math.floor(degats * 0.5);
  }

  if (defenseur.objet && defenseur.objet.effet === "focusband" && !defenseur.focusbanduise) {
    if (defenseur.pvActuels - degats <= 0) {
      degats = defenseur.pvActuels - 1;
      defenseur.focusbanduise = true;
      log(`${defenseur.nom} tient grâce au Focusband ! Il reste avec 1 PV !`);
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

      if (tourJoueur === 1) {
        indexJ2++;
        if (indexJ2 >= equipeJ2.length) {
          log(`Joueur 2 n'a plus de Pokémon ! Joueur 1 a gagné ! 🏆`);
          document.getElementById("boutons-attaques").innerHTML = "";
          document.querySelector("#zone-attaques h3").textContent = "Combat terminé !";
          return;
        }
        chargerPokemon(equipeJ2[indexJ2].numero, equipeJ2[indexJ2].attaques, equipeJ2[indexJ2]).then(p => {
          pokemonJ2 = p;
          pokemonJ2.objet = equipeJ2[indexJ2].objet || null;
          afficherPokemon();
          afficherAttaques();
          log(`Joueur 2 envoie ${pokemonJ2.nom} !`);
        });
      } else {
        indexJ1++;
        if (indexJ1 >= equipeJ1.length) {
          log(`Joueur 1 n'a plus de Pokémon ! Joueur 2 a gagné ! 🏆`);
          document.getElementById("boutons-attaques").innerHTML = "";
          document.querySelector("#zone-attaques h3").textContent = "Combat terminé !";
          return;
        }
        chargerPokemon(equipeJ1[indexJ1].numero, equipeJ1[indexJ1].attaques, equipeJ1[indexJ1]).then(p => {
          pokemonJ1 = p;
          pokemonJ1.objet = equipeJ1[indexJ1].objet || null;
          afficherPokemon();
          afficherAttaques();
          log(`Joueur 1 envoie ${pokemonJ1.nom} !`);
        });
      }
      return;
    }

    tourJoueur = tourJoueur === 1 ? 2 : 1;
    afficherAttaques();
  }, 500);
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
      data.stats.forEach(s => {
        stats[s.stat.name] = s.base_stat;
      });

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
      );

      return Promise.all(attaquesPromises).then(attaques => {
        let ivs = (pokeData && pokeData.ivs) || { hp: 31, attack: 31, defense: 31, "special-attack": 31, "special-defense": 31, speed: 31 };
        let evs = (pokeData && pokeData.evs) || { hp: 0, attack: 0, defense: 0, "special-attack": 0, "special-defense": 0, speed: 0 };

        let pvMax = calculerStat(stats["hp"], ivs.hp, evs.hp, 50, true);
        let attaqueStat = calculerStat(stats["attack"], ivs.attack, evs.attack, 50, false);
        let defenseStat = calculerStat(stats["defense"], ivs.defense, evs.defense, 50, false);
        let vitesseStat = calculerStat(stats["speed"], ivs.speed, evs.speed, 50, false);

        return {
          nom: data.name,
          numero: data.id,
          types: types,
          pvMax: pvMax,
          pvActuels: pvMax,
          attaque: attaqueStat,
          defense: defenseStat,
          vitesse: vitesseStat,
          attaques: attaques,
          objet: null,
          focusbanduise: false,
          baieUtilisee: false
        };
      });
    });
}

if (equipeJ1.length === 0 || equipeJ2.length === 0) {
  log("Équipes manquantes ! Retourne sur la page d'accueil.");
} else {
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