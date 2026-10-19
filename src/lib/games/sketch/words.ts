// Words to draw, by difficulty. Duplicates across levels are removed at load time.
const EASY = `
chat, chien, maison, soleil, arbre, voiture, fleur, poisson, lune, pomme, ballon, bateau, étoile, chapeau, gâteau,
nuage, escargot, banane, parapluie, lunettes, glace, serpent, avion, clé, oiseau, montagne, livre, chaise, bougie,
carotte, champignon, pizza, vélo, train, tortue, araignée, papillon, cerise, fusée, cadeau, couronne, éclair,
chaussette, lit, œuf, souris, cochon, canard, sapin, tente, fantôme, cœur, main, pied, œil, nez, dent, os, lapin,
vache, mouton, cheval, poule, abeille, coccinelle, fourmi, grenouille, éléphant, lion, singe, ours, hibou, crabe,
dauphin, méduse, ver de terre, citron, fraise, poire, ananas, raisin, pastèque, tomate, frites, hamburger, sandwich,
croissant, baguette, fromage, bonbon, sucette, biberon, tasse, verre, bouteille, assiette, fourchette, cuillère,
couteau, casserole, poêle, théière, table, canapé, lampe, télévision, téléphone, ordinateur, horloge, réveil, montre,
porte, fenêtre, escalier, toit, échelle, marteau, ciseaux, crayon, gomme, règle, cartable, enveloppe, timbre, journal,
cadenas, bague, collier, robe, pantalon, chemise, cravate, écharpe, gant, bonnet, botte, basket, short,
maillot de bain, sac à main, valise, peigne, savon, baignoire, douche, toilettes, miroir, balai, seau, arrosoir, pelle,
râteau, brouette, camion, bus, moto, skateboard, ancre, plage, île, palmier, coquillage, étoile de mer, vague, flocon,
pluie, feu, feuille, pomme de pin, citrouille, épouvantail, nid, plume, drapeau, tambour, trompette, piano, violon,
micro, casque, but de foot, panier de basket, médaille, coupe, dé, carte à jouer, puzzle, toupie, poupée,
ours en peluche, roi, reine, princesse, bébé, squelette, ange, diable, extraterrestre, soucoupe volante, planète,
télescope, coffre au trésor, pièce de monnaie, billet, aimant, ampoule, pile, prise électrique, loupe, seringue,
pansement, thermomètre, dentifrice, rouge à lèvres, parfum, barbe, perruque, lunettes de soleil, masque, nœud papillon,
sac à dos, tong, bouée, palmes, parasol, serviette, glaçon, kiwi, avocat, brocoli, poivron, oignon, piment, maïs,
noix de coco, cacahuète, chocolat, donut, crêpe, gaufre, pop-corn, hot-dog, sushi, spaghetti, soupe, œuf au plat,
saucisse, poulet rôti, lait, café, vin, bière, cocktail, paille, cornet de glace, pot de fleurs, cintre, armoire,
coussin, oreiller, tapis, rideau, radiateur, ventilateur, frigo, four, grille-pain, machine à laver, fer à repasser,
poubelle, boîte aux lettres, banc, lampadaire, feu rouge, panneau stop, pont, église, usine, gratte-ciel, cabane,
moulin, puits, fontaine, statue, tournevis, clou, vis, bouton, aiguille, pelote de laine, fil,
chaussure, talon aiguille, sac poubelle, boîte, carton, cerf, sirop, confiture, tartine, bol,
yaourt, biscuit, sucre, sel, poivre, beurre, pain, brosse à cheveux, sèche-cheveux, rasoir, éponge, chat noir, coq,
mouche, papillon de nuit, tulipe, rose, marguerite, tournesol, herbe, rocher, caillou, sable, arc, flèche, cible
`;

