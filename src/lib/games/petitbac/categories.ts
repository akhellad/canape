export const CATEGORIES = `
Prénom
Pays
Ville
Animal
Fruit ou légume
Métier
Marque
Objet de la maison
Sport
Célébrité
Film
Série
Chanteur ou groupe
Plat
Dessert
Boisson
Vêtement
Couleur
Instrument de musique
Partie du corps
Moyen de transport
Personnage de dessin animé
Jeu vidéo
Super-héros ou méchant
Fleur ou plante
Insecte
Animal marin
Oiseau
Fromage
Chose qu'on met dans une valise
Excuse pour être en retard
Chose qu'on trouve dans une cuisine
Petit surnom amoureux
Chose qui fait peur
Cadeau nul
Activité à faire à deux
Destination de vacances
Personnage historique
Héros de livre ou de BD
Chose ronde
Chose rouge
Chose qui colle
Chose qu'on trouve à la plage
Application ou site web
Mot anglais
Émotion
Maladie ou bobo
Matière scolaire
Région ou département français
Monument
Chose qu'on fait le dimanche
Raison de se disputer
Chose qu'on cache à ses parents
Nom de chien
Garniture de pizza
Cocktail ou apéro
Accessoire de mode
Jouet
Danse
Chose dans un sac à main
Métier de rêve
Chose qu'on trouve dans une salle de bain
Chose qui fait du bruit
Gros mot gentil
Personnage Disney
Pâtisserie ou viennoiserie
Épice ou condiment
Chose qu'on emporte au camping
Marque de voiture
Mot qui rime avec « amour »
Chose qui brille
Chose qu'on oublie toujours
Chose qui sent bon
Chose qui sent mauvais
Truc qu'on achète au supermarché
Lieu d'un premier rendez-vous
Chose qu'on fait en cachette
Personnage de jeu vidéo
Chose froide
Chose chaude
Chose qui vole
Chose qu'on trouve au bureau
Arbre
Langue étrangère
Capitale
Chose qui coûte cher
Mot de plus de dix lettres
Verbe d'action
Adjectif pour décrire l'autre
Chose qu'on dit au lit
Bruit d'animal
Film d'horreur ou monstre
Chanson à chanter en karaoké
Jeu de société
Chose qu'on fête
`
  .split('\n')
  .map((line) => line.trim().replace(/'/g, '’'))
  .filter(Boolean);

// Letters that give everyone a fair chance.
export const LETTERS = 'ABCDEFGHIJLMNOPRSTV'.split('');
