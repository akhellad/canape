# Les meme dans le canapé

Des jeux de société à deux, affichés sur la télé et joués avec vos téléphones comme manettes.
La télé ouvre le site, chaque téléphone scanne le QR code, et c’est parti : aucune installation, aucun compte.

## Les jeux

| Jeu                | Type      | Principe                                                                                      |
| ------------------ | --------- | --------------------------------------------------------------------------------------------- |
| **Kif-Kif**        | Duel      | Trouver le symbole commun entre sa carte et celle du milieu, plus vite que l’autre.           |
| **Agents doubles** | En équipe | Faire deviner ses 15 agents à l’autre avec des indices d’un mot, sans tomber sur un assassin. |
| **Gribouille**     | En équipe | L’un dessine sur son téléphone, l’autre devine, avec des contraintes farfelues.               |
| **Puissance 4**    | Duel      | Aligner quatre jetons.                                                                        |
| **Touché-coulé**   | Duel      | Placer sa flotte en secret et couler celle de l’autre.                                        |

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

Pour tester sur un seul ordinateur sans réseau, ouvrez la télé avec `?transport=local`, puis les téléphones dans d’autres onglets avec `?room=CODE&transport=local`.

## Publication

Chaque modification poussée sur `main` ou `beta` est vérifiée (types, tests unitaires, tests de bout en bout) puis publiée par GitHub Actions sur GitHub Pages :

- `main` : https://akhellad.github.io/canape/
- `beta` : https://akhellad.github.io/canape/beta/

## Crédits

- Symboles des jeux : [Fluent Emoji](https://github.com/microsoft/fluentui-emoji) de Microsoft, licence MIT, extraits avec `npm run icons`.
- Icônes d’interface : [Lucide](https://lucide.dev), licence ISC.
- Polices : Chewy et Nunito, licence SIL Open Font License.
- Personnages et logo inspirés du tableau du salon.