const MEDIUM = `
girafe, pirate, dragon, sirène, château, robot, vampire, trampoline, cactus, licorne, astronaute, pingouin, toboggan,
piscine, igloo, guitare, hélicoptère, sorcière, kangourou, momie, dinosaure, pieuvre, volcan, phare, raquette,
bonhomme de neige, arc-en-ciel, baleine, moustache, hamac, sous-marin, zombie, clown, aspirateur, brosse à dents,
requin, perroquet, sablier, parachute, cheminée, trottinette, hippopotame, microscope, accordéon, boomerang,
cerf-volant, yéti, pyramide, tracteur, taupe, crocodile, zèbre, rhinocéros, chameau, paon, flamant rose, autruche,
koala, panda, renard, loup, écureuil, hérisson, chauve-souris, moustique, scorpion, caméléon, homard, hippocampe,
morse, phoque, paresseux, lama, castor, cygne, toucan, dindon, sanglier, ninja, chevalier, cow-boy, fée, magicien,
détective, pompier, policier, cuisinier, chirurgien, plongeur, boxeur, danseuse étoile, footballeur, jardinier,
facteur, peintre, photographe, mime, jongleur, funambule, cracheur de feu, super-héros, père Noël, lutin, ogre,
cyclope, sphinx, loup-garou, épée, bouclier, catapulte, canon, armure, trône, baguette magique, chaudron,
balai de sorcière, tapis volant, lampe magique, boule de cristal, toile d'araignée, cercueil, montgolfière,
téléphérique, métro, péniche, voilier, kayak, jet-ski, pédalo, ambulance, camion de pompiers, voiture de police, taxi,
bulldozer, grue, pelleteuse, char d'assaut, monocycle, tandem, patins à glace, ski, snowboard, luge, planche de surf,
plongeoir, haltère, ring de boxe, bowling, billard, fléchettes, golf, ping-pong, baby-foot, flipper, manette,
console de jeu, drone, satellite, éolienne, panneau solaire, barrage, aéroport, gare, péage, rond-point, ascenseur,
escalator, distributeur de billets, caddie, caisse enregistreuse, code-barres, cinéma, cirque, zoo, aquarium, musée,
bibliothèque, hôpital, prison, fête foraine, grande roue, manège, auto-tamponneuse, barbe à papa, pomme d'amour,
labyrinthe, bonsaï, cerisier en fleurs, tornade, tsunami, iceberg, cascade, grotte, désert, oasis, jungle, geyser,
aurore boréale, éclipse, météorite, trou noir, galaxie, boîte de conserve, tire-bouchon, râpe à fromage, fouet,
rouleau à pâtisserie, cocotte-minute, mixeur, cafetière, bouilloire, passoire, raclette, couscous, paella, burrito,
taco, kebab, croque-monsieur, quiche, macaron, éclair au chocolat, tarte aux pommes, crème brûlée, bûche de Noël,
galette des rois, chocolat chaud, milkshake, cheval à bascule, balançoire, bac à sable, château de sable,
tour de Pise, statue de la Liberté, Big Ben, Colisée, grande muraille de Chine, moulin à vent, totem, tipi,
cabane dans les arbres, niche, cage à oiseaux, poulailler, ruche, fourmilière, terrier, radeau, bouteille à la mer,
île déserte, naufragé, jambe de bois, longue-vue, boussole, mappemonde, métronome, xylophone, harpe, saxophone,
contrebasse, cornemuse, triangle, maracas, platine vinyle, cassette, radio, mégaphone, talkie-walkie,
appareil photo, caméra, clap de cinéma, tapis rouge, perche à selfie, pâte à modeler, Lego, Rubik's cube, yoyo,
billes, marelle, corde à sauter, cache-cache, bulles de savon, pistolet à eau, sapin de Noël, guirlande, boule à neige,
couronne de fleurs, bouquet, vase, cadre photo, tableau, chevalet, sculpture, mosaïque, vitrail, calendrier,
agenda, post-it, trombone, agrafeuse, calculatrice, imprimante, clavier, souris d'ordinateur, écran, clé USB,
casque audio, enceinte, chargeur, tablette, montre connectée, robot de cuisine, plancha, glacière, transat, bouée canard, château gonflable, piscine gonflable, toboggan aquatique, tyrolienne,
mur d'escalade, accrobranche, parapente, deltaplane, montagne enneigée, chalet, téléski, boule de bowling, quille,
fer à cheval, selle, carrosse, pantoufle de verre, nain de jardin, tondeuse, haie, potager,
serre, abri de jardin, mangeoire, tour de contrôle, piste d'atterrissage, valise à roulettes,
passeport, carte d'embarquement, hôtesse de l'air, pilote, parachutiste, sauveteur, maître-nageur, arbitre,
gardien de but, pom-pom girl, mascotte, podium, trophée, ceinture noire, kimono, sumo, escrime, tir à l'arc,
lancer de poids, saut à la perche, haies, relais, plongée sous-marine, scaphandre, requin-marteau, raie manta,
poisson-clown, étoile filante
`;

