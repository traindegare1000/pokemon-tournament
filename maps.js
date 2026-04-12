const MAPS = [
  {
    id: "mont-couronne",
    nom: "Mont Couronné",
    jeu: "Épée / Bouclier",
    emoji: "🏔️",
    image: "https://archives.bulbagarden.net/media/upload/thumb/4/43/Sword_Shield_Crown_Tundra.png/1200px-Sword_Shield_Crown_Tundra.png",
    couleur: "#1a3a5c",
    couleurSecondaire: "#4a9edd"
  },
  {
    id: "mont-argente",
    nom: "Mont Argenté",
    jeu: "Or / Argent",
    emoji: "🌋",
    image: "https://archives.bulbagarden.net/media/upload/thumb/b/b5/Mt_Silver_GSC.png/800px-Mt_Silver_GSC.png",
    couleur: "#2a2a3a",
    couleurSecondaire: "#aaaacc"
  },
  {
    id: "ligue-pokemon-dp",
    nom: "Ligue Pokémon",
    jeu: "Diamant / Perle",
    emoji: "🏆",
    image: "https://archives.bulbagarden.net/media/upload/thumb/4/43/Sinnoh_Pokemon_League_DP.png/800px-Sinnoh_Pokemon_League_DP.png",
    couleur: "#1a1a3a",
    couleurSecondaire: "#ffcb05"
  },
  {
    id: "tour-doree",
    nom: "Tour Dorée",
    jeu: "Or / Argent",
    emoji: "🗼",
    image: "https://archives.bulbagarden.net/media/upload/thumb/6/6f/Tin_Tower_GSC.png/800px-Tin_Tower_GSC.png",
    couleur: "#3a2a00",
    couleurSecondaire: "#ffd700"
  },
  {
    id: "arene-pyro",
    nom: "Arène de Carmines",
    jeu: "Rouge / Bleu",
    emoji: "🔥",
    image: "https://archives.bulbagarden.net/media/upload/thumb/8/8e/Cinnabar_Gym_RBY.png/800px-Cinnabar_Gym_RBY.png",
    couleur: "#3a0a00",
    couleurSecondaire: "#ff4400"
  },
  {
    id: "tour-combat",
    nom: "Tour de Combat",
    jeu: "Platine",
    emoji: "⚔️",
    image: "https://archives.bulbagarden.net/media/upload/thumb/9/9e/Battle_Tower_Pt.png/800px-Battle_Tower_Pt.png",
    couleur: "#1a2a1a",
    couleurSecondaire: "#44ff44"
  },
  {
    id: "jardin-safari",
    nom: "Jardin Safari",
    jeu: "Rouge / Bleu",
    emoji: "🌿",
    image: "https://archives.bulbagarden.net/media/upload/thumb/7/7b/Safari_Zone_RBY.png/800px-Safari_Zone_RBY.png",
    couleur: "#0a2a0a",
    couleurSecondaire: "#44aa44"
  },
  {
    id: "celadopole",
    nom: "Céladopole",
    jeu: "Rouge / Bleu",
    emoji: "🏙️",
    image: "https://archives.bulbagarden.net/media/upload/thumb/8/8a/Celadon_City_RBY.png/800px-Celadon_City_RBY.png",
    couleur: "#0a2a1a",
    couleurSecondaire: "#44ffaa"
  }
];

function getMapById(id) {
  return MAPS.find(m => m.id === id) || MAPS[0];
}

function appliquerMap(map) {
  document.getElementById("arene").style.backgroundImage = `url('${map.image}')`;
  document.getElementById("arene").style.backgroundSize = "cover";
  document.getElementById("arene").style.backgroundPosition = "center";
  document.getElementById("arene").style.borderColor = map.couleurSecondaire;

  document.getElementById("nom-map-affiche").textContent = `${map.emoji} ${map.nom} — ${map.jeu}`;
  document.getElementById("nom-map-affiche").style.color = map.couleurSecondaire;

  document.body.style.backgroundColor = map.couleur;
}

function afficherGrilleMaps(onChoix) {
  let grille = document.getElementById("grille-maps");
  grille.innerHTML = "";

  MAPS.forEach(map => {
    let carte = document.createElement("div");
    carte.classList.add("carte-map");
    carte.style.borderColor = map.couleurSecondaire;
    carte.style.backgroundImage = `url('${map.image}')`;

    let overlay = document.createElement("div");
    overlay.classList.add("overlay-map");
    overlay.style.backgroundColor = map.couleur + "cc";

    let emoji = document.createElement("div");
    emoji.classList.add("emoji-map");
    emoji.textContent = map.emoji;

    let nom = document.createElement("div");
    nom.classList.add("nom-map");
    nom.textContent = map.nom;

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
      onChoix(map.id);
    });

    grille.appendChild(carte);
  });
}