// One card per line: word to guess : forbidden, forbidden, forbidden, forbidden
const BANK = `
Plage : sable, mer, soleil, serviette
Pizza : Italie, fromage, pâte, four
Chocolat : cacao, Nutella, noir, Pâques
Téléphone : appeler, portable, écran, sonner
Chien : aboyer, animal, os, laisse
Chat : miauler, souris, griffe, moustaches
Anniversaire : gâteau, bougies, âge, cadeau
Noël : sapin, cadeaux, décembre, père
Mariage : robe, alliance, église, mariés
Café : tasse, noir, matin, boire
Vacances : partir, été, repos, voyage
Football : ballon, but, équipe, match
Cinéma : film, salle, écran, pop-corn
Lune : nuit, ciel, croissant, astronaute
Soleil : chaud, jaune, ciel, lumière
Pluie : eau, nuage, parapluie, mouillé
Neige : blanc, froid, flocon, ski
Avion : voler, aéroport, pilote, ailes
Voiture : rouler, conduire, roue, moteur
Vélo : pédaler, roue, guidon, selle
Train : gare, rails, wagon, SNCF
Fromage : lait, camembert, vache, raclette
Pain : boulangerie, baguette, farine, mie
Bière : boire, alcool, mousse, blonde
Vin : rouge, raisin, verre, bouteille
Glace : froid, cornet, vanille, été
Dentiste : dents, carie, docteur, fauteuil
Hôpital : malade, médecin, infirmière, urgences
École : élève, maître, classe, cartable
Professeur : école, élève, cours, enseigner
Police : voleur, agent, sirène, prison
Pompier : feu, camion, rouge, éteindre
Musique : chanson, écouter, note, instrument
Guitare : cordes, instrument, jouer, rock
Piano : touches, noir, blanc, instrument
Livre : lire, pages, auteur, bibliothèque
Ordinateur : écran, clavier, souris, Internet
Internet : wifi, réseau, site, Google
Instagram : photo, réseau, story, like
Netflix : série, film, streaming, abonnement
Télévision : écran, télécommande, chaîne, regarder
Canapé : s'asseoir, salon, coussin, meuble
Lit : dormir, matelas, chambre, oreiller
Douche : eau, salle de bain, savon, laver
Brosse à dents : dentifrice, dents, matin, laver
Cuisine : cuisiner, pièce, four, recette
Frigo : froid, cuisine, aliments, congélateur
Montagne : ski, sommet, neige, randonnée
Mer : eau, plage, sel, vague
Forêt : arbres, bois, champignons, balade
Paris : capitale, tour Eiffel, France, ville
Tour Eiffel : Paris, monument, fer, haute
New York : États-Unis, ville, Manhattan, statue
Japon : Tokyo, sushi, pays, Asie
Italie : pizza, Rome, pâtes, pays
Espagne : Madrid, paella, pays, flamenco
Pirate : bateau, trésor, perroquet, jambe
Vampire : sang, dents, Dracula, nuit
Fantôme : drap, hanté, mort, peur
Sorcière : balai, chapeau, magie, Halloween
Dragon : feu, voler, monstre, écailles
Princesse : château, prince, couronne, Disney
Robot : machine, métal, intelligence, automate
Astronaute : espace, fusée, Lune, combinaison
Dinosaure : préhistoire, T-rex, fossile, disparu
Requin : mer, dents, poisson, dangereux
Éléphant : trompe, gros, Afrique, défenses
Girafe : cou, long, tâches, Afrique
Lion : roi, crinière, savane, félin
Singe : banane, arbre, primate, grimper
Pingouin : banquise, noir, blanc, froid
Abeille : miel, piquer, ruche, insecte
Papillon : ailes, chenille, voler, couleurs
Serpent : ramper, venin, siffler, reptile
Araignée : toile, pattes, insecte, peur
Escargot : coquille, lent, bave, limace
Grenouille : coasser, verte, sauter, prince
Pomme : fruit, rouge, arbre, verte
Banane : jaune, fruit, singe, éplucher
Fraise : rouge, fruit, chantilly, été
Citron : jaune, acide, fruit, jus
Carotte : orange, légume, lapin, terre
Tomate : rouge, légume, ketchup, salade
Frites : pommes de terre, huile, McDo, ketchup
Hamburger : pain, steak, McDo, fast-food
Sushi : Japon, riz, poisson, baguettes
Crêpe : Bretagne, Chandeleur, farine, poêle
Gâteau : anniversaire, dessert, sucre, bougies
Œuf : poule, coquille, jaune, omelette
Sel : poivre, mer, blanc, saler
Sucre : sucré, blanc, morceau, café
Restaurant : manger, serveur, menu, table
Supermarché : courses, caddie, caisse, magasin
Argent : euros, billet, pièce, riche
Banque : argent, compte, carte, conseiller
Travail : bureau, boulot, salaire, patron
Patron : chef, travail, employé, entreprise
Réunion : bureau, collègues, salle, parler
Lundi : semaine, jour, dimanche, début
Week-end : samedi, dimanche, repos, semaine
Réveil : sonner, matin, heure, lever
Sieste : dormir, après-midi, repos, fatigue
Rêve : dormir, nuit, cauchemar, imaginer
Cauchemar : rêve, peur, nuit, dormir
Bisou : lèvres, embrasser, joue, amour
Câlin : bras, serrer, tendresse, doudou
Amour : cœur, aimer, couple, Saint-Valentin
Saint-Valentin : amoureux, février, cœur, fleurs
Rendez-vous : rencontre, heure, date, retrouver
Jalousie : jaloux, couple, envie, possessif
Dispute : crier, se fâcher, couple, désaccord
Bague : doigt, bijou, mariage, diamant
Diamant : pierre, précieux, bague, briller
Robe : vêtement, femme, mariée, porter
Chaussure : pied, marcher, paire, lacet
Chaussette : pied, paire, laine, linge
Lunettes : yeux, voir, verres, soleil
Chapeau : tête, porter, casquette, mode
Parapluie : pluie, ouvrir, mouillé, protéger
Valise : voyage, bagages, roulettes, partir
Passeport : voyage, pays, frontière, identité
Hôtel : chambre, dormir, vacances, réception
Camping : tente, vacances, caravane, nature
Piscine : nager, eau, maillot, plonger
Ski : neige, montagne, station, glisser
Tennis : raquette, balle, filet, Roland-Garros
Basket : panier, ballon, NBA, dribbler
Rugby : ballon, ovale, essai, mêlée
Jeux olympiques : sport, médaille, anneaux, athlètes
Médaille : or, argent, bronze, gagner
Marathon : courir, kilomètres, course, 42
Yoga : méditation, posture, souplesse, tapis
Salle de sport : musculation, abonnement, sport, poids
Karaoké : chanter, micro, chanson, paroles
Danse : danser, musique, pas, bouger
Concert : musique, scène, chanteur, public
Festival : musique, été, concerts, plein air
Fête : soirée, danser, amis, musique
Apéro : boire, chips, avant, verre
Champagne : bulles, fête, bouteille, trinquer
Gueule de bois : alcool, lendemain, mal de tête, soirée
Barbecue : grillade, viande, été, charbon
Pique-nique : herbe, nappe, manger, dehors
Raclette : fromage, appareil, pommes de terre, hiver
Fondue : fromage, pain, caquelon, Savoie
Halloween : citrouille, bonbons, déguisement, octobre
Pâques : œufs, chocolat, lapin, cloches
Feu d'artifice : 14 juillet, ciel, explosion, couleurs
Père Noël : barbe, cadeaux, traîneau, rennes
Sapin : Noël, arbre, décoration, épines
Cadeau : offrir, paquet, anniversaire, surprise
Surprise : inattendu, fête, cadeau, étonner
Secret : dire, cacher, confier, garder
Mensonge : vérité, mentir, Pinocchio, faux
Selfie : photo, téléphone, soi-même, perche
Photo : appareil, image, prendre, souvenir
Emoji : visage, message, smiley, symbole
Message : texto, écrire, envoyer, SMS
Wifi : Internet, réseau, connexion, mot de passe
Mot de passe : secret, code, ordinateur, sécurité
Batterie : charger, téléphone, pile, énergie
Jeu vidéo : console, manette, jouer, écran
Mario : Nintendo, plombier, moustache, Luigi
Pokémon : Pikachu, attraper, dresseur, cartes
Minecraft : cubes, blocs, construire, jeu
Harry Potter : sorcier, Poudlard, baguette, lunettes
Star Wars : Jedi, sabre, Vador, espace
Titanic : bateau, iceberg, couler, DiCaprio
Le Roi Lion : Simba, Disney, savane, Mufasa
Superman : héros, voler, cape, Krypton
Batman : chauve-souris, Gotham, Joker, héros
Spider-Man : araignée, toile, héros, Marvel
Shrek : ogre, vert, âne, Fiona
Astérix : Gaulois, Obélix, potion, Romains
Tintin : Milou, reporter, Hergé, houppe
Les Simpson : Homer, jaune, dessin animé, Bart
Friends : série, Ross, Rachel, café
Game of Thrones : série, dragons, trône, Stark
Mona Lisa : Joconde, Louvre, tableau, sourire
Napoléon : empereur, Bonaparte, petit, Waterloo
Cléopâtre : Égypte, reine, César, nez
Einstein : génie, relativité, physicien, langue
Michael Jackson : moonwalk, chanteur, Thriller, pop
Elvis : King, rock, chanteur, Presley
Beyoncé : chanteuse, Jay-Z, Queen, Destiny's Child
Zidane : football, coup de tête, Zizou, Real
Mbappé : football, PSG, rapide, Bondy
Tour de France : vélo, maillot jaune, cyclistes, juillet
Roland-Garros : tennis, terre battue, Paris, Nadal
Pyramide : Égypte, pharaon, triangle, désert
Château : roi, princesse, tours, Moyen Âge
Prison : détenu, cellule, barreaux, police
Avocat : juge, tribunal, défendre, fruit
Juge : tribunal, procès, condamner, marteau
Docteur : médecin, malade, ordonnance, cabinet
Pharmacie : médicaments, croix, verte, ordonnance
Rhume : nez, malade, mouchoir, éternuer
Éternuer : atchoum, nez, rhume, mouchoir
Hoquet : hic, peur, eau, boire
Rire : drôle, sourire, blague, ha
Pleurer : larmes, triste, yeux, chagrin
Peur : effrayer, frisson, horreur, crier
Colère : fâché, énervé, rouge, crier
Fatigue : dormir, épuisé, bâiller, sommeil
Faim : manger, ventre, gargouiller, affamé
Soif : boire, eau, gorge, sec
Chaleur : chaud, été, transpirer, canicule
Froid : hiver, gelé, frissonner, glace
Vent : souffler, tempête, air, éolienne
Orage : éclair, tonnerre, pluie, nuage
Arc-en-ciel : couleurs, pluie, soleil, ciel
Étoile : ciel, nuit, briller, filante
Planète : Terre, Mars, système solaire, espace
Fusée : espace, décoller, NASA, lancer
Extraterrestre : alien, espace, soucoupe, martien
Magicien : tour, chapeau, lapin, baguette
Clown : cirque, nez, rouge, drôle
Cirque : chapiteau, clown, acrobate, lion
Zoo : animaux, cage, visiter, girafe
Ferme : vache, fermier, tracteur, campagne
Vache : lait, meuh, ferme, taches
Cochon : rose, ferme, groin, jambon
Mouton : laine, bêler, troupeau, berger
Cheval : galoper, monter, crinière, sabots
Poule : œuf, cot-cot, ferme, coq
Lapin : carottes, oreilles, Pâques, sauter
Souris : fromage, petit, chat, ordinateur
Tracteur : ferme, champ, agriculteur, roues
Jardin : fleurs, herbe, potager, arroser
Fleur : rose, pétales, bouquet, jardin
Rose : fleur, épines, rouge, parfum
Arbre : feuilles, branches, tronc, forêt
Champignon : forêt, cèpe, vénéneux, cueillir
Plante : vert, pot, arroser, feuille
Bougie : flamme, cire, allumer, anniversaire
Feu : flamme, brûler, chaud, pompier
Lampe : lumière, ampoule, allumer, éclairer
Clé : porte, serrure, ouvrir, trousseau
Porte : ouvrir, fermer, entrer, poignée
Fenêtre : vitre, ouvrir, regarder, rideaux
Escalier : marches, monter, étage, descendre
Ascenseur : étage, monter, bouton, immeuble
Maison : habiter, toit, famille, logement
Déménagement : cartons, camion, nouvelle, adresse
Ménage : nettoyer, aspirateur, ranger, propre
Vaisselle : assiettes, laver, évier, éponge
Lessive : linge, machine, laver, vêtements
Aspirateur : poussière, ménage, sol, tapis
Poubelle : déchets, ordures, jeter, sortir
Courses : supermarché, liste, acheter, caddie
Recette : cuisiner, ingrédients, plat, livre
Chef : cuisinier, restaurant, toque, patron
Serveur : restaurant, plateau, commande, pourboire
Pourboire : serveur, argent, laisser, restaurant
Facture : payer, addition, montant, papier
Soldes : réduction, magasin, prix, janvier
Mode : vêtements, tendance, défilé, styliste
Maquillage : rouge à lèvres, visage, mascara, fond de teint
Coiffeur : cheveux, couper, salon, brushing
Barbe : poils, menton, raser, homme
Tatouage : encre, peau, dessin, aiguille
Parfum : odeur, sentir, flacon, vaporiser
Miroir : reflet, regarder, glace, salle de bain
Bébé : enfant, naissance, pleurer, couche
Enfant : petit, jouer, parents, école
Grand-mère : mamie, famille, âgée, petits-enfants
Belle-mère : mari, femme, famille, parents
Famille : parents, enfants, frère, sœur
Amis : copains, potes, amitié, bande
Voisin : à côté, immeuble, palier, bruit
Bruit : son, fort, silence, entendre
Silence : chut, bruit, calme, parler
Secret de famille : cacher, parents, dire, histoire
Retard : heure, attendre, en avance, rater
Embouteillage : voitures, bouchon, route, coincé
Autoroute : voiture, péage, route, vitesse
Essence : voiture, station, carburant, plein
Permis de conduire : voiture, code, examen, points
GPS : carte, chemin, direction, route
Taxi : chauffeur, voiture, course, Uber
Métro : Paris, ligne, station, souterrain
Bus : arrêt, transport, ticket, chauffeur
Bateau : mer, naviguer, voile, port
Île : mer, entourée, plage, déserte
Trésor : coffre, or, pirate, carte
Carte : plan, jeu, routière, crédit
Jeu de société : plateau, dés, Monopoly, jouer
Échecs : roi, reine, plateau, mat
Dé : six, lancer, faces, jeu
Puzzle : pièces, assembler, image, morceaux
Ballon : gonfler, rond, air, jouer
Poupée : jouet, Barbie, fille, enfant
Doudou : peluche, enfant, dormir, câlin
Peluche : ours, doux, jouet, nounours
Licorne : corne, cheval, magique, arc-en-ciel
Sirène : queue, mer, poisson, Ariel
Zombie : mort, vivant, cerveau, marcher
Momie : Égypte, bandages, pharaon, sarcophage
Squelette : os, mort, crâne, corps
Cœur : amour, organe, battre, rouge
Cerveau : tête, penser, intelligence, neurones
Muscles : sport, force, bras, musculation
Dents : bouche, dentiste, sourire, brosser
Cheveux : tête, coiffeur, blond, brun
Main : doigts, bras, gauche, droite
Pied : orteils, marcher, chaussure, jambe
Nez : sentir, visage, renifler, narines
Oreille : entendre, écouter, tête, boucle
Œil : voir, regarder, yeux, paupière
Chatouilles : rire, toucher, pieds, ventre
Bâiller : fatigue, bouche, sommeil, ennui
Ronfler : dormir, bruit, nuit, nez
Somnambule : dormir, marcher, nuit, rêve
Grasse matinée : dormir, tard, dimanche, lit
Petit-déjeuner : matin, manger, café, croissant
Croissant : beurre, boulangerie, matin, viennoiserie
Baguette : pain, boulangerie, France, magique
Moutarde : Dijon, jaune, piquante, sauce
Ketchup : tomate, sauce, rouge, frites
Mayonnaise : sauce, œuf, huile, frites
Popcorn : cinéma, maïs, sucré, salé
Bonbon : sucre, sucrerie, Haribo, enfant
Chewing-gum : mâcher, bulle, menthe, coller
Nutella : chocolat, noisette, tartiner, pot
Confiture : fruits, tartine, pot, sucre
Miel : abeille, sucré, pot, ruche
Thé : boire, infusion, chaud, sachet
Eau : boire, liquide, robinet, bouteille
Soupe : légumes, cuillère, chaude, bol
Salade : laitue, vinaigrette, verte, légumes
Pâtes : Italie, spaghetti, cuire, bolognaise
Riz : grains, Asie, blanc, cuire
Poulet : volaille, viande, rôti, poule
Steak : viande, bœuf, cuisson, saignant
Poisson : mer, nager, pêcher, nageoire
Pêche : canne, poisson, fruit, hameçon
Chasse : fusil, animal, chasseur, gibier
Randonnée : marcher, montagne, sac, chemin
Tente : camping, dormir, piquets, monter
Feu de camp : bois, flammes, chamallows, camping
Lampe de poche : lumière, piles, nuit, éclairer
Boussole : nord, direction, aiguille, orientation
Montre : heure, poignet, temps, bracelet
Calendrier : jours, mois, date, année
Horoscope : signe, astrologie, étoiles, prédiction
Chance : hasard, trèfle, loto, veinard
Loto : gagner, numéros, argent, tirage
Casino : jouer, argent, roulette, Las Vegas
Poker : cartes, jeu, bluff, jetons
Gagner : perdre, victoire, premier, vainqueur
Perdre : gagner, défaite, égarer, dernier
Triche : tricher, règles, jeu, copier
Examen : école, note, réviser, épreuve
Bac : lycée, examen, diplôme, mention
Diplôme : école, études, université, réussir
Université : fac, études, étudiant, campus
Stage : entreprise, étudiant, apprendre, stagiaire
Entretien d'embauche : travail, CV, recruteur, poste
Vacances d'été : juillet, août, plage, école
Week-end en amoureux : couple, romantique, partir, hôtel
Lune de miel : mariage, voyage, mariés, romantique
Demande en mariage : bague, genou, épouser, question
Bouquet : fleurs, mariée, lancer, offrir
Robe de mariée : blanche, mariage, voile, mariée
Témoin : mariage, procès, voir, signer
Discours : parler, public, micro, mariage
Applaudir : mains, bravo, public, taper
Bravo : féliciter, applaudir, super, bien joué
Série : épisode, saison, Netflix, regarder
Spoiler : fin, révéler, série, gâcher
Binge-watching : série, épisodes, enchaîner, Netflix
Télécommande : télé, zapper, boutons, chaîne
Pyjama : dormir, nuit, vêtement, chambre
Couette : lit, chaud, dormir, housse
Oreiller : tête, lit, dormir, plume
Matelas : lit, dormir, ressorts, mousse
Plaid : couverture, canapé, chaud, laine
Chaussons : pieds, maison, pantoufles, chaud
Bouillotte : chaud, eau, lit, hiver
Chauffage : chaud, radiateur, hiver, maison
Climatisation : froid, été, chaleur, air
Ventilateur : vent, air, été, tourner
Moustique : piqûre, insecte, bzz, été
Méduse : mer, piquer, transparente, plage
Coup de soleil : rouge, brûlure, plage, crème
Crème solaire : soleil, protection, plage, indice
Maillot de bain : piscine, plage, nager, bikini
Parasol : plage, ombre, soleil, sable
Château de sable : plage, seau, pelle, construire
Coquillage : plage, mer, ramasser, escargot
Phare : lumière, mer, bateaux, tour
`;

export interface Card {
  word: string;
  forbidden: string[];
}

export const CARDS: Card[] = BANK.split('\n')
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => {
    const [word, rest] = line.split(' : ');
    const forbidden = (rest ?? '').split(',').map((part) => part.trim().replace(/'/g, '’'));
    if (!word || forbidden.length !== 4 || forbidden.some((part) => !part)) throw new Error(`Malformed card: ${line}`);
    return { word: word.trim().replace(/'/g, '’'), forbidden };
  });
