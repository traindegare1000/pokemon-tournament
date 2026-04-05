let equipe = [];
let pageActuelle = 0;
let totalPages = 0;
const parPage = 20;
let timer;
let tousLesPokemon = [];
let modeRecherche = false;
let pokemonEnPerso = null;
let timerAttaque;

const statsNoms = ["hp", "attack", "defense", "special-attack", "special-defense", "speed"];
const statsLabels = ["PV", "Attaque", "Défense", "Atk Spé", "Def Spé", "Vitesse"];

function afficherEquipe() {
  let slots = document.getElementById("slots");
  slots.innerHTML = "";

  for (let i = 0; i < 6; i++) {
    let slot = document.createElement("div");
    slot.classList.add("slot");

    if (equipe[i]) {
      let img = document.createElement("img");
      img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${equipe[i].numero}.png`;
      let nom = document.createElement("p");
      nom.textContent = equipe[i].nom;
      slot.appendChild(img);
      slot.appendChild(nom);
      slot.addEventListener("click", () => ouvrirPanneau(equipe[i]));
      slot.style.cursor = "pointer";
    } else {
      slot.textContent = "Vide";
    }

    slots.appendChild(slot);
  }
}

function ouvrirPanneau(pokemon) {
  pokemonEnPerso = pokemon;
  document.getElementById("titre-perso").textContent = `Personnaliser ${pokemon.nom}`;
  document.getElementById("panneau-perso").classList.add("ouvert");
  afficherAttaquesChoisies();
  afficherIVEV();
  afficherObjets();
  chargerAttaquesDisponibles(pokemon.numero);
}

function fermerPanneau() {
  document.getElementById("panneau-perso").classList.remove("ouvert");
  pokemonEnPerso = null;
}

function afficherIVEV() {
  let conteneur = document.getElementById("tableau-ivev");
  conteneur.innerHTML = "";

  if (!pokemonEnPerso.ivs) {
    pokemonEnPerso.ivs = { hp: 31, attack: 31, defense: 31, "special-attack": 31, "special-defense": 31, speed: 31 };
  }
  if (!pokemonEnPerso.evs) {
    pokemonEnPerso.evs = { hp: 0, attack: 0, defense: 0, "special-attack": 0, "special-defense": 0, speed: 0 };
  }

  statsNoms.forEach((stat, i) => {
    let ligne = document.createElement("div");
    ligne.classList.add("ligne-stat");

    let label = document.createElement("label");
    label.textContent = statsLabels[i];

    let inputIV = document.createElement("input");
    inputIV.type = "number";
    inputIV.min = 0;
    inputIV.max = 31;
    inputIV.value = pokemonEnPerso.ivs[stat];
    inputIV.title = "IV (0-31)";

    let inputEV = document.createElement("input");
    inputEV.type = "number";
    inputEV.min = 0;
    inputEV.max = 252;
    inputEV.value = pokemonEnPerso.evs[stat];
    inputEV.title = "EV (0-252)";

    let spanInfo = document.createElement("span");
    spanInfo.textContent = "IV / EV";

    inputIV.addEventListener("change", () => {
      pokemonEnPerso.ivs[stat] = Math.min(31, Math.max(0, parseInt(inputIV.value) || 0));
      inputIV.value = pokemonEnPerso.ivs[stat];
    });

    inputEV.addEventListener("change", () => {
      let totalEV = Object.values(pokemonEnPerso.evs).reduce((a, b) => a + b, 0);
      let ancienneValeur = pokemonEnPerso.evs[stat];
      let nouvelleValeur = Math.min(252, Math.max(0, parseInt(inputEV.value) || 0));
      let diff = nouvelleValeur - ancienneValeur;

      if (totalEV + diff > 510) {
        nouvelleValeur = ancienneValeur + (510 - totalEV);
      }

      pokemonEnPerso.evs[stat] = nouvelleValeur;
      inputEV.value = nouvelleValeur;
      mettreAJourTotalEV();
    });

    ligne.appendChild(label);
    ligne.appendChild(inputIV);
    ligne.appendChild(inputEV);
    ligne.appendChild(spanInfo);
    conteneur.appendChild(ligne);
  });

  mettreAJourTotalEV();
}

function mettreAJourTotalEV() {
  if (!pokemonEnPerso.evs) return;
  let total = Object.values(pokemonEnPerso.evs).reduce((a, b) => a + b, 0);
  document.getElementById("total-ev").textContent = `EVs utilisés : ${total} / 510`;
}

function afficherObjets() {
  let conteneur = document.getElementById("liste-objets");
  conteneur.innerHTML = "<p style='color:gray'>Chargement des objets...</p>";

  let rechercheInput = document.createElement("input");
  rechercheInput.type = "text";
  rechercheInput.placeholder = "Rechercher un objet...";
  rechercheInput.style.cssText = "padding:8px;border-radius:5px;border:2px solid #ffcb05;background:#1a1a2e;color:white;width:100%;margin-bottom:10px;box-sizing:border-box;";

  chargerTousLesObjets().then(objets => {
    conteneur.innerHTML = "";
    conteneur.appendChild(rechercheInput);

    let listeDiv = document.createElement("div");
    listeDiv.style.cssText = "display:flex;flex-wrap:wrap;gap:8px;max-height:150px;overflow-y:auto;";
    conteneur.appendChild(listeDiv);

    function afficherListeObjets(filtre) {
      listeDiv.innerHTML = "";
      let objetsFiltres = objets.filter(o => o.nom.includes(filtre));

      objetsFiltres.forEach(objet => {
        let btn = document.createElement("button");
        btn.classList.add("btn-objet");
        btn.textContent = objet.nom;
        btn.title = objet.description;

        if (pokemonEnPerso.objet && pokemonEnPerso.objet.nom === objet.nom) {
          btn.classList.add("selectionne");
        }

        btn.addEventListener("click", () => {
          pokemonEnPerso.objet = objet;
          afficherObjets();
        });

        listeDiv.appendChild(btn);
      });
    }

    afficherListeObjets("");

    rechercheInput.addEventListener("input", () => {
      afficherListeObjets(rechercheInput.value.toLowerCase());
    });
  });
}

function afficherAttaquesChoisies() {
  let conteneur = document.getElementById("liste-attaques-choisies");
  conteneur.innerHTML = "";

  if (!pokemonEnPerso.attaques || pokemonEnPerso.attaques.length === 0) {
    conteneur.innerHTML = "<p style='color:gray'>Aucune attaque choisie</p>";
    return;
  }

  pokemonEnPerso.attaques.forEach((attaque, index) => {
    let btn = document.createElement("button");
    btn.classList.add("btn-attaque-perso", "choisie");
    btn.textContent = `❌ ${attaque.nom}`;
    btn.addEventListener("click", () => {
      pokemonEnPerso.attaques.splice(index, 1);
      afficherAttaquesChoisies();
      chargerAttaquesDisponibles(pokemonEnPerso.numero);
    });
    conteneur.appendChild(btn);
  });
}

function chargerAttaquesDisponibles(numero) {
  let recherche = document.getElementById("recherche-attaque").value.toLowerCase();

  fetch(`https://pokeapi.co/api/v2/pokemon/${numero}`)
    .then(r => r.json())
    .then(data => {
      let conteneur = document.getElementById("liste-attaques-disponibles");
      conteneur.innerHTML = "";

      let attaques = data.moves
        .map(m => m.move.name)
        .filter(nom => nom.includes(recherche))
        .filter(nom => !pokemonEnPerso.attaques || !pokemonEnPerso.attaques.find(a => a.nom === nom));

      attaques.forEach(nomAttaque => {
        let btn = document.createElement("button");
        btn.classList.add("btn-attaque-perso");
        btn.textContent = `+ ${nomAttaque}`;
        btn.addEventListener("click", () => {
          if (!pokemonEnPerso.attaques) pokemonEnPerso.attaques = [];
          if (pokemonEnPerso.attaques.length >= 4) {
            alert("Tu ne peux pas avoir plus de 4 attaques !");
            return;
          }
          pokemonEnPerso.attaques.push({ nom: nomAttaque, puissance: 50, type: "normal" });
          afficherAttaquesChoisies();
          chargerAttaquesDisponibles(numero);
        });
        conteneur.appendChild(btn);
      });
    });
}

document.getElementById("recherche-attaque").addEventListener("input", () => {
  clearTimeout(timerAttaque);
  timerAttaque = setTimeout(() => {
    if (pokemonEnPerso) chargerAttaquesDisponibles(pokemonEnPerso.numero);
  }, 300);
});

function creerCarte(nomPokemon, numero) {
  let carte = document.createElement("div");
  carte.classList.add("carte-pokemon");

  if (equipe.find(p => p.nom === nomPokemon)) {
    carte.classList.add("selectionne");
  }

  let img = document.createElement("img");
  img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${numero}.png`;

  let nom = document.createElement("p");
  nom.textContent = nomPokemon;

  carte.appendChild(img);
  carte.appendChild(nom);

  carte.addEventListener("click", () => {
    if (equipe.find(p => p.nom === nomPokemon)) {
      equipe = equipe.filter(p => p.nom !== nomPokemon);
      carte.classList.remove("selectionne");
    } else if (equipe.length < 6) {
      equipe.push({ nom: nomPokemon, numero: numero, attaques: [] });
      carte.classList.add("selectionne");
    }
    afficherEquipe();
  });

  return carte;
}

function chargerPage(page) {
  let offset = page * parPage;
  let conteneur = document.getElementById("liste-pokemon");
  conteneur.innerHTML = "";

  fetch(`https://pokeapi.co/api/v2/pokemon?limit=${parPage}&offset=${offset}`)
    .then(response => response.json())
    .then(data => {
      totalPages = Math.ceil(data.count / parPage);
      document.getElementById("info-page").textContent = `Page ${page + 1} / ${totalPages}`;

      data.results.forEach((pokemon, index) => {
        let numero = offset + index + 1;
        let carte = creerCarte(pokemon.name, numero);
        conteneur.appendChild(carte);
      });
    });
}

function afficherResultatsRecherche(resultats) {
  let conteneur = document.getElementById("liste-pokemon");
  conteneur.innerHTML = "";

  if (resultats.length === 0) {
    conteneur.innerHTML = "<p>Aucun Pokémon trouvé...</p>";
    return;
  }

  resultats.forEach(pokemon => {
    let carte = creerCarte(pokemon.name, pokemon.numero);
    conteneur.appendChild(carte);
  });
}

document.getElementById("btn-suivant").addEventListener("click", () => {
  if (pageActuelle < totalPages - 1) {
    pageActuelle++;
    chargerPage(pageActuelle);
  }
});

document.getElementById("btn-precedent").addEventListener("click", () => {
  if (pageActuelle > 0) {
    pageActuelle--;
    chargerPage(pageActuelle);
  }
});

document.getElementById("input-recherche").addEventListener("input", (e) => {
  let recherche = e.target.value.toLowerCase().trim();
  clearTimeout(timer);

  if (recherche === "") {
    modeRecherche = false;
    document.getElementById("navigation").style.display = "flex";
    chargerPage(pageActuelle);
    return;
  }

  modeRecherche = true;
  document.getElementById("navigation").style.display = "none";

  timer = setTimeout(() => {
    let resultats = tousLesPokemon.filter(p =>
      p.name.startsWith(recherche)
    ).map(p => ({ name: p.name, numero: p.numero }));
    afficherResultatsRecherche(resultats);
  }, 300);
});

fetch("https://pokeapi.co/api/v2/pokemon?limit=1350")
  .then(response => response.json())
  .then(data => {
    tousLesPokemon = data.results.map((p, index) => ({
      name: p.name,
      numero: index + 1
    }));
  });

function lancerCombat() {
  if (equipe.length === 0) {
    alert("Tu dois sélectionner au moins 1 Pokémon !");
    return;
  }

  let joueur = localStorage.getItem("joueurActuel") || "1";
  let modeEquipeMulti = localStorage.getItem("modeEquipeMulti");

  if (modeEquipeMulti === "true") {
    if (joueur === "1") {
      localStorage.setItem("equipeJ1", JSON.stringify(equipe));
    } else {
      localStorage.setItem("equipeJ2", JSON.stringify(equipe));
    }
    localStorage.removeItem("modeEquipeMulti");
    window.location.href = "multijoueur.html";
  } else if (joueur === "1") {
    localStorage.setItem("equipeJ1", JSON.stringify(equipe));
    window.location.href = "accueil.html";
  } else {
    localStorage.setItem("equipeJ2", JSON.stringify(equipe));
    window.location.href = "accueil.html";
  }
}


afficherEquipe();
chargerPage(pageActuelle);