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
    nom: "Arène de Palkberg",
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
  let arene = document.getElementById("arene");

  // Fond principal
  arene.style.background = map.couleurFond;
  arene.style.borderColor = map.couleurCercles;

  // Créer le sol style Pokémon DS
  arene.style.position = "relative";
  arene.style.overflow = "hidden";

  // Supprimer ancien fond CSS
  let ancienFond = document.getElementById("fond-combat-css");
  if (ancienFond) ancienFond.remove();

  // Injecter le fond CSS dynamiquement
  let style = document.createElement("style");
  style.id = "fond-combat-css";
  style.textContent = `
    #arene {
      background: linear-gradient(
        180deg,
        ${map.couleurFond} 0%,
        ${map.couleurFond} 55%,
        ${map.couleurSol} 55%,
        ${map.couleurSol} 100%
      ) !important;
    }

    #arene::before {
      content: "";
      position: absolute;
      bottom: 0; left: 0;
      width: 100%; height: 50%;
      background:
        radial-gradient(ellipse 18px 8px at 8% 70%, ${map.couleurCercles} 60%, transparent 65%),
        radial-gradient(ellipse 18px 8px at 18% 70%, ${map.couleurCercles} 60%, transparent 65%),
        radial-gradient(ellipse 18px 8px at 28% 70%, ${map.couleurCercles} 60%, transparent 65%),
        radial-gradient(ellipse 18px 8px at 38% 70%, ${map.couleurCercles} 60%, transparent 65%),
        radial-gradient(ellipse 18px 8px at 48% 70%, ${map.couleurCercles} 60%, transparent 65%),
        radial-gradient(ellipse 18px 8px at 58% 70%, ${map.couleurCercles} 60%, transparent 65%),
        radial-gradient(ellipse 18px 8px at 68% 70%, ${map.couleurCercles} 60%, transparent 65%),
        radial-gradient(ellipse 18px 8px at 78% 70%, ${map.couleurCercles} 60%, transparent 65%),
        radial-gradient(ellipse 18px 8px at 88% 70%, ${map.couleurCercles} 60%, transparent 65%),
        radial-gradient(ellipse 18px 8px at 98% 70%, ${map.couleurCercles} 60%, transparent 65%),
        radial-gradient(ellipse 18px 8px at 8% 90%, ${map.couleurCercles} 60%, transparent 65%),
        radial-gradient(ellipse 18px 8px at 18% 90%, ${map.couleurCercles} 60%, transparent 65%),
        radial-gradient(ellipse 18px 8px at 28% 90%, ${map.couleurCercles} 60%, transparent 65%),
        radial-gradient(ellipse 18px 8px at 38% 90%, ${map.couleurCercles} 60%, transparent 65%),
        radial-gradient(ellipse 18px 8px at 48% 90%, ${map.couleurCercles} 60%, transparent 65%),
        radial-gradient(ellipse 18px 8px at 58% 90%, ${map.couleurCercles} 60%, transparent 65%),
        radial-gradient(ellipse 18px 8px at 68% 90%, ${map.couleurCercles} 60%, transparent 65%),
        radial-gradient(ellipse 18px 8px at 78% 90%, ${map.couleurCercles} 60%, transparent 65%),
        radial-gradient(ellipse 18px 8px at 88% 90%, ${map.couleurCercles} 60%, transparent 65%),
        radial-gradient(ellipse 18px 8px at 98% 90%, ${map.couleurCercles} 60%, transparent 65%);
    }

    /* Plateforme joueur 2 (en haut à droite) */
    #zone-joueur2::before {
      content: "";
      position: absolute;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      width: 120px;
      height: 30px;
      background: ${map.couleurPlateforme};
      border-radius: 50%;
      opacity: 0.6;
      z-index: 0;
    }

    /* Plateforme joueur 1 (en bas à gauche) */
    #zone-joueur1::before {
      content: "";
      position: absolute;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      width: 120px;
      height: 30px;
      background: ${map.couleurPlateforme};
      border-radius: 50%;
      opacity: 0.6;
      z-index: 0;
    }

    #zone-joueur1, #zone-joueur2 {
      position: relative;
    }
  `;
  document.head.appendChild(style);

  // Nom de la map
  document.getElementById("nom-map-affiche").textContent = `${map.emoji} ${map.nom} — ${map.jeu}`;
  document.getElementById("nom-map-affiche").style.color = map.couleurCercles;

  // Fond de page
  document.body.style.backgroundColor = map.couleurFond;
}

function afficherGrilleMaps(onChoix) {
  let grille = document.getElementById("grille-maps");
  grille.innerHTML = "";

  MAPS.forEach(map => {
    let carte = document.createElement("div");
    carte.classList.add("carte-map");
    carte.style.borderColor = map.couleurCercles;
    carte.style.background = `linear-gradient(180deg, ${map.couleurFond} 55%, ${map.couleurSol} 100%)`;

    // Mini cercles décoratifs
    let miniCercles = document.createElement("div");
    miniCercles.classList.add("mini-cercles");
    miniCercles.style.cssText = `
      position:absolute; bottom:8px; left:0; width:100%;
      display:flex; justify-content:center; gap:5px;
    `;
    for (let i = 0; i < 5; i++) {
      let c = document.createElement("div");
      c.style.cssText = `
        width:10px; height:5px;
        background:${map.couleurCercles};
        border-radius:50%;
        opacity:0.8;
      `;
      miniCercles.appendChild(c);
    }

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
    carte.appendChild(miniCercles);

    carte.addEventListener("click", () => {
      document.querySelectorAll(".carte-map").forEach(c => c.classList.remove("selectionnee"));
      carte.classList.add("selectionnee");
      carte.style.boxShadow = `0 0 20px ${map.couleurCercles}`;
      onChoix(map.id);
    });

    grille.appendChild(carte);
  });
}