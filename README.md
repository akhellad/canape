# Les meme dans le canapé

Des jeux de société à deux, affichés sur la télé et joués avec vos téléphones comme manettes.
La télé ouvre le site, chaque téléphone scanne le QR code, et c’est parti : aucune installation, aucun compte.

## Les jeux

| Jeu                        | Type      | Principe                                                                                                        |
| -------------------------- | --------- | --------------------------------------------------------------------------------------------------------------- |
| **Gribouille**             | En équipe | L’un dessine (pinceau, gomme, pot de peinture), l’autre devine. Plus de 1 100 mots. Manches et temps réglables. |
| **Dessin téléphone**       | En équipe | Chacun dessine dans son carnet, l’autre devine, et le mot se transforme. On feuillette à la fin.                |
| **Quiz**                   | Duel      | Culture générale, avec un bonus pour le premier qui trouve. Près de 500 questions.                              |
| **Qui de nous deux ?**     | En équipe | Chacun répond en secret à « Qui de nous deux… ? » ou « Tu préfères… ? ». Un point si d’accord.                  |
| **Même longueur d’onde**   | En équipe | L’un voit une cible sur un cadran et donne un indice, l’autre place l’aiguille.                                 |
| **Nos souvenirs**          | En équipe | Une question sur votre histoire : chacun écrit sa version, puis on compare.                                     |
| **Mots doux**              | En équipe | Une phrase à compléter pour l’autre ; tous les mots doux réunis à la fin.                                       |
| **Je te connais par cœur** | Duel      | L’un répond à une question sur lui, l’autre doit deviner ; le premier juge.                                     |
| **Mots croisés**           | En équipe | Une grille générée à chaque partie ; chacun a ses définitions, il faut se parler.                               |
| **Petit Bac**              | Duel      | Une lettre, vos catégories : chacun écrit sur son téléphone, et on peut refuser les réponses de l’autre.        |
| **Le menteur**             | Duel      | Un mot rare : chacun invente une définition, puis il faut trouver la vraie.                                     |
| **Qui est-ce ?**           | Duel      | Chacun a un suspect secret parmi 24, tirés d’une galerie de 48 ; questions à l’oral.                            |
| **Touché-coulé**           | Duel      | Couler la flotte de l’autre, avec bombe, torpille et sonar à usage unique.                                      |
| **Puissance 4**            | Duel      | Aligner quatre jetons.                                                                                          |

Les jeux de mots et de questions piochent dans de grosses listes. La télé retient ce qui est déjà sorti, d’une partie à l’autre, pour ne pas retomber sur les mêmes avant d’avoir presque tout vu.

## Fonctionnement

- La télé héberge la partie : elle tient l’état du jeu et l’affiche.
- Les téléphones se connectent directement à la télé en WebRTC (PeerJS). Le serveur public PeerJS ne sert qu’à les mettre en relation.
- Un téléphone qui se met en veille se reconnecte tout seul et retrouve sa place. La partie se met en pause en attendant.
- Chaque écran de téléphone ignore les appuis pendant un court instant après être apparu, pour éviter les appuis fantômes.
- Les réglages d’un jeu (manches, temps, catégories…) se choisissent sur l’écran des règles, depuis n’importe quel téléphone. La télé s’en souvient pour la fois suivante.
- Dans les jeux à dessins ou à réponses écrites, on passe à la suite quand l’un des joueurs appuie sur le bouton, pour avoir le temps d’en parler.

## Développement

```bash
npm install
npm run dev          # serveur local
npm run check        # vérification des types
npm test             # tests unitaires (logique des jeux, salon, connexion)
npm run test:e2e     # parties complètes simulées : une télé et deux téléphones tactiles
npm run lint         # vérification du formatage
```

Pour tester sur un seul ordinateur sans réseau, ouvrez la télé avec `?transport=local`, puis les téléphones dans d’autres onglets avec `?room=CODE&transport=local`. En mode développement, le bouton « + joueur de test » en bas à droite de la télé ouvre directement une fenêtre de joueur (un clic par joueur).

## Publication

Chaque modification poussée sur `main` ou `beta` est vérifiée (types, tests unitaires, tests de bout en bout) puis publiée par GitHub Actions sur GitHub Pages :

- `main` : https://akhellad.github.io/canape/
- `beta` : https://akhellad.github.io/canape/beta/

## Crédits

- Quelques symboles de Touché-coulé : [Fluent Emoji](https://github.com/microsoft/fluentui-emoji) de Microsoft, licence MIT, extraits avec `npm run icons`.
- Icônes d’interface : [Lucide](https://lucide.dev), licence ISC.
- Polices : Shrikhand et Bricolage Grotesque, licence SIL Open Font License.
- Personnages et logo inspirés du tableau du salon.
