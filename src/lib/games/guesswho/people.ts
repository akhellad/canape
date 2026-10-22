export type Hair = 'chauve' | 'court' | 'long' | 'bouclé' | 'chignon' | 'couettes' | 'crête' | 'afro';
export type HairColor = 'brun' | 'blond' | 'roux' | 'noir' | 'blanc' | 'rose' | 'bleu';
export type Hat = 'aucun' | 'casquette' | 'bonnet' | 'béret' | 'chapeau';
export type Facial = 'aucune' | 'moustache' | 'barbe';
export type Shirt = 'rose' | 'bleu' | 'vert' | 'jaune' | 'orange' | 'violet' | 'rouge' | 'noir';

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
  freckles: boolean;
}

/** Suspects on the board each game, drawn from the whole cast. */
export const BOARD_SIZE = 24;

type Row = [string, Person['skin'], Hair, HairColor, 0 | 1, Hat, Facial, 0 | 1, Shirt, 0 | 1];

const ROWS: Row[] = [
  ['Alice', 0, 'long', 'blond', 0, 'aucun', 'aucune', 1, 'rose', 0],
  ['Bruno', 2, 'chauve', 'brun', 1, 'aucun', 'barbe', 0, 'bleu', 0],
  ['Chloé', 1, 'bouclé', 'roux', 0, 'aucun', 'aucune', 1, 'vert', 1],
  ['David', 0, 'court', 'noir', 0, 'casquette', 'moustache', 0, 'jaune', 0],
  ['Emma', 3, 'chignon', 'noir', 1, 'aucun', 'aucune', 0, 'orange', 0],
  ['Farid', 2, 'court', 'noir', 0, 'aucun', 'barbe', 0, 'vert', 0],
  ['Gaby', 1, 'long', 'brun', 0, 'béret', 'aucune', 1, 'violet', 0],
  ['Hugo', 0, 'bouclé', 'blond', 1, 'aucun', 'aucune', 0, 'rouge', 1],
  ['Inès', 3, 'long', 'noir', 0, 'bonnet', 'aucune', 1, 'jaune', 0],
  ['Jules', 1, 'court', 'roux', 0, 'aucun', 'moustache', 0, 'bleu', 1],
  ['Karim', 3, 'chauve', 'noir', 0, 'casquette', 'barbe', 0, 'orange', 0],
  ['Léon', 0, 'court', 'blanc', 1, 'béret', 'moustache', 0, 'vert', 0],
  ['Manon', 0, 'chignon', 'roux', 0, 'aucun', 'aucune', 1, 'bleu', 1],
  ['Nina', 2, 'bouclé', 'brun', 1, 'aucun', 'aucune', 1, 'rose', 0],
  ['Oscar', 1, 'court', 'blond', 0, 'bonnet', 'aucune', 0, 'violet', 0],
  ['Paul', 0, 'chauve', 'blanc', 1, 'aucun', 'moustache', 0, 'jaune', 0],
  ['Rose', 1, 'long', 'blanc', 1, 'aucun', 'aucune', 1, 'rouge', 0],
  ['Sami', 2, 'bouclé', 'noir', 0, 'casquette', 'aucune', 0, 'jaune', 0],
  ['Théo', 0, 'court', 'brun', 0, 'aucun', 'aucune', 0, 'rose', 1],
  ['Lina', 3, 'bouclé', 'noir', 0, 'béret', 'aucune', 1, 'vert', 0],
  ['Yasmine', 2, 'long', 'brun', 1, 'aucun', 'aucune', 0, 'bleu', 0],
  ['Zoé', 0, 'long', 'roux', 0, 'casquette', 'aucune', 0, 'orange', 1],
  ['Marius', 1, 'court', 'brun', 1, 'bonnet', 'barbe', 0, 'rouge', 0],
  ['Jade', 1, 'chignon', 'blond', 0, 'aucun', 'aucune', 1, 'violet', 0],
  ['Adèle', 0, 'couettes', 'blond', 0, 'aucun', 'aucune', 0, 'jaune', 1],
  ['Bilal', 3, 'afro', 'noir', 0, 'aucun', 'barbe', 0, 'violet', 0],
  ['Capucine', 1, 'couettes', 'rose', 1, 'aucun', 'aucune', 1, 'noir', 0],
  ['Diego', 2, 'crête', 'bleu', 0, 'aucun', 'aucune', 1, 'noir', 0],
  ['Elsa', 0, 'long', 'bleu', 0, 'aucun', 'aucune', 1, 'violet', 0],
  ['Fatou', 3, 'afro', 'noir', 1, 'aucun', 'aucune', 1, 'jaune', 0],
  ['Gaston', 0, 'chauve', 'blanc', 0, 'chapeau', 'moustache', 0, 'noir', 0],
  ['Hélène', 1, 'chignon', 'blanc', 1, 'chapeau', 'aucune', 1, 'rose', 0],
  ['Ilyes', 2, 'crête', 'noir', 0, 'aucun', 'barbe', 0, 'rouge', 0],
  ['Juliette', 0, 'bouclé', 'rose', 0, 'aucun', 'aucune', 0, 'bleu', 1],
  ['Kenzo', 1, 'court', 'bleu', 1, 'aucun', 'aucune', 0, 'orange', 0],
  ['Louise', 2, 'couettes', 'brun', 0, 'béret', 'aucune', 0, 'rouge', 0],
  ['Malik', 3, 'court', 'noir', 1, 'chapeau', 'barbe', 0, 'vert', 0],
  ['Noé', 0, 'crête', 'roux', 0, 'aucun', 'aucune', 0, 'vert', 1],
  ['Olga', 0, 'long', 'blond', 1, 'chapeau', 'aucune', 0, 'noir', 0],
  ['Pierre', 1, 'bouclé', 'blanc', 0, 'aucun', 'barbe', 0, 'orange', 0],
  ['Quentin', 0, 'court', 'roux', 1, 'casquette', 'barbe', 0, 'noir', 1],
  ['Rania', 2, 'afro', 'rose', 0, 'aucun', 'aucune', 1, 'vert', 0],
  ['Simon', 1, 'chauve', 'brun', 0, 'bonnet', 'moustache', 0, 'rose', 0],
  ['Tatiana', 0, 'couettes', 'roux', 0, 'aucun', 'aucune', 1, 'orange', 1],
  ['Ulysse', 2, 'afro', 'brun', 1, 'aucun', 'moustache', 0, 'bleu', 0],
  ['Victor', 3, 'court', 'blanc', 0, 'aucun', 'moustache', 1, 'violet', 0],
  ['Wendy', 1, 'long', 'rose', 1, 'bonnet', 'aucune', 1, 'jaune', 0],
  ['Xavier', 0, 'crête', 'blond', 1, 'aucun', 'moustache', 0, 'bleu', 0],
];

