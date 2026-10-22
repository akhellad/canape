export interface RareWord {
  word: string;
  /** Grammatical nature, shown with the word to help everyone write a believable definition. */
  nature: string;
  definition: string;
}

const RAW = `
Abscons|adjectif|Difficile à comprendre, obscur.
Acrimonie|nom féminin|Mauvaise humeur qui s'exprime par des propos amers et blessants.
Alacrité|nom féminin|Vivacité joyeuse, entrain.
Amphigouri|nom masculin|Discours ou écrit embrouillé, incompréhensible.
Apophtegme|nom masculin|Parole mémorable, maxime brève et frappante.
Atrabilaire|adjectif|D'humeur sombre et irritable.
Barguigner|verbe|Hésiter avant de se décider, surtout dans « sans barguigner ».
Batifoler|verbe|S'amuser de façon légère et folâtre, flirter.
Bécoter|verbe|Donner de petits baisers.
Billevesée|nom féminin|Idée creuse, propos sans fondement.
Bisbille|nom féminin|Petite querelle pour un motif futile.
Brimborion|nom masculin|Petit objet sans valeur, babiole.
Cacochyme|adjectif|De santé fragile, souffreteux.
Calembredaine|nom féminin|Propos extravagant, sornette.
Callipyge|adjectif|Qui a de belles fesses.
Capilotade|nom féminin|Dans « en capilotade » : en morceaux, en piteux état.
Carabistouille|nom féminin|Bêtise, sornette, dans le parler belge.
Chafouin|adjectif|Qui a une mine sournoise et rusée.
Clampin|nom masculin|Personne paresseuse, qui traîne.
Concupiscence|nom féminin|Désir ardent des plaisirs, en particulier sensuels.
Coquebin|nom masculin|Jeune homme niais et naïf.
Coquecigrue|nom féminin|Chose absurde, baliverne.
Coruscant|adjectif|Qui brille d'un vif éclat.
Croquignolet|adjectif|Mignon, charmant, avec une pointe de ridicule.
Dégingandé|adjectif|Grand et maladroit dans ses mouvements.
Déliquescence|nom féminin|Décadence, état de ce qui se défait peu à peu.
Désuétude|nom féminin|Abandon d'un usage devenu démodé.
Dithyrambique|adjectif|D'un éloge enthousiaste jusqu'à l'excès.
Échauguette|nom féminin|Petite tourelle de guet accrochée en surplomb d'une muraille.
Émoustiller|verbe|Mettre de bonne humeur, exciter légèrement.
Énamouré|adjectif|Épris, plein d'amour.
Épistolaire|adjectif|Qui se rapporte à la correspondance par lettres.
Épithalame|nom masculin|Poème composé pour célébrer un mariage.
Esbroufe|nom féminin|Manières prétentieuses pour en imposer aux autres.
Faconde|nom féminin|Grande facilité à parler, abondance de paroles.
Fadaise|nom féminin|Niaiserie, propos insignifiant.
Fanfreluche|nom féminin|Petit ornement léger d'une toilette, d'un vêtement.
Faquin|nom masculin|Homme méprisable et impertinent.
Faribole|nom féminin|Propos frivole, sans importance.
Flagorneur|nom masculin|Personne qui flatte bassement pour plaire.
Gabegie|nom féminin|Désordre et gaspillage dus à une mauvaise gestion.
Galimatias|nom masculin|Discours confus et incompréhensible.
Gaudriole|nom féminin|Plaisanterie un peu leste.
Godiche|adjectif|Gauche, maladroit et un peu niais.
Goguenard|adjectif|Moqueur, narquois.
Grandiloquent|adjectif|Qui s'exprime avec une emphase pompeuse.
Hâbleur|nom masculin|Personne qui aime se vanter et exagérer.
Hurluberlu|nom masculin|Personne farfelue qui agit sans réfléchir.
Hyménée|nom masculin|Mariage, dans la langue poétique.
Hypocoristique|adjectif|Qui exprime une intention affectueuse, comme « mon chou » ou « ma puce ».
Inextinguible|adjectif|Qu'on ne peut éteindre ni calmer, comme un fou rire.
Jean-foutre|nom masculin|Homme incapable, sur qui on ne peut pas compter.
Jérémiade|nom féminin|Plainte qui n'en finit pas, lamentation.
Lambiner|verbe|Agir avec lenteur, traîner.
Lanterner|verbe|Faire attendre quelqu'un en le leurrant de promesses.
Lénifiant|adjectif|Qui apaise, qui calme en adoucissant.
Logorrhée|nom féminin|Flot de paroles excessif et désordonné.
Lutiner|verbe|Taquiner quelqu'un de façon galante et espiègle.
Mamours|nom masculin pluriel|Caresses, démonstrations de tendresse.
Margoulin|nom masculin|Commerçant ou homme d'affaires peu scrupuleux.
Marivaudage|nom masculin|Badinage galant et raffiné.
Matutinal|adjectif|Qui se rapporte au matin.
Minauder|verbe|Prendre des airs affectés pour plaire.
Mirliflore|nom masculin|Jeune homme élégant et content de lui.
Mitonner|verbe|Faire cuire longtemps à petit feu ; préparer avec soin.
Nitescence|nom féminin|Clarté, lueur brillante.
Nonobstant|préposition|Malgré, en dépit de.
Nycthémère|nom masculin|Durée de vingt-quatre heures, comprenant un jour et une nuit.
Obombrer|verbe|Couvrir d'ombre.
Obséquieux|adjectif|Poli et empressé jusqu'à la servilité.
Olibrius|nom masculin|Personnage excentrique, original.
Palinodie|nom féminin|Changement complet d'opinion, revirement.
Paltoquet|nom masculin|Homme insignifiant et prétentieux.
Panégyrique|nom masculin|Discours à la louange de quelqu'un.
Pantagruélique|adjectif|Énorme, digne d'un ogre, en parlant d'un repas.
Parangon|nom masculin|Modèle parfait, comme dans « parangon de vertu ».
Pataquès|nom masculin|Faute de liaison à l'oral ; par extension, gaffe, imbroglio.
Pécore|nom féminin|Femme sotte et prétentieuse.
Pénates|nom masculin pluriel|Le foyer, la maison, comme dans « regagner ses pénates ».
Pérorer|verbe|Discourir longuement et avec emphase.
Pétrichor|nom masculin|Odeur de la terre après la pluie.
Philistin|nom masculin|Personne fermée aux arts et aux lettres.
Philtre|nom masculin|Breuvage magique censé faire naître l'amour.
Pignouf|nom masculin|Individu mal élevé, rustre.
Pimbêche|nom féminin|Femme prétentieuse et désagréable.
Pleutre|adjectif|Lâche, sans courage.
Prébende|nom féminin|Revenu attaché à une situation, souvent obtenu sans effort.
Prolégomènes|nom masculin pluriel|Longue introduction, notions préliminaires.
Psittacisme|nom masculin|Répétition machinale de mots qu'on ne comprend pas.
Pusillanime|adjectif|Qui manque d'audace, craintif.
Quolibet|nom masculin|Plaisanterie moqueuse lancée à quelqu'un.
Rabibocher|verbe|Réconcilier des personnes fâchées.
Ratiociner|verbe|Raisonner de façon pointilleuse et interminable.
Ripaille|nom féminin|Repas copieux et joyeux, comme dans « faire ripaille ».
Rocambolesque|adjectif|Plein de péripéties extraordinaires et invraisemblables.
Rodomontade|nom féminin|Vantardise, fanfaronnade.
Roucouler|verbe|Pour un pigeon : chanter ; pour des amoureux : se dire des mots tendres.
Sagouin|nom masculin|Personne malpropre ou qui travaille salement.
Saugrenu|adjectif|Bizarre et un peu ridicule.
Sémillant|adjectif|D'une vivacité gaie et séduisante.
Sérendipité|nom féminin|Fait de trouver par hasard ce qu'on ne cherchait pas.
Sigisbée|nom masculin|Chevalier servant qui accompagne une dame.
Sinécure|nom féminin|Emploi bien payé qui ne demande presque aucun travail.
Subrepticement|adverbe|En cachette, de façon furtive.
Superfétatoire|adjectif|Qui s'ajoute inutilement, superflu.
Sycophante|nom masculin|Délateur, dénonciateur hypocrite.
Tarabiscoté|adjectif|Exagérément compliqué, surchargé d'ornements.
Tergiverser|verbe|Hésiter, user de détours pour retarder une décision.
Tintamarre|nom masculin|Grand bruit discordant.
Tohu-bohu|nom masculin|Désordre bruyant, agitation confuse.
Tourneboulé|adjectif|Bouleversé, l'esprit tout retourné.
Trublion|nom masculin|Personne qui sème le trouble, agitateur.
Turlupiner|verbe|Tracasser, préoccuper sans relâche.
Turpitude|nom féminin|Action honteuse, ignominie.
Ultracrépidarianisme|nom masculin|Fait de donner son avis sur des sujets qu'on ne connaît pas.
Vaticiner|verbe|Prédire l'avenir avec emphase, comme un oracle.
Velléitaire|adjectif|Qui a des intentions mais ne passe jamais à l'acte.
Vespéral|adjectif|Qui se rapporte au soir.
Vétille|nom féminin|Chose sans importance, bagatelle.
Vilipender|verbe|Traiter avec mépris, dénigrer publiquement.
Zéphyr|nom masculin|Vent doux et léger.
Zinzinuler|verbe|Chanter, en parlant de la mésange.
`;

export const RARE_WORDS: RareWord[] = RAW.trim()
  .split('\n')
  .map((line) => {
    const [word, nature, definition] = line.split('|');
    return { word, nature, definition };
  });
