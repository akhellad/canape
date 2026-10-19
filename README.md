# Les meme dans le canapé

Des jeux de société à deux, affichés sur la télé et joués avec vos téléphones comme manettes.
La télé ouvre le site, chaque téléphone scanne le QR code, et c’est parti : aucune installation, aucun compte.

## Les jeux

| Jeu                    | Type      | Principe                                                                                                 |
| ---------------------- | --------- | -------------------------------------------------------------------------------------------------------- |
| **Gribouille**         | En équipe | L’un dessine sur son téléphone, l’autre devine. Plus de 1 100 mots, du plus facile au plus dur.          |
| **Quiz**               | Duel      | Dix questions de culture générale, avec un bonus de rapidité. Près de 500 questions.                     |
| **Qui de nous deux ?** | En équipe | Chacun répond en secret à « Qui de nous deux… ? » ou « Tu préfères… ? ». Un point si d’accord.           |
| **Mots interdits**     | En équipe | Faire deviner un maximum de mots à l’oral en une minute, sans dire les mots interdits.                   |
| **Petit Bac**          | Duel      | Une lettre, six catégories : chacun écrit sur son téléphone, et on peut refuser les réponses de l’autre. |
| **Qui est-ce ?**       | Duel      | Chacun a un suspect secret parmi 24 ; questions à l’oral, élimination sur le téléphone.                  |
| **Code secret**        | Duel      | Façon Mastermind : chacun cache un code de couleurs et casse celui de l’autre.                           |
| **Touché-coulé**       | Duel      | Placer sa flotte en secret et couler celle de l’autre.                                                   |
| **Puissance 4**        | Duel      | Aligner quatre jetons.                                                                                   |
| **Reversi**            | Duel      | Encadrer les pions de l’autre pour les retourner.                                                        |
| **Yams**               | Duel      | Cinq dés, trois lancers par tour, une grille de treize cases à remplir.                                  |
| **Memory**             | Duel      | Retrouver les paires parmi 24 cartes retournées sur la télé.                                             |

Les jeux de mots et de questions piochent dans de grosses listes. La télé retient ce qui est déjà sorti, d’une partie à l’autre, pour ne pas retomber sur les mêmes avant d’avoir presque tout vu.

## Fonctionnement

- La télé héberge la partie : elle tient l’état du jeu et l’affiche.
- Les téléphones se connectent directement à la télé en WebRTC (PeerJS). Le serveur public PeerJS ne sert qu’à les mettre en relation.
- Un téléphone qui se met en veille se reconnecte tout seul et retrouve sa place. La partie se met en pause en attendant.
- Chaque écran de téléphone ignore les appuis pendant un court instant après être apparu, pour éviter les appuis fantômes.

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
