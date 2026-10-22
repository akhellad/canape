export interface Spectrum {
  left: string;
  right: string;
}

const RAW = `
Froid|Chaud
Nul|Génial
Pas romantique|Très romantique
Facile|Difficile
Inutile|Indispensable
Triste|Joyeux
Pas cher|Hors de prix
Moche|Magnifique
Calme|Bruyant
Sain|Mauvais pour la santé
Ennuyeux|Passionnant
Effrayant|Rassurant
Démodé|À la mode
Petit|Énorme
Lent|Rapide
Doux|Piquant
Salé|Sucré
Sérieux|Ridicule
Mauvaise idée|Excellente idée
Pour enfants|Pour adultes
Surcoté|Sous-coté
Sentiment faible|Sentiment fort
Ça sent mauvais|Ça sent bon
Pas sexy|Très sexy
Mou|Dur
Banal|Bizarre
Mauvais film|Chef-d'œuvre
Plat d'été|Plat d'hiver
Activité solo|Activité à deux
Rêve|Cauchemar
Mauvais cadeau|Cadeau parfait
Vieux|Jeune
Naturel|Artificiel
Dangereux|Sans danger
Gentil|Méchant
Rural|Urbain
Ringard|Classe
Nuit|Jour
Facile à cuisiner|Impossible à cuisiner
Prévisible|Surprenant
Fragile|Solide
Animal de compagnie nul|Animal de compagnie parfait
Vacances ratées|Vacances de rêve
Silencieux|Assourdissant
Léger|Lourd
Hors saison|De saison
Ça ne se partage pas|Ça se partage
Snob|Populaire
Tue-l'amour|Irrésistible
Inconnu|Mondialement connu
Malchance|Chance
Mauvais talent|Talent incroyable
Fade|Plein de goût
Paresseux|Énergique
Bon pour un premier rendez-vous|À éviter au premier rendez-vous
Endroit calme|Endroit animé
Héros|Méchant
Ça se mange froid|Ça se mange chaud
Sur la terre|Dans l'eau
Ça dure peu|Ça dure longtemps
Pas drôle|Hilarant
Collant|Glissant
Ça se fait en pyjama|Ça se fait sur son trente-et-un
Simple|Compliqué
Utile en couple|Inutile en couple
Mauvaise habitude|Bonne habitude
Normal|Étrange
Dispute rare|Dispute garantie
Petit plaisir|Grand bonheur
Sucré-salé raté|Sucré-salé réussi
Chanson triste|Chanson joyeuse
Vêtement moche|Vêtement stylé
Peu probable|Très probable
Ça s'oublie vite|Inoubliable
Facile à dire|Difficile à dire
Mauvaise excuse|Excellente excuse
Talent inutile|Talent utile
Prise de tête|Détente totale
Câlin|Bagarre
Repas rapide|Festin
`;

export const SPECTRUMS: Spectrum[] = RAW.trim()
  .split('\n')
  .map((line) => {
    const [left, right] = line.split('|');
    return { left, right };
  });
