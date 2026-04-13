// Détecte quelle page on est pour choisir le bon thème
const page = window.location.pathname;
let theme = "kyogre"; // défaut

if (page.includes("solo")) theme = "hooh";
else if (page.includes("multijoueur")) theme = "reshiram";
else if (page.includes("tournoi")) theme = "giratina";

const themes = {
  kyogre: {
    fondCouleur1: "#000a3a",
    fondCouleur2: "#001a6e",
    particules: "bulles",
    couleurParticules: "rgba(100, 180, 255, 0.3)",
    filtre: "hue-rotate(0deg) brightness(0.4) saturate(1.5)"
  },
  hooh: {
    fondCouleur1: "#2a0a00",
    fondCouleur2: "#5a1a00",
    particules: "flammes",
    couleurParticules: "rgba(255, 120, 0, 0.4)",
    filtre: "hue-rotate(0deg) brightness(0.4) saturate(1.5)"
  },
  reshiram: {
    fondCouleur1: "#0a0a0a",
    fondCouleur2: "#1a1a3a",
    particules: "eclairs",
    couleurParticules: "rgba(255, 255, 150, 0.5)",
    filtre: "brightness(0.4) saturate(0.5)"
  },
  giratina: {
    fondCouleur1: "#0a000a",
    fondCouleur2: "#1a001a",
    particules: "ombres",
    couleurParticules: "rgba(150, 0, 200, 0.3)",
    filtre: "brightness(0.3) saturate(1.2)"
  },
};

const t = themes[theme];

// Appliquer fond
document.body.style.background = `radial-gradient(ellipse at center, ${t.fondCouleur2} 0%, ${t.fondCouleur1} 100%)`;

// Style du sprite légendaire
const sprite = document.getElementById("sprite-legendaire");
if (sprite) {
  sprite.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 600px;
    height: 600px;
    object-fit: contain;
    filter: ${t.filtre};
    z-index: 0;
    pointer-events: none;
    animation: legendaire-flottement 6s ease-in-out infinite;
  `;
}

// Animation CSS flottement
const styleAnim = document.createElement("style");
styleAnim.textContent = `
  @keyframes legendaire-flottement {
    0%, 100% {
      transform: translate(-50%, -50%) scale(1) rotate(-2deg);
    }
    25% {
      transform: translate(-48%, -52%) scale(1.03) rotate(0deg);
    }
    50% {
      transform: translate(-50%, -48%) scale(1.05) rotate(2deg);
    }
    75% {
      transform: translate(-52%, -51%) scale(1.02) rotate(0deg);
    }
  }

#page-accueil, #page-solo, #page-multi, #section-creation,
  #section-rejoindre, #section-tournoi {
    position: relative;
    z-index: 2;
    background: transparent !important;
  }

  #canvas-fond {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    z-index: 1;
    pointer-events: none;
  }

  #sprite-legendaire {
    z-index: 1 !important;
  }

  .carte-mode {
    background: linear-gradient(135deg, rgba(22, 33, 62, 0.85) 0%, rgba(15, 52, 96, 0.85) 100%) !important;
    backdrop-filter: blur(5px);
  }
`;
document.head.appendChild(styleAnim);

// Canvas pour les particules
const canvas = document.getElementById("canvas-fond");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// Créer les particules selon le thème
let particules = [];

function creerParticule() {
  if (t.particules === "bulles") {
    return {
      x: Math.random() * canvas.width,
      y: canvas.height + 20,
      rayon: Math.random() * 20 + 5,
      vitesse: Math.random() * 1.5 + 0.5,
      opacite: Math.random() * 0.4 + 0.1,
      oscillation: Math.random() * 2 - 1
    };
  } else if (t.particules === "flammes") {
    return {
      x: Math.random() * canvas.width,
      y: canvas.height + 20,
      rayon: Math.random() * 15 + 3,
      vitesse: Math.random() * 2 + 1,
      opacite: Math.random() * 0.5 + 0.2,
      oscillation: Math.random() * 3 - 1.5,
      rouge: Math.floor(Math.random() * 55 + 200),
      vert: Math.floor(Math.random() * 100 + 50)
    };
  } else if (t.particules === "eclairs") {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      longueur: Math.random() * 80 + 20,
      opacite: 0,
      vie: 0,
      vieMax: Math.random() * 20 + 5
    };
  } else if (t.particules === "ombres") {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      rayon: Math.random() * 30 + 10,
      vitesseX: (Math.random() - 0.5) * 1,
      vitesseY: (Math.random() - 0.5) * 1,
      opacite: Math.random() * 0.3 + 0.1
    };
  }
}

// Initialiser particules
for (let i = 0; i < 30; i++) {
  let p = creerParticule();
  if (t.particules === "bulles" || t.particules === "flammes") {
    p.y = Math.random() * canvas.height;
  }
  particules.push(p);
}

function animerParticules() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particules.forEach((p, index) => {
    if (t.particules === "bulles") {
      // Monter et osciller
      p.y -= p.vitesse;
      p.x += Math.sin(p.y * 0.02) * p.oscillation;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.rayon, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(100, 180, 255, ${p.opacite})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = `rgba(150, 200, 255, ${p.opacite * 0.3})`;
      ctx.fill();

      if (p.y < -20) particules[index] = creerParticule();

    } else if (t.particules === "flammes") {
      // Monter vite et osciller
      p.y -= p.vitesse;
      p.x += Math.sin(p.y * 0.05) * p.oscillation;
      p.rayon *= 0.99;
      p.opacite -= 0.005;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.rayon, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.rouge}, ${p.vert}, 0, ${p.opacite})`;
      ctx.fill();

      if (p.y < -20 || p.opacite <= 0) particules[index] = creerParticule();

    } else if (t.particules === "eclairs") {
      // Clignoter
      p.vie++;
      if (p.vie < p.vieMax / 2) {
        p.opacite = p.vie / (p.vieMax / 2);
      } else {
        p.opacite = 1 - (p.vie - p.vieMax / 2) / (p.vieMax / 2);
      }

      if (p.opacite > 0) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        let zigzag = 5;
        for (let j = 0; j < p.longueur; j += 10) {
          zigzag = -zigzag;
          ctx.lineTo(p.x + zigzag, p.y + j);
        }
        ctx.strokeStyle = `rgba(255, 255, 150, ${p.opacite * 0.7})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      if (p.vie >= p.vieMax) particules[index] = creerParticule();

    } else if (t.particules === "ombres") {
      // Flotter lentement
      p.x += p.vitesseX;
      p.y += p.vitesseY;

      if (p.x < -50) p.x = canvas.width + 50;
      if (p.x > canvas.width + 50) p.x = -50;
      if (p.y < -50) p.y = canvas.height + 50;
      if (p.y > canvas.height + 50) p.y = -50;

      let gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.rayon);
      gradient.addColorStop(0, `rgba(80, 80, 80, ${p.opacite})`);
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.rayon, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  requestAnimationFrame(animerParticules);
}

animerParticules();