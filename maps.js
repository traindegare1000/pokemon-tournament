const MAPS = [
  {
    id: "ligue-dp",
    nom: "Ligue Pokémon",
    jeu: "Diamant / Perle",
    emoji: "🏆",
    couleurFond: "#00c8c8",
    couleurSol: "#ffffff",
    couleurCercles: "#cc0000",
    couleurPlateforme: "#e0e0e0"
  },
  {
    id: "mont-argente",
    nom: "Mont Argenté",
    jeu: "Or / Argent",
    emoji: "🌋",
    couleurFond: "#404060",
    couleurSol: "#606080",
    couleurCercles: "#aaaacc",
    couleurPlateforme: "#808090"
  },
  {
    id: "mont-couronne",
    nom: "Mont Couronné",
    jeu: "Épée / Bouclier",
    emoji: "🏔️",
    couleurFond: "#a0c8e0",
    couleurSol: "#e0f0ff",
    couleurCercles: "#4488cc",
    couleurPlateforme: "#ffffff"
  },
  {
    id: "tour-doree",
    nom: "Tour Dorée",
    jeu: "Or / Argent",
    emoji: "🗼",
    couleurFond: "#c8a000",
    couleurSol: "#e0c040",
    couleurCercles: "#804000",
    couleurPlateforme: "#ffd700"
  },
  {
    id: "arene-feu",
    nom: "Arène de Carmines",
    jeu: "Rouge / Bleu",
    emoji: "🔥",
    couleurFond: "#400000",
    couleurSol: "#800000",
    couleurCercles: "#ff4400",
    couleurPlateforme: "#cc2200"
  },
  {
    id: "tour-combat",
    nom: "Tour de Combat",
    jeu: "Platine",
    emoji: "⚔️",
    couleurFond: "#001a00",
    couleurSol: "#003300",
    couleurCercles: "#00cc00",
    couleurPlateforme: "#004400"
  },
  {
    id: "jardin-safari",
    nom: "Jardin Safari",
    jeu: "Rouge / Bleu",
    emoji: "🌿",
    couleurFond: "#004000",
    couleurSol: "#006600",
    couleurCercles: "#88cc00",
    couleurPlateforme: "#228800"
  },
  {
    id: "celadopole",
    nom: "Céladopole",
    jeu: "Rouge / Bleu",
    emoji: "🏙️",
    couleurFond: "#004433",
    couleurSol: "#006655",
    couleurCercles: "#00ffaa",
    couleurPlateforme: "#008866"
  },
  {
    id: "ligue-kanto",
    nom: "Ligue Pokémon Kanto",
    jeu: "FireRed / LeafGreen",
    emoji: "🔴",
    couleurFond: "#800000",
    couleurSol: "#aa2222",
    couleurCercles: "#ffcc00",
    couleurPlateforme: "#cc4444"
  },
  {
    id: "arene-glace",
    nom: "Arène de Glace",
    jeu: "Diamant / Perle",
    emoji: "❄️",
    couleurFond: "#c0e8ff",
    couleurSol: "#e8f8ff",
    couleurCercles: "#0088cc",
    couleurPlateforme: "#ffffff"
  }
];

function getMapById(id) {
  return MAPS.find(m => m.id === id) || MAPS[0];
}

function appliquerMap(map) {
  // Supprimer ancien style CSS
  let ancienFond = document.getElementById("fond-combat-css");
  if (ancienFond) ancienFond.remove();

  let style = document.createElement("style");
  style.id = "fond-combat-css";
  style.textContent = `
    body {
      background-color: ${map.couleurFond} !important;
    }

    #arene {
      background: linear-gradient(
        180deg,
        ${map.couleurFond} 0%,
        ${map.couleurFond} 50%,
        ${map.couleurSol} 50%,
        ${map.couleurSol} 100%
      ) !important;
    }

    #zone-joueur2::after {
      background: ${map.couleurPlateforme} !important;
      opacity: 0.5;
    }

    #zone-joueur1::after {
      background: ${map.couleurPlateforme} !important;
      opacity: 0.5;
    }

    #log-combat {
      border-color: ${map.couleurCercles} !important;
    }

    #zone-attaques {
      border-color: ${map.couleurCercles} !important;
    }

    #zone-attaques h3 {
      color: ${map.couleurCercles} !important;
    }

    .btn-attaque {
      border-color: ${map.couleurCercles} !important;
    }

    .btn-attaque:hover {
      background-color: ${map.couleurCercles} !important;
    }

    #nom-map-affiche {
      color: ${map.couleurCercles} !important;
    }
  `;
  document.head.appendChild(style);

  // Nom de la map
  document.getElementById("nom-map-affiche").textContent = `${map.emoji} ${map.nom} — ${map.jeu}`;
}

function afficherGrilleMaps(onChoix) {
  let grille = document.getElementById("grille-maps");
  grille.innerHTML = "";

  MAPS.forEach(map => {
    let carte = document.createElement("div");
    carte.classList.add("carte-map");
    carte.style.borderColor = map.couleurCercles;
    carte.style.background = `linear-gradient(180deg, ${map.couleurFond} 50%, ${map.couleurSol} 100%)`;

    let overlay = document.createElement("div");
    overlay.classList.add("overlay-map");

    let emoji = document.createElement("div");
    emoji.classList.add("emoji-map");
    emoji.textContent = map.emoji;

    let nom = document.createElement("div");
    nom.classList.add("nom-map");
    nom.textContent = map.nom;
    nom.style.color = map.couleurCercles;

    let jeu = document.createElement("div");
    jeu.classList.add("jeu-map");
    jeu.textContent = map.jeu;

    overlay.appendChild(emoji);
    overlay.appendChild(nom);
    overlay.appendChild(jeu);
    carte.appendChild(overlay);

    carte.addEventListener("click", () => {
      document.querySelectorAll(".carte-map").forEach(c => c.classList.remove("selectionnee"));
      carte.classList.add("selectionnee");
      carte.style.boxShadow = `0 0 20px ${map.couleurCercles}`;
      onChoix(map.id);
    });

    grille.appendChild(carte);
  });
}