const HARD = `
embouteillage, cauchemar, barbecue, déménagement, grasse matinée, montagnes russes, selfie, wifi, télétravail,
mal de mer, coup de foudre, lune de miel, tour Eiffel, panne de courant, feu d'artifice, éternuement, chatouilles,
karaoké, petit-déjeuner, saut à l'élastique, poisson d'avril, bataille de polochons, jour de pluie, fondue savoyarde,
clair de lune, rendez-vous galant, course poursuite, bouchon de champagne, prise de tête, gueule de bois,
demande en mariage, trou de mémoire, sieste, soirée pyjama, mauvais perdant, chasse au trésor, pique-nique,
bataille de boules de neige, tempête, jalousie, nostalgie, liberté, amitié, colère, peur du noir, vertige, insomnie,
fou rire, coup de soleil, déjà-vu, gravité, électricité, internet, mot de passe, bug informatique, batterie faible,
réseau social, influenceur, notification, livraison, colis, soldes, file d'attente, ticket de caisse, pourboire,
addition, régime, gourmandise, indigestion, hoquet, ronflement, somnambule, lundi matin, vendredi soir, retard,
examen, antisèche, permis de conduire, excès de vitesse, radar, amende, fourrière, crevaison, panne d'essence,
autostop, covoiturage, GPS, demi-tour, marche arrière, créneau, heure de pointe, métro bondé, grève, manifestation,
élection, discours, applaudissements, standing ovation, ola, penalty, carton rouge, hors-jeu, record du monde,
marathon, Jeux olympiques, flamme olympique, Tour de France, maillot jaune, tirage au sort, loterie, jackpot, casino,
poker, bluff, pile ou face, chance, malchance, trèfle à quatre feuilles, vendredi 13, superstition, horoscope,
voyante, maison hantée, fin du monde, invasion extraterrestre, voyage dans le temps, téléportation, clonage,
intelligence artificielle, réalité virtuelle, hologramme, robot aspirateur, voiture autonome, jet privé, yacht,
caviar, paparazzi, autographe, concert, festival, pogo, slam, air guitar, playback, fausse note, chorale, opéra,
ballet, comédie musicale, stand-up, marionnette, ventriloque, tour de magie, lapin dans un chapeau, évasion,
cambriolage, braquage, alibi, enquête, empreinte digitale, interrogatoire, menottes, juge, procès, témoin, mariage,
divorce, belle-mère, enterrement de vie de garçon, lancer du bouquet, robe de mariée, pièce montée, alliance,
voyage de noces, pendaison de crémaillère, baby shower, anniversaire, fête surprise, souffler les bougies,
cotillons, piñata, chasse aux œufs, réveillon, bonnes résolutions, Saint-Valentin, Halloween, carnaval, déguisement,
bal masqué, Nouvel An, compte à rebours, 14 juillet, bal populaire, apéro, tournée générale, pétanque, camping,
sac de couchage, feu de camp, chamallow grillé, randonnée, ampoule au pied, piqûre de moustique, allergie, rhume,
fièvre, vaccin, plâtre, béquilles, radiographie, dentiste, carie, appareil dentaire, lentilles de contact,
coupe de cheveux ratée, calvitie, cheveux blancs, ride, musculation, yoga, méditation, burn-out, réunion,
visioconférence, open space, machine à café, pause café, augmentation, entretien d'embauche, CV, stagiaire, patron,
retraite, vacances, embarquement, décalage horaire, valise perdue, douane, carte postale, photo de groupe,
coucher de soleil, lever de soleil, faire un vœu, génie de la lampe, miracle, rêve, réincarnation, karma, paradis,
enfer, ange gardien, mensonge, Pinocchio, secret, rumeur, commérage, malentendu, dispute, réconciliation, câlin,
bisou, rupture, larmes, chagrin d'amour, cœur brisé, flirt, clin d'œil, speed dating, application de rencontre,
premier rendez-vous, colocation, ménage, vaisselle, lessive, repassage, liste de courses, frigo vide, restes,
livraison de pizza, plateau télé, série télé, binge-watching, spoiler, télécommande, zapping, publicité,
téléréalité, jeu télévisé, présentateur météo, journal télévisé, fake news, complot, mal de dos, torticolis,
crampe, bâillement, pleurer de rire, se brûler la langue, avoir la chair de poule, avoir le trac,
faire la grimace, tirer la langue, rougir, frissonner, transpirer, se cogner le petit orteil, glisser sur une peau de banane,
tomber dans les pommes, tomber amoureux, poser un lapin, avoir un chat dans la gorge, coup de pouce, coup de main,
mettre les pieds dans le plat, casser les pieds, avoir la tête dans les nuages, poser une question, prendre la fuite,
faire la queue, faire du stop, faire la fête, faire la vaisselle, faire un câlin, faire un selfie, faire du surf,
jouer aux cartes, jouer de la guitare, faire un gâteau, planter un arbre, promener le chien, changer une couche,
réveil qui sonne, pluie de météorites, éruption volcanique, tremblement de terre,
canicule, inondation, sécheresse, verglas, brouillard, orage, court-circuit, fuite d'eau, plombier,
serrurier, électricien, jardinage, bricolage, montage de meuble, notice incompréhensible, clé à molette,
tondre la pelouse, ramasser les feuilles, château de cartes, effet domino, jeu de piste,
escape game, partie de cache-cache, chaise musicale, téléphone arabe, morpion, pierre-feuille-ciseaux,
bras de fer, course en sac, tir à la corde, saut en longueur, plongeon raté, flop, glissade, boule disco, slow,
danse du ventre, breakdance, moonwalk, macarena, tango, valse, salsa, french cancan, claquettes, hula-hoop,
statue vivante, homme-orchestre, sosie, jumeaux, triplés, arbre généalogique, album photo, souvenir d'enfance,
premier pas, première dent, tétine, doudou, berceuse, câlin collectif, réunion de famille, repas de Noël,
dinde de Noël, chaussettes de Noël, cadeau raté, emballage cadeau, ruban, bolduc, pyjama de Noël
`;

function parse(text: string): string[] {
  return text
    .split(',')
    .map((word) => word.trim().replace(/'/g, '’'))
    .filter(Boolean);
}

function build(): Record<1 | 2 | 3, string[]> {
  const seen = new Set<string>();
  const levels = [EASY, MEDIUM, HARD].map((block) =>
    parse(block).filter((word) => {
      const key = word.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }),
  );
  return { 1: levels[0], 2: levels[1], 3: levels[2] };
}

export const SKETCH_WORDS: Record<1 | 2 | 3, string[]> = build();
