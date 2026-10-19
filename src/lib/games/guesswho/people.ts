export type Hair = 'chauve' | 'court' | 'long' | 'bouclé' | 'chignon';
export type HairColor = 'brun' | 'blond' | 'roux' | 'noir' | 'blanc';
export type Hat = 'aucun' | 'casquette' | 'bonnet' | 'béret';
export type Facial = 'aucune' | 'moustache' | 'barbe';
export type Shirt = 'rose' | 'bleu' | 'vert' | 'jaune' | 'orange' | 'violet' | 'rouge';

export interface Person {
  name: string;
  skin: 0 | 1 | 2 | 3;
  hair: Hair;
  hairColor: HairColor;
  glasses: boolean;
  hat: Hat;
  facial: Facial;
  earrings: boolean;
  shirt: Shirt;
}

type Row = [string, Person['skin'], Hair, HairColor, 0 | 1, Hat, Facial, 0 | 1, Shirt];

const ROWS: Row[] = [
  ['Alice', 0, 'long', 'blond', 0, 'aucun', 'aucune', 1, 'rose'],
  ['Bruno', 2, 'chauve', 'brun', 1, 'aucun', 'barbe', 0, 'bleu'],
  ['Chloé', 1, 'bouclé', 'roux', 0, 'aucun', 'aucune', 1, 'vert'],
  ['David', 0, 'court', 'noir', 0, 'casquette', 'moustache', 0, 'jaune'],
  ['Emma', 3, 'chignon', 'noir', 1, 'aucun', 'aucune', 0, 'orange'],
  ['Farid', 2, 'court', 'noir', 0, 'aucun', 'barbe', 0, 'vert'],
  ['Gaby', 1, 'long', 'brun', 0, 'béret', 'aucune', 1, 'violet'],
  ['Hugo', 0, 'bouclé', 'blond', 1, 'aucun', 'aucune', 0, 'rouge'],
  ['Inès', 3, 'long', 'noir', 0, 'bonnet', 'aucune', 1, 'jaune'],
  ['Jules', 1, 'court', 'roux', 0, 'aucun', 'moustache', 0, 'bleu'],
  ['Karim', 3, 'chauve', 'noir', 0, 'casquette', 'barbe', 0, 'orange'],
  ['Léon', 0, 'court', 'blanc', 1, 'béret', 'moustache', 0, 'vert'],
  ['Manon', 0, 'chignon', 'roux', 0, 'aucun', 'aucune', 1, 'bleu'],
  ['Nina', 2, 'bouclé', 'brun', 1, 'aucun', 'aucune', 1, 'rose'],
  ['Oscar', 1, 'court', 'blond', 0, 'bonnet', 'aucune', 0, 'violet'],
  ['Paul', 0, 'chauve', 'blanc', 1, 'aucun', 'moustache', 0, 'jaune'],
  ['Rose', 1, 'long', 'blanc', 1, 'aucun', 'aucune', 1, 'rouge'],
  ['Sami', 2, 'bouclé', 'noir', 0, 'casquette', 'aucune', 0, 'jaune'],
  ['Théo', 0, 'court', 'brun', 0, 'aucun', 'aucune', 0, 'rose'],
  ['Lina', 3, 'bouclé', 'noir', 0, 'béret', 'aucune', 1, 'vert'],
  ['Yasmine', 2, 'long', 'brun', 1, 'aucun', 'aucune', 0, 'bleu'],
  ['Zoé', 0, 'long', 'roux', 0, 'casquette', 'aucune', 0, 'orange'],
  ['Marius', 1, 'court', 'brun', 1, 'bonnet', 'barbe', 0, 'rouge'],
  ['Jade', 1, 'chignon', 'blond', 0, 'aucun', 'aucune', 1, 'violet'],
];

export const PEOPLE: Person[] = ROWS.map(([name, skin, hair, hairColor, glasses, hat, facial, earrings, shirt]) => ({
  name,
  skin,
  hair,
  hairColor,
  glasses: glasses === 1,
  hat,
  facial,
  earrings: earrings === 1,
  shirt,
}));

/** Plain-language description, to help the player answer questions honestly. */
export function describe(person: Person): string[] {
  const lines: string[] = [];
  const color = person.hairColor === 'roux' ? 'roux' : `${person.hairColor}s`;
  const style = person.hair === 'chignon' ? 'en chignon' : `${person.hair}s`;
  lines.push(person.hair === 'chauve' ? 'Chauve' : `Cheveux ${style}, ${color}`);
  lines.push(person.glasses ? 'Porte des lunettes' : 'Pas de lunettes');
  lines.push(person.hat === 'aucun' ? 'Pas de chapeau' : `Porte un${person.hat === 'casquette' ? 'e' : ''} ${person.hat}`);
  if (person.facial !== 'aucune') lines.push(person.facial === 'barbe' ? 'A une barbe' : 'A une moustache');
  lines.push(person.earrings ? 'Porte des boucles d’oreilles' : 'Pas de boucles d’oreilles');
  lines.push(`Haut ${person.shirt}`);
  return lines;
}
