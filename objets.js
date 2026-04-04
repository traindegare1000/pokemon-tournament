const effetsObjets = {
  "life-orb": { effet: "orbe-vie", description: "+30% dégâts, perd 10% PV par tour" },
  "leftovers": { effet: "restes", description: "Récupère 6% PV par tour" },
  "choice-band": { effet: "ceinture-choix", description: "+50% attaque, bloqué sur une attaque" },
  "choice-scarf": { effet: "foulard-choix", description: "+50% vitesse, bloqué sur une attaque" },
  "choice-specs": { effet: "lunettes-choix", description: "+50% attaque spéciale" },
  "focus-band": { effet: "focusband", description: "Survit avec 1 PV une fois" },
  "sitrus-berry": { effet: "baie-sitrus", description: "Récupère 25% PV quand PV < 50%" },
  "rocky-helmet": { effet: "caillou-dur", description: "+50% défense" },
  "assault-vest": { effet: "veste-agression", description: "+50% défense spéciale" },
  "eviolite": { effet: "eviolite", description: "+50% défense et défense spéciale si pas évolué" },
  "flame-orb": { effet: "orbe-flamme", description: "Brûle le porteur après le 1er tour" },
  "toxic-orb": { effet: "orbe-toxique", description: "Empoisonne le porteur après le 1er tour" },
  "black-sludge": { effet: "boue-noire", description: "Poison: récupère PV, sinon perd PV" },
  "lum-berry": { effet: "baie-lum", description: "Guérit tous les statuts une fois" },
  "weakness-policy": { effet: "police-faiblesse", description: "+2 ATK et ATK Spé si touché par une attaque super efficace" },
};

let tousLesObjets = [];

function chargerTousLesObjets() {
  return fetch("https://pokeapi.co/api/v2/item?limit=200")
    .then(r => r.json())
    .then(data => {
      tousLesObjets = data.results.map(item => {
        let effetConnu = effetsObjets[item.name];
        return {
          nom: item.name,
          description: effetConnu ? effetConnu.description : "Aucun effet en combat",
          effet: effetConnu ? effetConnu.effet : null
        };
      });
      tousLesObjets.unshift({ nom: "Aucun objet", description: "Pas d'objet tenu", effet: null });
      return tousLesObjets;
    });
}