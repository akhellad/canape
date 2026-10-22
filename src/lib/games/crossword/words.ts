export interface Entry {
  word: string;
  clue: string;
}

/** Answers are written in capitals without accents, the way crossword grids are. */
const RAW = `
ABEILLE|Elle fait le miel
ABRICOT|Fruit orange à noyau
ACTEUR|Il joue la comédie
ADIEU|On le dit en partant pour longtemps
AGNEAU|Petit de la brebis
AIGLE|Rapace royal
AIMANT|Il attire le fer
ALBUM|On y colle les photos
ALLUMETTE|Petit bâton qui s'enflamme
AMANDE|Fruit sec du frangipane
AMOUR|Sentiment des amoureux
ANANAS|Fruit tropical à couronne
ANCRE|Elle retient le bateau
ANGE|Il a des ailes et une auréole
ANNIVERSAIRE|Fête avec des bougies
ARAIGNEE|Elle tisse sa toile
ARBRE|Il a un tronc et des branches
ARC|Il lance des flèches
ARGENT|Métal ou monnaie
ARMOIRE|On y range ses vêtements
ARROSOIR|Pour donner à boire aux plantes
ASPERGE|Légume vert tout en longueur
ASTRONAUTE|Il voyage dans l'espace
ATLAS|Livre de cartes
AUBE|Lever du jour
AUTOBUS|Transport en commun sur roues
AVION|Il vole avec des passagers
AVOCAT|Fruit vert ou métier du tribunal
BAGUE|Bijou pour le doigt
BAGUETTE|Pain long ou bâton de magicien
BAIGNOIRE|On y prend un bain
BALAI|Il sert à nettoyer le sol
BALEINE|Le plus gros des mammifères marins
BALLON|On joue au foot avec
BANANE|Fruit jaune courbé
BANC|Siège dans un parc
BARBE|Poils du menton
BATEAU|Il flotte sur l'eau
BEBE|Tout-petit
BEURRE|On l'étale sur les tartines
BIBERON|Pour donner le lait au bébé
BIJOU|Collier ou bracelet
BISOU|Petit baiser
BLE|Céréale du pain
BOUCHE|On parle et on mange avec
BOUGIE|Elle éclaire avec une flamme
BOUQUET|Fleurs offertes
BOUSSOLE|Elle indique le nord
BRAS|Membre supérieur
BROSSE|Pour les cheveux ou les dents
BRUME|Léger brouillard
BUREAU|Meuble de travail
CACAO|Base du chocolat
CADEAU|On l'offre emballé
CAFE|Boisson noire du matin
CAHIER|On écrit dedans à l'école
CALIN|Tendre étreinte
CAMION|Gros véhicule de transport
CANAPE|On s'y installe devant la télé
CANARD|Il fait coin-coin
CAROTTE|Légume orange des lapins
CARTE|Pour jouer ou se repérer
CASQUE|Il protège la tête
CASTOR|Il construit des barrages
CERISE|Petit fruit rouge à queue
CERVEAU|Organe de la pensée
CHAISE|Siège à dossier
CHAMEAU|Il a deux bosses
CHAMPAGNE|Bulles des grandes fêtes
CHANSON|On la fredonne
CHAPEAU|Il se porte sur la tête
CHAT|Il miaule
CHATEAU|Demeure de roi
CHAUSSETTE|Elle va dans la chaussure
CHEMINEE|On y fait du feu
CHEVAL|On le monte au galop
CHIEN|Meilleur ami de l'homme
CHOCOLAT|Douceur à base de cacao
CIEL|Il est bleu quand il fait beau
CINEMA|On y voit des films
CIRQUE|Clowns et acrobates
CITRON|Agrume acide
CLE|Elle ouvre la serrure
CLOWN|Il a un nez rouge
COCHON|Il fait groin-groin
COEUR|Il bat dans la poitrine
COLLIER|Bijou du cou
COMETE|Astre à longue queue
CONCERT|Spectacle de musique
COQ|Il chante au lever du soleil
COQUILLAGE|On le ramasse sur la plage
CORDE|On saute avec
COUSSIN|Petit oreiller du canapé
COUTEAU|Il coupe
CRABE|Il marche de côté
CRAYON|Pour dessiner
CREPE|Galette sucrée de la Chandeleur
CROCODILE|Reptile aux grandes dents
CUISINE|Pièce où l'on prépare les repas
DANSE|Valse ou tango
DAUPHIN|Mammifère marin très joueur
DE|Il a six faces
DENT|On la brosse
DESERT|Étendue de sable
DESSERT|Fin sucrée du repas
DIAMANT|Pierre précieuse très dure
DIMANCHE|Jour de repos
DINOSAURE|Géant disparu
DOIGT|Il y en a cinq par main
DOUCHE|Toilette debout
DRAGON|Il crache du feu
DRAP|Il couvre le matelas
ECHARPE|Elle tient chaud au cou
ECHELLE|Pour monter sur le toit
ECLAIR|Lumière de l'orage
ECOLE|On y apprend à lire
ECUREUIL|Il aime les noisettes
ELEPHANT|Il a une trompe
ENFANT|Petit garçon ou petite fille
EPEE|Arme du chevalier
EPONGE|Elle absorbe l'eau
ESCALIER|Suite de marches
ETE|Saison chaude
ETOILE|Elle brille la nuit
FARINE|Poudre pour faire le pain
FEE|Elle a une baguette magique
FENETRE|On regarde dehors par elle
FER|Métal du forgeron
FERME|Maison des vaches et des poules
FEU|Il brûle
FEUILLE|Elle tombe en automne
FIANCE|Futur marié
FLEUR|Rose ou tulipe
FLEUVE|Il se jette dans la mer
FLUTE|Instrument à vent
FORET|Beaucoup d'arbres
FOURCHETTE|Couvert à dents
FRAISE|Petit fruit rouge du printemps
FROMAGE|Camembert ou comté
FUSEE|Elle part dans l'espace
GANT|Il habille la main
GARAGE|Abri pour la voiture
GATEAU|Dessert d'anniversaire
GIRAFE|Elle a un long cou
GLACE|Dessert froid ou miroir
GORILLE|Grand singe
GOUTTE|Petite quantité de pluie
GRENOUILLE|Elle coasse
GUITARE|Instrument à six cordes
HAMAC|Lit suspendu
HERISSON|Petit animal à piquants
HIBOU|Oiseau de nuit
HIVER|Saison froide
HOMARD|Crustacé à pinces
HORLOGE|Elle donne l'heure
HOTEL|On y dort en voyage
ILE|Terre entourée d'eau
IGLOO|Maison de glace
JAMBE|On marche avec
JARDIN|On y plante des fleurs
JEU|On y joue
JOUE|Partie du visage qui rougit
JOUET|Objet pour jouer
JUPE|Vêtement de fille
KANGOUROU|Il saute avec une poche
KIWI|Fruit vert et poilu
LAC|Étendue d'eau douce
LAIT|Boisson blanche de la vache
LAMPE|Elle éclaire la pièce
LAPIN|Il a de grandes oreilles
LARME|Elle coule quand on pleure
LETTRE|On l'envoie par la poste
LEVRE|Partie de la bouche
LION|Roi de la savane
LIT|Pour dormir
LIVRE|On le lit
LOUP|Il hurle à la lune
LUNE|Elle éclaire la nuit
LUNETTES|Pour mieux voir
MAGIE|Art des illusionnistes
MAILLOT|Tenue de bain
MAIN|Elle a cinq doigts
MAISON|On y habite
MARIAGE|Union des époux
MARTEAU|Il enfonce les clous
MATIN|Début de la journée
MELON|Gros fruit d'été
MER|Grande étendue d'eau salée
MIEL|Douceur des abeilles
MIROIR|On s'y regarde
MONTAGNE|Haut relief
MONTRE|Elle se porte au poignet
MOUCHE|Insecte agaçant
MOUTON|Il donne de la laine
MUSEE|On y voit des tableaux
NEIGE|Flocons blancs
NID|Maison de l'oiseau
NOEL|Fête du sapin
NUAGE|Il flotte dans le ciel
NUIT|Quand il fait noir
OCEAN|Atlantique ou Pacifique
OEUF|La poule le pond
OISEAU|Il vole avec des plumes
OMBRE|Elle nous suit au soleil
OPERA|Spectacle chanté
ORAGE|Tonnerre et éclairs
ORANGE|Fruit ou couleur
OREILLE|Organe de l'ouïe
OREILLER|On y pose la tête
ORTEIL|Doigt de pied
OURS|Il hiberne
PAIN|On l'achète à la boulangerie
PALMIER|Arbre des tropiques
PANDA|Ours noir et blanc
PAPILLON|Il était chenille
PARAPLUIE|Il protège de la pluie
PARC|Jardin public
PARFUM|Il sent bon
PATES|Spaghettis ou coquillettes
PEIGNE|Il démêle les cheveux
PELUCHE|Doudou tout doux
PERLE|Trésor de l'huître
PIANO|Instrument à touches
PIED|Il est au bout de la jambe
PIERRE|Caillou
PINGOUIN|Oiseau en habit noir et blanc
PIRATE|Il cherche des trésors
PISCINE|On y nage
PIZZA|Spécialité italienne
PLAGE|Sable au bord de la mer
PLUIE|Eau qui tombe du ciel
PLUME|Elle couvre l'oiseau
POIRE|Fruit en forme de goutte
POISSON|Il nage et a des nageoires
POMME|Fruit croqué par Blanche-Neige
PONT|Il passe au-dessus de la rivière
PORTE|On l'ouvre pour entrer
POULE|Elle pond des œufs
POUPEE|Jouet en forme de bébé
PRINCE|Fils du roi
PRINCESSE|Elle attend son prince
PRINTEMPS|Saison des fleurs
PUZZLE|Jeu de pièces à assembler
RADIO|On y écoute de la musique
RAISIN|On en fait du vin
RAQUETTE|Pour jouer au tennis
RENARD|Animal rusé
REQUIN|Poisson aux dents redoutables
REVE|On le fait en dormant
RIVIERE|Cours d'eau
RIZ|Céréale des sushis
ROBE|Vêtement de soirée
ROBOT|Machine qui imite l'homme
ROI|Il porte une couronne
ROSE|Fleur de l'amour
ROUE|Elle tourne
RUBAN|Il décore un paquet
SABLE|On en fait des châteaux
SAC|On y met ses affaires
SALADE|Plat de feuilles vertes
SALON|Pièce où l'on reçoit
SAPIN|Arbre de Noël
SAVON|Il lave les mains
SEL|Il assaisonne
SERPENT|Il rampe et siffle
SINGE|Il grimpe aux arbres
SOLEIL|Il brille le jour
SOURIRE|Il illumine le visage
SOURIS|Le chat la chasse
SUCRE|Il rend le café doux
TABLE|On y mange
TAPIS|Il couvre le sol
TARTE|Dessert à la pâte
TASSE|On y boit le thé
TELEPHONE|On l'appelle aussi portable
TEMPETE|Vent violent
TENNIS|Sport de raquette
TENTE|Abri du campeur
THE|Boisson chaude des Anglais
TIGRE|Grand félin rayé
TOIT|Il couvre la maison
TOMATE|Fruit rouge de la salade
TORTUE|Elle avance lentement
TRAIN|Il roule sur des rails
TRESOR|Coffre plein d'or
TROMPETTE|Instrument en cuivre
TULIPE|Fleur de Hollande
VACANCES|Temps libre loin du travail
VACHE|Elle donne du lait
VAGUE|Elle déferle sur la plage
VALISE|On la fait avant de partir
VASE|Il accueille les fleurs
VELO|Deux roues et des pédales
VENT|Il souffle
VERRE|On boit dedans
VIN|Rouge, blanc ou rosé
VIOLON|Instrument à archet
VOITURE|Elle a quatre roues
VOLCAN|Il crache de la lave
YAOURT|Produit laitier en pot
ZEBRE|Cheval rayé
ZOO|On y voit des animaux
`;

export const ENTRIES: Entry[] = RAW.trim()
  .split('\n')
  .map((line) => {
    const [word, clue] = line.split('|');
    return { word: word.trim(), clue: clue.trim() };
  });
