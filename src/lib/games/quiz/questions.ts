// One question per line: question | right answer | wrong | wrong | wrong. A "# Title" line starts a category.
const BANK = `
# Géographie
Quelle est la capitale de l'Australie ? | Canberra | Sydney | Melbourne | Perth
Quelle est la capitale du Canada ? | Ottawa | Toronto | Montréal | Vancouver
Quel est le plus long fleuve de France ? | La Loire | La Seine | Le Rhône | La Garonne
Dans quel pays se trouve Marrakech ? | Le Maroc | L'Algérie | La Tunisie | L'Égypte
Quelle est la capitale du Portugal ? | Lisbonne | Porto | Faro | Coimbra
Combien de pays ont une frontière terrestre avec la France métropolitaine ? | 8 | 6 | 7 | 9
Quel océan borde la côte ouest des États-Unis ? | Le Pacifique | L'Atlantique | L'océan Indien | L'Arctique
Quel est le plus grand pays du monde par sa superficie ? | La Russie | Le Canada | La Chine | Les États-Unis
Quel est le plus grand désert chaud du monde ? | Le Sahara | Le Kalahari | Le désert de Gobi | L'Atacama
Dans quelle ville se trouve la Sagrada Família ? | Barcelone | Madrid | Séville | Valence
Quelle ville est surnommée « la Ville éternelle » ? | Rome | Athènes | Jérusalem | Venise
Combien y a-t-il de départements en France, outre-mer compris ? | 101 | 96 | 95 | 103
Quel pays a la forme d'une botte ? | L'Italie | La Grèce | Le Portugal | La Croatie
Quelle est la capitale de la Belgique ? | Bruxelles | Anvers | Liège | Bruges
Quel est le plus petit pays du monde ? | Le Vatican | Monaco | Saint-Marin | Le Liechtenstein
Dans quel pays se trouve le Machu Picchu ? | Le Pérou | La Bolivie | Le Mexique | Le Chili
Quelle mer sépare l'Europe de l'Afrique ? | La Méditerranée | La mer Rouge | La mer Noire | La Manche
Quelle est la deuxième ville la plus peuplée de France ? | Marseille | Lyon | Toulouse | Lille
Quel fleuve traverse Londres ? | La Tamise | La Seine | Le Danube | Le Rhin
Quel est le plus haut sommet du monde ? | L'Everest | Le K2 | Le Kilimandjaro | Le mont Blanc
Quelle est la capitale de l'Égypte ? | Le Caire | Alexandrie | Louxor | Gizeh
Quel pays compte le plus d'habitants depuis 2023 ? | L'Inde | La Chine | Les États-Unis | L'Indonésie
Quelle est la capitale de la Suisse ? | Berne | Genève | Zurich | Lausanne
Quelle île française est surnommée « l'île de Beauté » ? | La Corse | La Réunion | La Martinique | Belle-Île
Dans quelle ville se trouve la Cité de l'espace ? | Toulouse | Bordeaux | Lyon | Nantes
Quelle est la capitale de la Norvège ? | Oslo | Stockholm | Helsinki | Copenhague
Quel pays est surnommé « le pays du Soleil-Levant » ? | Le Japon | La Chine | La Corée du Sud | La Thaïlande
Quelle est la capitale du Brésil ? | Brasília | Rio de Janeiro | São Paulo | Salvador
Quel est le plus grand océan du monde ? | Le Pacifique | L'Atlantique | L'océan Indien | L'Arctique
De quel pays New Delhi est-elle la capitale ? | L'Inde | Le Pakistan | Le Népal | Le Bangladesh
Quelle chaîne de montagnes sépare la France de l'Espagne ? | Les Pyrénées | Les Alpes | Le Jura | Les Vosges
Quel État américain a pour capitale Honolulu ? | Hawaï | La Californie | La Floride | L'Alaska
Dans quel pays se trouve Dubaï ? | Les Émirats arabes unis | Le Qatar | L'Arabie saoudite | Oman
Quelle ville est traversée par le Bosphore ? | Istanbul | Athènes | Ankara | Le Caire
Quel pays a pour capitale Buenos Aires ? | L'Argentine | Le Chili | L'Uruguay | Le Pérou
Quel est le plus long fleuve d'Afrique ? | Le Nil | Le Congo | Le Niger | Le Zambèze
Combien d'États composent les États-Unis ? | 50 | 48 | 51 | 52
Au bord de quelle mer se trouve la Croatie ? | L'Adriatique | La Baltique | La mer Noire | La mer du Nord
Quelle est la capitale de l'Irlande ? | Dublin | Belfast | Cork | Galway
Dans quel pays se trouve la ville de Cracovie ? | La Pologne | La Tchéquie | La Hongrie | L'Ukraine
Quel pays possède le plus grand nombre d'îles au monde ? | La Suède | L'Indonésie | Les Philippines | Le Japon
Quelle est la capitale de l'Islande ? | Reykjavik | Oslo | Nuuk | Tórshavn
Quel fleuve traverse Paris ? | La Seine | La Loire | La Marne | L'Oise
Quel volcan domine la baie de Naples ? | Le Vésuve | L'Etna | Le Stromboli | Le Fuji
Dans quel océan se trouve l'île de La Réunion ? | L'océan Indien | L'Atlantique | Le Pacifique | L'Arctique
Quelle ville est la capitale de l'Écosse ? | Édimbourg | Glasgow | Aberdeen | Inverness
Sur quel continent se trouve le désert d'Atacama ? | L'Amérique du Sud | L'Afrique | L'Asie | L'Australie
Quel est le plus grand lac d'Afrique ? | Le lac Victoria | Le lac Tanganyika | Le lac Tchad | Le lac Malawi
Quelle est la capitale du Maroc ? | Rabat | Casablanca | Marrakech | Fès
Dans quelle ville se trouve le Colisée ? | Rome | Athènes | Naples | Florence

# Histoire
En quelle année a eu lieu la prise de la Bastille ? | 1789 | 1792 | 1776 | 1815
Qui a été le premier président de la Ve République ? | Charles de Gaulle | Georges Pompidou | Vincent Auriol | François Mitterrand
En quelle année l'homme a-t-il marché sur la Lune pour la première fois ? | 1969 | 1965 | 1972 | 1959
En quelle année le mur de Berlin est-il tombé ? | 1989 | 1991 | 1985 | 1979
Quel roi de France était surnommé le Roi-Soleil ? | Louis XIV | Louis XVI | Louis XIII | François Ier
Quelle reine a été guillotinée en 1793 ? | Marie-Antoinette | Catherine de Médicis | Anne d'Autriche | Joséphine de Beauharnais
Qui a atteint l'Amérique en 1492 ? | Christophe Colomb | Vasco de Gama | Magellan | Amerigo Vespucci
En quelle année s'est terminée la Seconde Guerre mondiale ? | 1945 | 1944 | 1946 | 1939
Quel empereur a été exilé sur l'île d'Elbe ? | Napoléon Ier | Napoléon III | Charlemagne | Louis XVIII
Dans quelle ville Jeanne d'Arc a-t-elle été brûlée ? | Rouen | Orléans | Reims | Paris
En quelle année le Titanic a-t-il coulé ? | 1912 | 1905 | 1921 | 1898
Qui a été le premier homme à marcher sur la Lune ? | Neil Armstrong | Buzz Aldrin | Youri Gagarine | Michael Collins
Quel président américain a aboli l'esclavage ? | Abraham Lincoln | George Washington | Thomas Jefferson | John F. Kennedy
Quelle ville était la capitale de l'Empire byzantin ? | Constantinople | Rome | Athènes | Alexandrie
En quelle année les pièces et billets en euros sont-ils arrivés en France ? | 2002 | 1999 | 2000 | 2004
Qui a inventé l'imprimerie à caractères mobiles en Europe ? | Gutenberg | Galilée | Pascal | Descartes
Que commémore-t-on le 8 mai en France ? | La victoire de 1945 | L'armistice de 1918 | La prise de la Bastille | La fête du Travail
Que commémore-t-on le 11 novembre ? | L'armistice de 1918 | La victoire de 1945 | Le Débarquement | La libération de Paris
Où a eu lieu le débarquement allié du 6 juin 1944 ? | En Normandie | En Bretagne | En Provence | Dans le Nord
Quel pharaon a été retrouvé dans une tombe presque intacte en 1922 ? | Toutânkhamon | Ramsès II | Khéops | Akhenaton
Quel chef gaulois a été vaincu à Alésia ? | Vercingétorix | Ambiorix | Clovis | Brennus
Quel roi des Francs a été baptisé à Reims ? | Clovis | Charlemagne | Pépin le Bref | Dagobert
Quelle scientifique a reçu un prix Nobel de physique et un de chimie ? | Marie Curie | Rosalind Franklin | Irène Joliot-Curie | Ada Lovelace
En quelle année a eu lieu le premier vol motorisé des frères Wright ? | 1903 | 1895 | 1910 | 1919
Quelle guerre a opposé le Nord et le Sud des États-Unis ? | La guerre de Sécession | La guerre d'indépendance | La guerre de Cent Ans | La guerre froide
Combien de temps a réellement duré la guerre de Cent Ans ? | 116 ans | 100 ans | 99 ans | 130 ans
Qui a été le premier homme dans l'espace ? | Youri Gagarine | Neil Armstrong | John Glenn | Alexeï Leonov
Quel monument a été construit pour l'Exposition universelle de 1889 ? | La tour Eiffel | L'Arc de triomphe | Le Sacré-Cœur | Le Grand Palais
En quelle année François Mitterrand a-t-il été élu président pour la première fois ? | 1981 | 1974 | 1988 | 1995
Quelle ville a été ensevelie par l'éruption du Vésuve en 79 ? | Pompéi | Naples | Rome | Syracuse
Qui était le premier empereur romain ? | Auguste | Jules César | Néron | Caligula
Quel peuple a construit le Machu Picchu ? | Les Incas | Les Aztèques | Les Mayas | Les Olmèques
Quel roi a fait construire le château de Versailles tel qu'on le connaît ? | Louis XIV | Louis XV | Henri IV | François Ier
Quelle bataille a marqué la défaite définitive de Napoléon en 1815 ? | Waterloo | Austerlitz | Trafalgar | Iéna
En quelle année les femmes ont-elles voté pour la première fois en France ? | 1945 | 1918 | 1936 | 1968
Quel mur séparait Berlin-Est et Berlin-Ouest ? | Le mur de Berlin | Le rideau de fer | La ligne Maginot | Le mur d'Hadrien
Qui a prononcé l'appel du 18 juin 1940 ? | Charles de Gaulle | Philippe Pétain | Jean Moulin | Winston Churchill
Quel navigateur a réalisé le premier tour du monde (achevé par son équipage) ? | Magellan | Christophe Colomb | Jacques Cartier | James Cook

# Sciences
Quelle planète est la plus proche du Soleil ? | Mercure | Vénus | Mars | La Terre
Quel est le symbole chimique de l'or ? | Au | Or | Ag | Go
Combien d'os compte le corps humain adulte ? | 206 | 186 | 226 | 312
Quelle est la plus grande planète du système solaire ? | Jupiter | Saturne | Neptune | Uranus
À quelle température l'eau bout-elle au niveau de la mer ? | 100 °C | 90 °C | 110 °C | 120 °C
Quel gaz les plantes absorbent-elles pour la photosynthèse ? | Le dioxyde de carbone | L'oxygène | L'azote | L'hélium
Quel est le plus grand organe du corps humain ? | La peau | Le foie | L'intestin | Le cerveau
Combien de cœurs a une pieuvre ? | 3 | 1 | 2 | 8
Quelle planète est surnommée la planète rouge ? | Mars | Vénus | Jupiter | Mercure
Quel scientifique a formulé la théorie de la relativité ? | Albert Einstein | Isaac Newton | Niels Bohr | Stephen Hawking
Quelle est à peu près la vitesse de la lumière ? | 300 000 km/s | 30 000 km/s | 3 000 km/s | 3 millions de km/s
Combien de chromosomes possède une cellule humaine ordinaire ? | 46 | 23 | 44 | 48
Quel métal est liquide à température ambiante ? | Le mercure | Le plomb | L'étain | Le zinc
Quel groupe sanguin est dit « donneur universel » ? | O négatif | AB positif | A positif | B négatif
Combien de temps met la lumière du Soleil pour atteindre la Terre ? | Environ 8 minutes | Environ 8 secondes | Environ 1 heure | Environ 1 jour
Qui a découvert la pénicilline ? | Alexander Fleming | Louis Pasteur | Marie Curie | Robert Koch
Quel est l'élément chimique le plus abondant dans l'univers ? | L'hydrogène | L'oxygène | Le carbone | Le fer
Combien de dents a un adulte, dents de sagesse comprises ? | 32 | 28 | 30 | 36
Quelle unité mesure la puissance électrique ? | Le watt | Le volt | L'ampère | L'ohm
Quel est le minéral naturel le plus dur ? | Le diamant | Le quartz | Le saphir | Le granit
Combien de planètes compte le système solaire ? | 8 | 9 | 7 | 10
Quel organe produit l'insuline ? | Le pancréas | Le foie | Les reins | La rate
Contre quelle maladie Louis Pasteur a-t-il mis au point un vaccin en 1885 ? | La rage | La variole | La grippe | La polio
Que mesure l'échelle de Richter ? | Les séismes | Le vent | La pluie | Les marées
À quoi sert un anémomètre ? | Mesurer le vent | Mesurer la pluie | Mesurer la pression | Mesurer la température
Combien de litres de sang un adulte a-t-il environ ? | 5 litres | 2 litres | 10 litres | 8 litres
Quel est le symbole chimique du fer ? | Fe | Fr | Ir | F
Quelle force nous retient au sol ? | La gravité | Le magnétisme | La friction | La pression
De quelle couleur est le sang d'un poulpe ? | Bleu | Vert | Rouge | Transparent
Quel est le plus petit os du corps humain ? | L'étrier | Le marteau | La rotule | Le coccyx
Quelle planète tourne « couchée » sur le côté ? | Uranus | Neptune | Saturne | Vénus
Quel savant a énoncé la loi de la gravitation universelle ? | Isaac Newton | Galilée | Copernic | Kepler
Quelle partie de l'œil donne sa couleur aux yeux ? | L'iris | La pupille | La rétine | La cornée
Combien de temps la Terre met-elle pour faire le tour du Soleil ? | Environ 365 jours | 24 heures | 28 jours | 12 ans
Qu'est-ce qu'une année-lumière ? | Une distance | Une durée | Une vitesse | Une température

# Animaux et nature
Quel est le plus grand animal du monde ? | La baleine bleue | L'éléphant d'Afrique | Le cachalot | Le requin-baleine
Combien de pattes a une araignée ? | 8 | 6 | 10 | 12
Quel est l'animal terrestre le plus rapide ? | Le guépard | Le lion | L'antilope | Le lévrier
Comment appelle-t-on le petit de la chèvre ? | Le chevreau | Le poulain | L'agneau | Le faon
Combien de temps dure environ la gestation d'une éléphante ? | 22 mois | 9 mois | 12 mois | 36 mois
Quel animal est l'emblème du WWF ? | Le panda | Le koala | Le tigre | L'ours polaire
Comment s'appelle le petit du cerf ? | Le faon | Le chevreau | Le marcassin | Le lionceau
De quel animal le marcassin est-il le petit ? | Du sanglier | Du cerf | Du renard | Du blaireau
Quel est le seul mammifère vraiment capable de voler ? | La chauve-souris | L'écureuil volant | Le colugo | Le pangolin
De quoi se nourrit principalement le panda géant ? | De bambou | D'eucalyptus | De poisson | De fruits
De quoi se nourrit le koala ? | De feuilles d'eucalyptus | De bambou | D'insectes | De baies
Quel reptile change de couleur ? | Le caméléon | L'iguane | Le varan | La tortue
Combien de bosses a un dromadaire ? | 1 | 2 | 3 | 0
Quel arbre produit des glands ? | Le chêne | Le hêtre | Le châtaignier | Le bouleau
Quelle fleur est le symbole des Pays-Bas ? | La tulipe | La rose | Le tournesol | La jonquille
Combien d'yeux a une abeille ? | 5 | 2 | 4 | 8
Quel est le plus grand félin du monde ? | Le tigre | Le lion | Le jaguar | Le léopard
Que fait le corbeau ? | Il croasse | Il coasse | Il caquette | Il roucoule
Que fait la grenouille ? | Elle coasse | Elle croasse | Elle glousse | Elle brame
Quel oiseau pond les plus gros œufs ? | L'autruche | L'émeu | Le condor | L'aigle royal
Quel mammifère pond des œufs ? | L'ornithorynque | Le castor | La loutre | Le kangourou
Où le kangourou garde-t-il son petit ? | Dans sa poche ventrale | Sur son dos | Dans un terrier | Dans un nid
Quel animal est connu pour sa lenteur et dort jusqu'à 15 heures par jour ? | Le paresseux | Le koala | La tortue | Le lama
Quel est le seul oiseau capable de voler en arrière ? | Le colibri | Le moineau | L'hirondelle | Le martinet
Combien de pattes a un insecte ? | 6 | 8 | 4 | 10
Quel animal a des empreintes digitales presque identiques aux nôtres ? | Le koala | Le chien | Le chat | Le cochon
Quel requin est le plus grand poisson du monde ? | Le requin-baleine | Le grand requin blanc | Le requin-tigre | Le requin-marteau
Un groupe de lions s'appelle… | Une troupe | Une meute | Un banc | Une harde
Quel est l'arbre symbole du Canada ? | L'érable | Le sapin | Le chêne | Le bouleau
Quel animal est surnommé « le roi de la jungle » alors qu'il vit dans la savane ? | Le lion | Le tigre | Le gorille | L'éléphant

# Cinéma
Qui a réalisé « Titanic » ? | James Cameron | Steven Spielberg | Ridley Scott | Christopher Nolan
Dans « Le Roi Lion », comment s'appelle le père de Simba ? | Mufasa | Scar | Rafiki | Zazu
Quel acteur incarne Jack Sparrow ? | Johnny Depp | Orlando Bloom | Brad Pitt | Keanu Reeves
Dans quelle maison de Poudlard est Harry Potter ? | Gryffondor | Serpentard | Serdaigle | Poufsouffle
Quel film Pixar met en scène un rat cuisinier à Paris ? | Ratatouille | Le Monde de Nemo | Cars | Là-haut
Comment s'appelle le cow-boy de « Toy Story » ? | Woody | Buzz | Andy | Jessie
Qui joue Amélie Poulain ? | Audrey Tautou | Marion Cotillard | Léa Seydoux | Sophie Marceau
Dans quel film entend-on « Je s'appelle Groot » ? | Les Gardiens de la Galaxie | Avengers | Thor | Star Wars
Quel film français de 2011 raconte l'amitié entre Philippe et Driss ? | Intouchables | Bienvenue chez les Ch'tis | Le Dîner de cons | Les Petits Mouchoirs
Dans « Star Wars », qui est le père de Luke Skywalker ? | Dark Vador | Obi-Wan Kenobi | Yoda | L'Empereur
Quelle princesse Disney perd sa pantoufle de verre ? | Cendrillon | Blanche-Neige | Aurore | Belle
Quel magicien guide Frodon dans « Le Seigneur des anneaux » ? | Gandalf | Saroumane | Dumbledore | Merlin
Comment s'appelle le bonhomme de neige de « La Reine des neiges » ? | Olaf | Sven | Kristoff | Hans
Quel film a reçu l'Oscar du meilleur film lors de la cérémonie de 2020 ? | Parasite | 1917 | Joker | Once Upon a Time in Hollywood
Qui a réalisé « Inception » ? | Christopher Nolan | Denis Villeneuve | David Fincher | Quentin Tarantino
Quel animal parlant est le meilleur ami de Shrek ? | Un âne | Un cochon | Un loup | Un canard
Quel film de 1993 met en scène des dinosaures recréés par clonage ? | Jurassic Park | Godzilla | King Kong | Dinosaure
Quel acteur joue Iron Man dans les films Marvel ? | Robert Downey Jr. | Chris Evans | Chris Hemsworth | Mark Ruffalo
Quel film d'animation se déroule pendant le jour des morts au Mexique ? | Coco | Encanto | Vaiana | Luca
Dans « Les Visiteurs », quel personnage joue Jean Reno ? | Godefroy de Montmirail | Jacquouille la Fripouille | Jacquart | Hubert de Montmirail
Dans quel film entend-on « Mon précieux » ? | Le Seigneur des anneaux | Harry Potter | Pirates des Caraïbes | Narnia
Dans quel film entend-on « Non, je suis ton père » ? | Star Wars | Le Roi Lion | Retour vers le futur | Matrix
Quelle voiture sert de machine à voyager dans le temps dans « Retour vers le futur » ? | Une DeLorean | Une Ford Mustang | Une Cadillac | Une Coccinelle
Dans « Matrix », quelle pilule Neo choisit-il ? | La rouge | La bleue | La verte | La jaune
Qui a réalisé « Pulp Fiction » ? | Quentin Tarantino | Martin Scorsese | Guy Ritchie | Steven Soderbergh
Comment s'appelle la petite fille dans « Monstres et Cie » ? | Bouh | Lilo | Agnès | Riley
Quel personnage s'écrie « Vers l'infini et au-delà ! » ? | Buzz l'Éclair | Woody | Flash McQueen | Wall-E
Dans quel quartier de Paris vit Amélie Poulain ? | Montmartre | Le Marais | Belleville | Saint-Germain
Dans quelle ville du Nord se passe « Bienvenue chez les Ch'tis » ? | Bergues | Lille | Roubaix | Dunkerque
Qui a réalisé « E.T. l'extra-terrestre » ? | Steven Spielberg | George Lucas | James Cameron | Tim Burton
Comment s'appelle le père de Nemo ? | Marin | Gill | Crush | Bruce
Quelle actrice joue Hermione Granger ? | Emma Watson | Emma Stone | Keira Knightley | Kristen Stewart
Quel film retrace la carrière de Freddie Mercury et de Queen ? | Bohemian Rhapsody | Rocketman | Elvis | A Star Is Born
Quel est le prénom du personnage de Leonardo DiCaprio dans « Titanic » ? | Jack | Cal | Billy | Tommy
Qui est le méchant dans « Aladdin » ? | Jafar | Scar | Ursula | Hadès
Quelle saga suit Katniss Everdeen ? | Hunger Games | Divergente | Le Labyrinthe | Twilight
Dans « Twilight », de quel vampire Bella tombe-t-elle amoureuse ? | Edward | Jacob | Carlisle | Jasper
Dans « L'Âge de glace », quel écureuil court après son gland ? | Scrat | Sid | Manny | Diego
Quel acteur joue le Joker dans le film « Joker » de 2019 ? | Joaquin Phoenix | Heath Ledger | Jared Leto | Jack Nicholson
Sur quelle lune se déroule « Avatar » ? | Pandora | Endor | Tatooine | Arrakis
Comment s'appelle la planète désertique de « Dune » ? | Arrakis | Tatooine | Pandora | Jakku
Quel film raconte un couple qui se rencontre en chantant à Los Angeles, avec Ryan Gosling ? | La La Land | Crazy, Stupid, Love | Drive | Moulin Rouge
Dans « Le Diable s'habille en Prada », qui joue la rédactrice en chef ? | Meryl Streep | Anne Hathaway | Glenn Close | Julia Roberts
Quel film de Disney a pour héroïne une jeune Polynésienne qui part en mer ? | Vaiana | Pocahontas | Mulan | Raiponce
Dans « Harry Potter », comment s'appelle le directeur de Poudlard ? | Albus Dumbledore | Severus Rogue | Minerva McGonagall | Horace Slughorn
Dans « Pirates des Caraïbes », comment s'appelle le bateau de Jack Sparrow ? | Le Black Pearl | Le Hollandais volant | Le Queen Anne's Revenge | Le Nautilus
Quel film de 2023 a opposé « Barbie » au box-office lors du « Barbenheimer » ? | Oppenheimer | Mission impossible | Indiana Jones | Super Mario Bros.
Quel acteur français a joué Lupin dans la série Netflix et Driss dans « Intouchables » ? | Omar Sy | Jamel Debbouze | Jean Dujardin | Gad Elmaleh
Quel film d'animation japonais met en scène la jeune Chihiro ? | Le Voyage de Chihiro | Mon voisin Totoro | Princesse Mononoké | Ponyo
Dans « Le Seigneur des anneaux », qui porte l'Anneau jusqu'au Mordor ? | Frodon | Aragorn | Gollum | Legolas

# Séries
Dans « Friends », comment s'appelle le café où se retrouve la bande ? | Central Perk | MacLaren's | Monk's Café | Luke's
Quelle famille de « Game of Thrones » a pour devise « L'hiver vient » ? | Les Stark | Les Lannister | Les Targaryen | Les Baratheon
Quelle série suit un professeur de chimie devenu fabricant de drogue ? | Breaking Bad | Narcos | Ozark | The Wire
Quel masque portent les braqueurs de « La Casa de papel » ? | Dalí | Picasso | Guy Fawkes | Joker
Comment s'appelle la jeune fille aux pouvoirs dans « Stranger Things » ? | Onze | Max | Nancy | Robin
Qui répète « Ça va être légen… attends… daire ! » dans « How I Met Your Mother » ? | Barney | Ted | Marshall | Lily
Quelle série coréenne de 2021 met en scène des jeux d'enfants mortels ? | Squid Game | Kingdom | Sweet Home | All of Us Are Dead
Dans quelle entreprise travaille Michael Scott dans « The Office » ? | Dunder Mifflin | Sabre | Wernham Hogg | Initech
Dans « Kaamelott », qui est le roi ? | Arthur | Perceval | Karadoc | Lancelot
Quel est le métier de Ross dans « Friends » ? | Paléontologue | Chef cuisinier | Acteur | Masseur
Combien d'œufs de dragon Daenerys fait-elle éclore dans « Game of Thrones » ? | 3 | 2 | 4 | 5
Dans quelle série trouve-t-on le physicien Sheldon Cooper ? | The Big Bang Theory | Silicon Valley | The IT Crowd | Community
Quelle série suit la famille Shelby à Birmingham ? | Peaky Blinders | The Crown | Downton Abbey | Boardwalk Empire
Dans quel hôpital se déroule « Dr House » ? | Princeton-Plainsboro | Seattle Grace | Sacred Heart | County General
Dans quelle ville se déroulait « Plus belle la vie » ? | Marseille | Lyon | Nice | Montpellier
Comment s'appelle le singe de Ross dans « Friends » ? | Marcel | George | Bobo | Oscar
Dans « Emily in Paris », dans quel domaine travaille Emily ? | Le marketing | La mode | La cuisine | Le journalisme
Comment s'appelle le sorceleur de « The Witcher » ? | Geralt de Riv | Jaskier | Ciri | Yennefer
De quelle famille vient Mercredi dans la série Netflix ? | La famille Addams | La famille Munster | La famille Simpson | La famille Belcher
Quelle série animée suit un scientifique alcoolique et son petit-fils ? | Rick et Morty | Futurama | South Park | BoJack Horseman
Quelle série retrace le règne d'Élisabeth II ? | The Crown | Victoria | Bridgerton | Downton Abbey
Qui signe la gazette anonyme dans « La Chronique des Bridgerton » ? | Lady Whistledown | Lady Danbury | Daphné Bridgerton | La reine Charlotte
Dans « Prison Break », qui a le plan de l'évasion tatoué sur le corps ? | Michael Scofield | Lincoln Burrows | T-Bag | Sucre
Comment s'appelle le fils de Homer Simpson ? | Bart | Milhouse | Nelson | Ned
Quel est le métier de Joey dans « Friends » ? | Acteur | Cuisinier | Informaticien | Professeur
Dans « Lost », où s'écrase l'avion ? | Sur une île | Dans la jungle amazonienne | Dans le désert | Dans les montagnes
Quelle série suit cinq amis dans un collège britannique et Otis, fils d'une sexologue ? | Sex Education | Skins | Heartstopper | Euphoria
Dans « Desperate Housewives », comment s'appelle la rue ? | Wisteria Lane | Elm Street | Maple Drive | Sunset Boulevard
Dans « The Walking Dead », contre quoi les héros luttent-ils ? | Des zombies | Des vampires | Des extraterrestres | Des robots
Quel personnage de « Game of Thrones » répète « Tu ne sais rien, Jon Snow » ? | Ygritte | Arya | Sansa | Daenerys
Dans « Gossip Girl », qui se cache derrière le blog ? | Dan Humphrey | Blair Waldorf | Serena van der Woodsen | Chuck Bass
Quelle série d'animation a pour héros une éponge jaune ? | Bob l'éponge | Les Razmoket | Kim Possible | Totally Spies

# Musique
Quel chanteur est surnommé « le King » ? | Elvis Presley | Michael Jackson | Frank Sinatra | Johnny Cash
De quel pays vient le groupe ABBA ? | La Suède | La Norvège | Le Danemark | La Finlande
Qui chante « Formidable » ? | Stromae | Maître Gims | Christophe Maé | Bigflo & Oli
Quel duo français a sorti l'album « Random Access Memories » ? | Daft Punk | Justice | Air | Cassius
Qui chante « Bad Guy » ? | Billie Eilish | Ariana Grande | Dua Lipa | Lorde
Quel chanteur français était surnommé « le Taulier » ? | Johnny Hallyday | Eddy Mitchell | Michel Sardou | Jacques Dutronc
Combien de membres comptaient les Beatles ? | 4 | 3 | 5 | 6
Qui chante « Shape of You » ? | Ed Sheeran | Justin Bieber | Sam Smith | Shawn Mendes
Quelle chanteuse a sorti l'album « 21 » ? | Adele | Rihanna | Beyoncé | Amy Winehouse
Quel rappeur a sorti l'album « Civilisation » en 2021 ? | Orelsan | Nekfeu | PNL | Booba
Qui chante « Alors on danse » ? | Stromae | Kungs | Soprano | Black M
Quel est le vrai prénom de Lady Gaga ? | Stefani | Alicia | Katheryn | Robyn
Quelle chanteuse est surnommée « Queen B » ? | Beyoncé | Britney Spears | Rihanna | Mariah Carey
De quel groupe Freddie Mercury était-il le chanteur ? | Queen | The Rolling Stones | Led Zeppelin | Pink Floyd
Qui chante « Je veux » (2010) ? | Zaz | Louane | Indila | Joyce Jonathan
Qui a interprété « Thriller » ? | Michael Jackson | Prince | Stevie Wonder | Lionel Richie
Quel duo toulousain chante « Dommage » ? | Bigflo & Oli | PNL | Casseurs Flowters | Lomepal et Roméo Elvis
Quelle chanteuse a sorti « Dernière danse » ? | Indila | Louane | Angèle | Aya Nakamura
De quel instrument jouait principalement Chopin ? | Le piano | Le violon | La guitare | La flûte
Qui chante « Balance ton quoi » ? | Angèle | Clara Luciani | Pomme | Juliette Armanet
Qui a chanté « Djadja » ? | Aya Nakamura | Wejdene | Lous and the Yakuza | Imen Es
Combien de cordes compte une guitare classique ? | 6 | 4 | 5 | 7
Quel groupe britannique chante « Wonderwall » ? | Oasis | Blur | Coldplay | Radiohead
Quel album de Stromae contient « Papaoutai » ? | Racine carrée | Cheese | Multitude | Civilisation
Quelle chanteuse a sorti « Flowers » en 2023 ? | Miley Cyrus | Taylor Swift | Selena Gomez | Olivia Rodrigo
Comment s'appelle la tournée record de Taylor Swift lancée en 2023 ? | The Eras Tour | The Golden Tour | The Midnights Tour | The Swift Tour
Quel artiste chante « Blinding Lights » ? | The Weeknd | Bruno Mars | Post Malone | Harry Styles
Quel festival a lieu chaque été à Carhaix, en Bretagne ? | Les Vieilles Charrues | Les Eurockéennes | Solidays | Rock en Seine
Quelle chanteuse québécoise chante « My Heart Will Go On » ? | Céline Dion | Lara Fabian | Isabelle Boulay | Ginette Reno
Qui chantait « La Bohème » ? | Charles Aznavour | Jacques Brel | Georges Brassens | Serge Gainsbourg
Qui chantait « Non, je ne regrette rien » ? | Édith Piaf | Dalida | Barbara | Juliette Gréco
Quel groupe de K-pop a chanté « Dynamite » ? | BTS | Blackpink | EXO | Stray Kids
Combien de notes différentes compte la gamme de do majeur ? | 7 | 8 | 5 | 12
Quel rappeur canadien a sorti « God's Plan » ? | Drake | The Weeknd | Tory Lanez | Justin Bieber
Quelle chanteuse a représenté la France à l'Eurovision 2021 avec « Voilà » ? | Barbara Pravi | Amir | Louane | Slimane
Quel artiste a gagné l'Eurovision 2024 pour la Suisse ? | Nemo | Slimane | Måneskin | Loreen
Quel groupe italien a gagné l'Eurovision 2021 ? | Måneskin | Il Volo | Mahmood | Modà
Qui chante « Tout oublier » avec Angèle ? | Roméo Elvis | Damso | Orelsan | Vianney
De quel pays vient la chanteuse Shakira ? | La Colombie | Le Mexique | L'Espagne | L'Argentine
Quel chanteur est surnommé « le Prince de Bel-Air » ? | Will Smith | Usher | Pharrell Williams | Snoop Dogg

# Sport
Combien de joueurs compte une équipe de football sur le terrain ? | 11 | 10 | 12 | 9
En quelle année la France a-t-elle remporté sa deuxième Coupe du monde de football ? | 2018 | 2006 | 2014 | 2002
Dans quel sport utilise-t-on un volant ? | Le badminton | Le squash | Le tennis | Le padel
Combien de points vaut un essai au rugby ? | 5 | 3 | 4 | 7
Quel joueur a remporté le plus de fois Roland-Garros ? | Rafael Nadal | Roger Federer | Novak Djokovic | Björn Borg
Combien de joueurs par équipe y a-t-il sur un terrain de basket ? | 5 | 6 | 7 | 4
Où se sont déroulés les Jeux olympiques d'été de 2024 ? | À Paris | À Los Angeles | À Tokyo | À Londres
Quel nageur français a remporté quatre titres individuels aux JO de Paris 2024 ? | Léon Marchand | Florent Manaudou | Yannick Agnel | Maxime Grousset
Combien de temps dure un match de football, hors prolongations ? | 90 minutes | 80 minutes | 100 minutes | 60 minutes
Quel est le sport national du Japon ? | Le sumo | Le judo | Le karaté | Le kendo
Combien de trous compte un parcours de golf classique ? | 18 | 9 | 12 | 21
Dans quel sport Teddy Riner est-il champion ? | Le judo | La boxe | La lutte | Le karaté
Quel pays a remporté le plus de Coupes du monde de football ? | Le Brésil | L'Allemagne | L'Italie | L'Argentine
Quel footballeur est surnommé « la Pulga » ? | Lionel Messi | Cristiano Ronaldo | Neymar | Kylian Mbappé
Combien d'anneaux compte le drapeau olympique ? | 5 | 4 | 6 | 7
Dans quel sport réussit-on un « strike » en renversant toutes les quilles ? | Le bowling | Le golf | Le billard | La pétanque
Dans quelle ville se joue le tournoi de Wimbledon ? | Londres | Manchester | Édimbourg | Dublin
Dans quel sport brille Antoine Dupont ? | Le rugby | Le football | Le handball | Le basket
Quel Français a été choisi en premier à la draft NBA 2023 ? | Victor Wembanyama | Tony Parker | Rudy Gobert | Evan Fournier
Combien de joueurs par équipe y a-t-il sur un terrain de volley-ball ? | 6 | 5 | 7 | 8
Quelle distance parcourt-on lors d'un marathon ? | 42,195 km | 40 km | 21,1 km | 50 km
Quel pilote de F1 compte sept titres de champion du monde, comme Michael Schumacher ? | Lewis Hamilton | Sebastian Vettel | Max Verstappen | Ayrton Senna
Quel club est surnommé « l'OM » ? | L'Olympique de Marseille | L'Olympique lyonnais | Le Paris Saint-Germain | Le LOSC
Dans quelle course le leader porte-t-il le maillot jaune ? | Le Tour de France | Le Giro | Paris-Roubaix | Le Dakar
Dans quel sport parle-t-on de « ippon » ? | Le judo | Le sumo | L'escrime | La boxe
Combien de joueurs compte une équipe de rugby à XV sur le terrain ? | 15 | 13 | 11 | 12
Quelle surface caractérise le tournoi de Roland-Garros ? | La terre battue | Le gazon | Le dur | Le synthétique
Quel joueur portugais a remporté cinq Ballons d'or ? | Cristiano Ronaldo | Luís Figo | Eusébio | Bernardo Silva
En quelle année la France a-t-elle remporté sa première Coupe du monde de football ? | 1998 | 1984 | 2000 | 1994
Quel sport se joue avec une crosse, sur gazon ou sur glace ? | Le hockey | Le cricket | Le polo | Le golf
Combien de points marque-t-on avec un panier tiré de loin au basket ? | 3 | 2 | 4 | 1
Quel athlète jamaïcain détient le record du monde du 100 mètres ? | Usain Bolt | Yohan Blake | Asafa Powell | Carl Lewis

# Cuisine
Quel est l'ingrédient principal du guacamole ? | L'avocat | Le concombre | La courgette | Le petit pois
De quelle région vient la tartiflette ? | La Savoie | L'Alsace | La Bretagne | L'Auvergne
Quel fromage met-on dans une vraie tartiflette ? | Le reblochon | Le comté | La raclette | Le camembert
De quel pays viennent les sushis ? | Le Japon | La Chine | La Corée | La Thaïlande
Avec quoi prépare-t-on le houmous ? | Des pois chiches | Des lentilles | Des haricots blancs | Des fèves
Quelle épice donne sa couleur jaune au curry ? | Le curcuma | Le safran | Le paprika | Le cumin
Quelle est l'épice la plus chère du monde ? | Le safran | La vanille | La cardamome | Le poivre
De quelle ville vient la pizza margherita ? | Naples | Rome | Milan | Florence
Quel fromage met-on sur une pizza margherita ? | La mozzarella | Le parmesan | Le gorgonzola | La ricotta
De quelle région vient le camembert ? | La Normandie | La Bretagne | La Bourgogne | Le Jura
Quelle boisson pétillante fait-on avec des pommes en Normandie ? | Le cidre | Le pastis | Le kir | Le chouchen
Quel dessert associe choux, glace vanille et chocolat chaud ? | Les profiteroles | Le paris-brest | Le mille-feuille | La tarte Tatin
Quelle tarte est cuite à l'envers ? | La tarte Tatin | La tarte Bourdaloue | La tarte au citron | La tarte normande
De quel pays vient la paella ? | L'Espagne | Le Portugal | Le Mexique | L'Italie
Qu'est-ce que le tzatziki ? | Une sauce au yaourt et au concombre | Un fromage grec | Une pâtisserie au miel | Une soupe froide
Quel légume est la base du gaspacho ? | La tomate | Le concombre | Le poivron | La betterave
Avec quelle herbe fait-on le pesto traditionnel ? | Le basilic | Le persil | La coriandre | La menthe
Quel alcool met-on dans un mojito ? | Le rhum | La vodka | La tequila | Le gin
Quel fromage est indispensable au tiramisu ? | Le mascarpone | La ricotta | La feta | Le fromage blanc
De quel pays vient le kimchi ? | La Corée | Le Japon | La Chine | Le Vietnam
Quelle sauce se fait avec des œufs, de l'huile et de la moutarde ? | La mayonnaise | La béchamel | La hollandaise | La vinaigrette
Avec quel lait fabrique-t-on le roquefort ? | Du lait de brebis | Du lait de vache | Du lait de chèvre | Du lait de bufflonne
Quel fruit sec donne son goût à la frangipane ? | L'amande | La noisette | La noix | La pistache
Qu'est-ce qu'un croque-madame ? | Un croque-monsieur avec un œuf | Un croque-monsieur sans jambon | Un croque végétarien | Un croque sucré
Quel plat britannique associe poisson pané et frites ? | Le fish and chips | Le shepherd's pie | Le pudding | Le haggis
Quel pays est à l'origine des tacos ? | Le Mexique | L'Espagne | Le Brésil | Les États-Unis
Quelle pâtisserie en forme de roue rend hommage à une course cycliste ? | Le paris-brest | L'opéra | Le saint-honoré | Le fraisier
Quelle céréale est la base du risotto ? | Le riz | Le blé | L'orge | Le quinoa
De quoi est fait le chocolat blanc ? | De beurre de cacao | De poudre de cacao | De lait seulement | De noix de coco
Quel ingrédient fait lever la pâte à pain ? | La levure | Le sel | Le sucre | Le beurre
Quel pays a inventé la raclette ? | La Suisse | La France | L'Autriche | La Belgique
Quel est l'ingrédient principal des falafels ? | Les pois chiches | Les lentilles | Le riz | Les pommes de terre
Comment cuit-on le « bao », ce petit pain asiatique ? | À la vapeur | À la poêle | Au four | À la friteuse

# Langue française
Comment écrit-on le pluriel de « bijou » ? | Bijoux | Bijous | Bijou | Bijoues
Combien y a-t-il de lettres dans l'alphabet français ? | 26 | 24 | 25 | 28
Que veut dire « poser un lapin » ? | Ne pas venir à un rendez-vous | Faire une blague | Partir en vacances | Offrir un cadeau
Que veut dire « avoir le cafard » ? | Être déprimé | Avoir peur | Être malade | Être en colère
Que veut dire « tomber dans les pommes » ? | S'évanouir | Tomber amoureux | Se tromper | Avoir faim
Que veut dire « coûter les yeux de la tête » ? | Coûter très cher | Faire mal | Être difficile | Être rare
Lequel de ces mots est un palindrome ? | Kayak | Canoë | Radeau | Voilier
Quel est le contraire de « prolixe » ? | Concis | Bavard | Lent | Gentil
Que veut dire « avoir un poil dans la main » ? | Être paresseux | Être malchanceux | Être poilu | Être généreux
Que veut dire « mettre son grain de sel » ? | Donner son avis sans y être invité | Cuisiner | Économiser | Se vexer
« Il pleut des cordes » veut dire qu'il pleut… | Très fort | Un peu | Rarement | En été
Quel est le féminin de « loup » ? | Louve | Loupe | Loupine | Louette
Comment appelle-t-on le petit du lièvre ? | Le levraut | Le lapereau | Le louveteau | Le faon
Que veut dire « en avoir ras le bol » ? | En avoir assez | Avoir faim | Être content | Être pressé
Comment appelle-t-on un mot qui a le même sens qu'un autre ? | Un synonyme | Un antonyme | Un homonyme | Un paronyme
Que veut dire « avoir la main verte » ? | Être doué pour le jardinage | Être jaloux | Être malade | Être riche
Que veut dire « se faire rouler dans la farine » ? | Se faire avoir | Cuisiner | Tomber | Être félicité
Que veut dire « prendre ses jambes à son cou » ? | S'enfuir en courant | S'étirer | Danser | Faire une chute
Combien de voyelles compte l'alphabet français, en comptant le y ? | 6 | 5 | 7 | 4
Lequel de ces mots est un synonyme de « hilarant » ? | Désopilant | Affligeant | Sinistre | Lassant
Que veut dire « avoir la grosse tête » ? | Être prétentieux | Avoir mal à la tête | Être intelligent | Être têtu
Que veut dire « raconter des salades » ? | Mentir | Parler de cuisine | Bavarder | Se plaindre
Que veut dire « être dans la lune » ? | Être distrait | Être amoureux | Être fatigué | Être perdu
Que veut dire « faire chou blanc » ? | Échouer | Gagner | Cuisiner | Rougir
Que veut dire « avoir d'autres chats à fouetter » ? | Avoir plus important à faire | Avoir des animaux | Être méchant | Être pressé de rentrer
Quel est le pluriel de « œil » ? | Yeux | Œils | Œuils | Œilles
Quelle est la bonne orthographe ? | Rythme | Rhytme | Rytme | Rhythme
Lequel de ces mots est féminin ? | Une oasis | Un oasis | Les deux | Aucun des deux
Lequel de ces mots est masculin ? | Un astérisque | Une astérisque | Les deux | Aucun des deux
Que veut dire « avoir le coup de foudre » ? | Tomber amoureux au premier regard | Être frappé par l'orage | Se mettre en colère | Avoir une idée
Que veut dire « couper la poire en deux » ? | Faire un compromis | Partager un dessert | Se disputer | Tricher

# Livres, BD et art
Qui a écrit « Le Petit Prince » ? | Antoine de Saint-Exupéry | Jules Verne | Albert Camus | Marcel Pagnol
Qui a écrit « Vingt mille lieues sous les mers » ? | Jules Verne | Victor Hugo | Alexandre Dumas | H. G. Wells
Qui a écrit « Les Trois Mousquetaires » ? | Alexandre Dumas | Victor Hugo | Molière | Honoré de Balzac
Qui a écrit « Les Misérables » ? | Victor Hugo | Émile Zola | Gustave Flaubert | Honoré de Balzac
Qui a peint « Les Tournesols » ? | Vincent van Gogh | Claude Monet | Paul Gauguin | Paul Cézanne
Quel peintre s'est coupé une partie de l'oreille ? | Vincent van Gogh | Pablo Picasso | Salvador Dalí | Henri Matisse
Qui a sculpté « Le Penseur » ? | Auguste Rodin | Camille Claudel | Michel-Ange | Alberto Giacometti
Qui a écrit « Roméo et Juliette » ? | William Shakespeare | Molière | Jean Racine | Victor Hugo
Qui a créé Sherlock Holmes ? | Arthur Conan Doyle | Agatha Christie | Edgar Allan Poe | Maurice Leblanc
Qui a créé Arsène Lupin ? | Maurice Leblanc | Gaston Leroux | Georges Simenon | Arthur Conan Doyle
Qui a écrit « Harry Potter » ? | J. K. Rowling | Suzanne Collins | Stephenie Meyer | Philip Pullman
Dans quel musée est exposée « La Joconde » ? | Le Louvre | Le musée d'Orsay | Le Centre Pompidou | Le Prado
Qui a peint « La Joconde » ? | Léonard de Vinci | Michel-Ange | Raphaël | Botticelli
À quel mouvement appartient Claude Monet ? | L'impressionnisme | Le cubisme | Le surréalisme | Le pop art
Quel peintre est célèbre pour ses montres molles ? | Salvador Dalí | René Magritte | Pablo Picasso | Joan Miró
Qui a écrit « L'Étranger » ? | Albert Camus | Jean-Paul Sartre | André Gide | Boris Vian
Qui a écrit « Le Malade imaginaire » ? | Molière | Jean Racine | Pierre Corneille | Marivaux
Qui a dessiné Astérix aux côtés du scénariste Goscinny ? | Albert Uderzo | Hergé | Morris | Franquin
Comment s'appelle le chien de Tintin ? | Milou | Idéfix | Rantanplan | Snoopy
Comment s'appelle le chien d'Obélix ? | Idéfix | Milou | Pif | Rantanplan
Qui a créé Gaston Lagaffe ? | André Franquin | Hergé | Peyo | Morris
Qui a créé les Schtroumpfs ? | Peyo | Hergé | Franquin | Uderzo
Combien de tomes compte la saga Harry Potter principale ? | 7 | 6 | 8 | 5
Quel cow-boy « tire plus vite que son ombre » ? | Lucky Luke | Blueberry | Tex Willer | Billy the Kid
Quel manga suit Luffy et son équipage de pirates ? | One Piece | Naruto | Dragon Ball | Bleach
Dans « Naruto », de quel village vient le héros ? | Konoha | Suna | Kiri | Amegakure
Comment s'appelle le héros de « Dragon Ball » ? | Son Goku | Vegeta | Naruto | Luffy
Qui a peint « Guernica » ? | Pablo Picasso | Salvador Dalí | Joan Miró | Francisco de Goya
Quel artiste de rue britannique reste anonyme ? | Banksy | Invader | Shepard Fairey | JR
Qui a écrit « Le Comte de Monte-Cristo » ? | Alexandre Dumas | Victor Hugo | Jules Verne | Stendhal
Qui a écrit la saga « Twilight » ? | Stephenie Meyer | J. K. Rowling | Suzanne Collins | Veronica Roth

# Culture générale
Combien de jours compte une année bissextile ? | 366 | 365 | 364 | 367
Combien de cases compte un échiquier ? | 64 | 81 | 100 | 49
De quelle couleur était le cheval blanc d'Henri IV ? | Blanc | Gris | Noir | Alezan
Combien de faces a un dé classique ? | 6 | 8 | 4 | 12
Quel chiffre romain vaut 50 ? | L | C | D | V
Combien de zéros compte un million ? | 6 | 5 | 7 | 9
Quel était le prénom de la reine d'Angleterre morte en 2022 ? | Élisabeth | Victoria | Mary | Anne
Quelle est la langue officielle du Brésil ? | Le portugais | L'espagnol | Le brésilien | L'anglais
Quelle couleur obtient-on en mélangeant du bleu et du jaune ? | Le vert | Le violet | L'orange | Le marron
Combien de couleurs compte traditionnellement l'arc-en-ciel ? | 7 | 6 | 5 | 8
Quelle est la monnaie du Royaume-Uni ? | La livre sterling | L'euro | Le dollar | Le franc
Quelle est la monnaie du Japon ? | Le yen | Le yuan | Le won | Le baht
Quel jour fête-t-on la Saint-Valentin ? | Le 14 février | Le 14 mars | Le 1er février | Le 21 février
Quel animal est l'emblème de la France ? | Le coq | L'aigle | Le lion | Le loup
Combien de mois de l'année ont 31 jours ? | 7 | 6 | 5 | 8
Combien de secondes compte une heure ? | 3 600 | 360 | 6 000 | 1 200
Combien de pièces y a-t-il sur un échiquier au début d'une partie ? | 32 | 16 | 24 | 36
Combien de cartes contient un jeu classique, sans jokers ? | 52 | 54 | 32 | 48
Quelle lettre n'apparaît dans le nom d'aucun État américain ? | Q | Z | X | J
Quelle est la devise de la République française ? | Liberté, Égalité, Fraternité | Unité, Travail, Progrès | Paix et Justice | Dieu et mon droit
Comment s'appelle l'hymne national français ? | La Marseillaise | Le Chant du départ | L'Internationale | Ça ira
Quel réseau social à l'oiseau bleu a été renommé X ? | Twitter | Bluesky | Threads | Tumblr
Quelle entreprise fabrique l'iPhone ? | Apple | Samsung | Google | Huawei
En quelle année est sorti le premier iPhone ? | 2007 | 2005 | 2009 | 2010
Combien de minutes compte une journée ? | 1 440 | 1 240 | 2 400 | 3 600
Quel est le signe astrologique des personnes nées le 1er janvier ? | Capricorne | Verseau | Sagittaire | Poissons
Combien d'heures de décalage y a-t-il entre Paris et New York ? | 6 heures | 3 heures | 9 heures | 12 heures
Quel objet célèbre a-t-on volé au Louvre en 1911 ? | La Joconde | La Vénus de Milo | Le Radeau de la Méduse | La Victoire de Samothrace
Quel est le nombre d'or approximativement ? | 1,618 | 3,14 | 2,718 | 1,414
Combien de côtés a un hexagone ? | 6 | 5 | 7 | 8
Quel est le résultat de 7 × 8 ? | 56 | 54 | 64 | 48
Combien de grammes pèse un kilo de plumes ? | 1 000 | 100 | 10 | 10 000
De quelle couleur est le maillot du meilleur sprinteur du Tour de France ? | Vert | Jaune | À pois rouges | Blanc
Quel symbole utilise-t-on pour le « hashtag » ? | # | @ | & | %
Combien de joueurs s'affrontent au morpion ? | 2 | 3 | 4 | 1

# Jeux vidéo et Internet
Comment s'appelle le plombier moustachu de Nintendo ? | Mario | Luigi | Wario | Toad
Comment s'appelle le frère de Mario ? | Luigi | Wario | Yoshi | Toad
Quel Pokémon est la mascotte de la série ? | Pikachu | Évoli | Rondoudou | Salamèche
Comment s'appelle le héros de « The Legend of Zelda » ? | Link | Zelda | Ganon | Epona
Dans quel jeu construit-on avec des blocs en évitant les creepers ? | Minecraft | Roblox | Terraria | Fortnite
Dans quel jeu fait-on tomber des formes pour compléter des lignes ? | Tetris | Pac-Man | Candy Crush | Snake
Quel personnage jaune mange des pac-gommes ? | Pac-Man | Kirby | Pikachu | Bob l'éponge
Comment s'appelle le hérisson bleu de SEGA ? | Sonic | Tails | Knuckles | Shadow
Quelle plateforme de streaming a pour logo un N rouge ? | Netflix | Disney+ | Prime Video | Canal+
Quel réseau social est connu pour ses vidéos verticales et ses danses ? | TikTok | LinkedIn | Pinterest | Reddit
Quel youtubeur organise la course de voitures GP Explorer ? | Squeezie | Cyprien | Norman | Michou
Quelle console Nintendo sortie en 2017 se joue sur la télé et en portable ? | La Switch | La Wii U | La 3DS | La GameCube
Quel jeu de battle royale a popularisé les danses des personnages ? | Fortnite | PUBG | Apex Legends | Warzone
Dans « Among Us », comment appelle-t-on le traître ? | L'imposteur | Le traître | Le loup-garou | L'espion
Combien de Pokémon comptait la toute première génération ? | 151 | 150 | 100 | 251
Dans « Bob l'éponge », comment s'appelle l'étoile de mer ? | Patrick | Carlo | Sandy | Plankton
Dans quel restaurant travaille Bob l'éponge ? | Le Crabe Croustillant | Le Poisson Pané | Le Homard Doré | La Moule Frite
Quel jeu de société consiste à acheter des rues et construire des hôtels ? | Le Monopoly | Le Cluedo | La Bonne Paye | Le Risk
Que doit-on découvrir au Cluedo ? | Le coupable, l'arme et le lieu | Un trésor caché | Un mot secret | Une carte volée
Quelle saga de jeux vidéo met en scène Lara Croft ? | Tomb Raider | Uncharted | Resident Evil | Assassin's Creed
Dans quel jeu vit-on sur une île avec Tom Nook ? | Animal Crossing | Stardew Valley | Les Sims | Harvest Moon
Quel est le jeu vidéo le plus vendu de tous les temps ? | Minecraft | GTA V | Tetris | Mario Kart 8
Dans quel jeu dit-on « Sul sul » pour dire bonjour ? | Les Sims | Animal Crossing | Spore | SimCity
Quelle princesse Mario doit-il souvent sauver ? | Peach | Daisy | Zelda | Rosalina
Quel est l'ennemi juré de Mario ? | Bowser | Wario | Ganon | Eggman
Dans « Mario Kart », quelle carapace vise le premier de la course ? | La bleue | La rouge | La verte | La dorée
Dans quel jeu de cartes crie-t-on quand il ne reste qu'une carte ? | Le Uno | La belote | Le président | La bataille
Quel jeu mobile de 2016 faisait chasser des Pokémon dans la rue ? | Pokémon GO | Pokémon Snap | Pokémon Unite | Pokémon Café
Quelle entreprise a créé la PlayStation ? | Sony | Microsoft | Nintendo | Sega
Quelle entreprise a créé la Xbox ? | Microsoft | Sony | Nintendo | Apple
Dans quel jeu Ubisoft voit-on des Lapins Crétins pour la première fois ? | Rayman | Just Dance | Assassin's Creed | Far Cry
Dans « Fortnite », comment s'appelle l'autocar volant qui largue les joueurs ? | Le bus de combat | Le dirigeable | Le planeur | La navette
Que signifie « GG » dans un jeu en ligne ? | Good game | Go go | Gros gagnant | Game garanti
Quel site de vidéos a été racheté par Google en 2006 ? | YouTube | Dailymotion | Vimeo | Twitch
Sur quelle plateforme les streamers jouent-ils en direct avec un logo violet ? | Twitch | Kick | YouTube | Discord

# Années 2000 et 2010
Quelle émission de 2001 a révélé Jenifer, première gagnante ? | Star Academy | Loft Story | Nouvelle Star | The Voice
Qui chante « Toxic » en 2004 ? | Britney Spears | Christina Aguilera | Avril Lavigne | Shakira
Quelle marque fabriquait le 3310, réputé indestructible ? | Nokia | Motorola | Sony Ericsson | Samsung
Quel réseau social Mark Zuckerberg a-t-il lancé en 2004 ? | Facebook | MySpace | Twitter | Instagram
Combien d'espionnes compte « Totally Spies » ? | 3 | 2 | 4 | 5
Quelle série de jeux de danse d'Ubisoft est sortie en 2009 ? | Just Dance | Dance Dance Revolution | SingStar | Guitar Hero
Quelle messagerie de Microsoft faisait fureur dans les années 2000 ? | MSN Messenger | Skype | ICQ | AIM
Quel animal virtuel japonais fallait-il nourrir et soigner ? | Le Tamagotchi | Le Furby | Le Nintendogs | Le Giga Pets
Quel jeu de cartes à collectionner suit le duelliste Yugi ? | Yu-Gi-Oh! | Pokémon | Magic | Dragon Ball
Sur quelle plateforme les ados français tenaient-ils leur blog dans les années 2000 ? | Skyblog | Tumblr | Blogger | WordPress
Qui joue Hannah Montana ? | Miley Cyrus | Selena Gomez | Demi Lovato | Hilary Duff
Quel tube d'O-Zone a fait danser l'Europe en 2004 ? | Dragostea din tei | Aserejé | Mambo No. 5 | Macarena
Quelle chanteuse a sorti « Umbrella » en 2007 ? | Rihanna | Beyoncé | Nelly Furtado | Fergie
Quelle série des années 2000 suit des lycéens qui chantent dans une chorale ? | Glee | High School Musical | Fame | Riverdale
Quel film musical de Disney Channel suit Troy et Gabriella ? | High School Musical | Camp Rock | Hannah Montana | Lemonade Mouth
Quelle chanson de PSY a été la première vidéo à dépasser un milliard de vues ? | Gangnam Style | Gentleman | Daddy | Hangover
Quel « challenge » de 2014 consistait à se verser un seau d'eau glacée sur la tête ? | Ice Bucket Challenge | Harlem Shake | Mannequin Challenge | Cinnamon Challenge
Quel jeu de 2009 faisait lancer des oiseaux sur des cochons ? | Angry Birds | Flappy Bird | Fruit Ninja | Cut the Rope
Quel jeu mobile de 2013 faisait passer un oiseau entre des tuyaux ? | Flappy Bird | Angry Birds | Doodle Jump | Temple Run
Quel jouet de 2017 se faisait tourner entre les doigts ? | Le hand spinner | Le Rubik's cube | Le yoyo | La toupie Beyblade
Quelle émission de M6 a lancé la mode des candidats qui chantent devant un jury en 2003 ? | Nouvelle Star | The Voice | X Factor | Popstars
Quel film de 2009 détient le record du box-office mondial ? | Avatar | Titanic | Avengers: Endgame | Star Wars : Le Réveil de la Force
Quelle téléréalité envoyait Paris Hilton et Nicole Richie vivre à la ferme ? | The Simple Life | Laguna Beach | The Hills | Jersey Shore
Quel célèbre baladeur numérique Apple a lancé en 2001 ? | L'iPod | Le Walkman | Le Zune | L'iPhone
Quelle danse virale consistait à rester figé comme un mannequin ? | Le Mannequin Challenge | Le Dab | Le Floss | Le Harlem Shake
Quel mouvement de danse consiste à cacher son visage dans son coude ? | Le dab | Le floss | Le twerk | Le moonwalk
`;

export interface Question {
  category: string;
  text: string;
  answer: string;
  wrong: [string, string, string];
}

function parse(bank: string): Question[] {
  const questions: Question[] = [];
  let category = '';
  for (const raw of bank.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('# ')) {
      category = line.slice(2);
      continue;
    }
    const parts = line.split('|').map((part) => part.trim().replace(/'/g, '’'));
    if (parts.length !== 5) throw new Error(`Malformed question: ${line}`);
    questions.push({ category, text: parts[0], answer: parts[1], wrong: [parts[2], parts[3], parts[4]] });
  }
  return questions;
}

export const QUESTIONS: Question[] = parse(BANK);