export const PEOPLE: Person[] = ROWS.map(([name, skin, hair, hairColor, glasses, hat, facial, earrings, shirt, freckles]) => ({
  name,
  skin,
  hair,
  hairColor,
  glasses: glasses === 1,
  hat,
  facial,
  earrings: earrings === 1,
  shirt,
  freckles: freckles === 1,
}));

/** Plain-language description, to help the player answer questions honestly. */
export function describe(person: Person): string[] {
  const lines: string[] = [];
  const color = person.hairColor === 'roux' ? 'roux' : `${person.hairColor}s`;
  const style =
    { chignon: 'en chignon', couettes: 'en couettes', crête: 'en crête', afro: 'afro' }[person.hair as string] ?? `${person.hair}s`;
  lines.push(person.hair === 'chauve' ? 'Chauve' : `Cheveux ${style}, ${color}`);
  lines.push(person.glasses ? 'Porte des lunettes' : 'Pas de lunettes');
  lines.push(person.hat === 'aucun' ? 'Rien sur la tête' : `Porte un${person.hat === 'casquette' ? 'e' : ''} ${person.hat}`);
  if (person.facial !== 'aucune') lines.push(person.facial === 'barbe' ? 'A une barbe' : 'A une moustache');
  lines.push(person.earrings ? 'Porte des boucles d’oreilles' : 'Pas de boucles d’oreilles');
  lines.push(person.freckles ? 'A des taches de rousseur' : 'Pas de taches de rousseur');
  lines.push(`Haut ${person.shirt}`);
  return lines;
}
