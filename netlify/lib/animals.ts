export type AnimalStatus = 'available' | 'reserved' | 'adopted' | 'medical';

export interface AnimalRecord {
  id: string;
  name: string;
  photos: string[];
  photoFocusX?: number;
  photoFocusY?: number;
  species: string;
  breed: string;
  age: number;
  sex: 'Hembra' | 'Macho';
  size: 'Pequeno' | 'Mediano' | 'Grande';
  weight: string;
  status: AnimalStatus;
  urgent: boolean;
  arrivalDate: string;
  description: string;
  notes: string;
  exercise: string;
  idealHome: string;
  medicalStatus: string;
  medicalDetail: string;
  compatibleAdults: string;
  compatibleChildren: string;
  compatibleDogs: string;
  compatibleCats: string;
  deletedAt?: string;
}

const images = [
  'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1600&q=90',
  'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=1600&q=90',
  'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=1600&q=90',
  'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=1600&q=90',
  'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?auto=format&fit=crop&w=1600&q=90',
  'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=1600&q=90',
  'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=1600&q=90',
  'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=1600&q=90',
  'https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=1600&q=90',
];

const basics = [
  ['milo', 'Milo', 'Perro', 'Mestizo', 3, 'Macho', 'Mediano', '21 kg', 'Una mirada tranquila y un corazón enorme.', 'Moderado · 60 minutos al día'],
  ['luna', 'Luna', 'Gato', 'Europeo común', 2, 'Hembra', 'Pequeno', '4 kg', 'Curiosa, elegante y tranquila.', 'Bajo · 30 minutos de juego al día'],
  ['bruno', 'Bruno', 'Perro', 'Mestizo', 8, 'Macho', 'Pequeno', '9 kg', 'Sereno, educado y afectuoso.', 'Bajo · paseos cortos'],
  ['nala', 'Nala', 'Gato', 'Europeo común', 1, 'Hembra', 'Pequeno', '3,5 kg', 'Joven, tímida y muy dulce.', 'Moderado · juego diario'],
  ['roco', 'Roco', 'Perro', 'Mestizo', 5, 'Macho', 'Grande', '32 kg', 'Noble, estable y cercano.', 'Alto · paseos largos'],
  ['simba', 'Simba', 'Gato', 'Europeo común', 3, 'Macho', 'Pequeno', '5 kg', 'Sociable, curioso y juguetón.', 'Moderado · juego diario'],
  ['kira', 'Kira', 'Perro', 'Mestiza', 4, 'Hembra', 'Mediano', '18 kg', 'Activa, inteligente y cariñosa.', 'Alto · 90 minutos al día'],
  ['coco', 'Coco', 'Gato', 'Europeo común', 6, 'Macho', 'Pequeno', '5,5 kg', 'Mimoso, tranquilo y confiado.', 'Bajo · juego suave'],
  ['duna', 'Duna', 'Perro', 'Mestiza', 2, 'Hembra', 'Mediano', '19 kg', 'Joven, alegre y entusiasta.', 'Medio-alto · 75 minutos al día'],
] as const;

export const initialAnimals: AnimalRecord[] = basics.map((animal, index) => ({
  id: animal[0],
  name: animal[1],
  species: animal[2],
  breed: animal[3],
  age: animal[4],
  sex: animal[5],
  size: animal[6],
  weight: animal[7],
  description: animal[8],
  exercise: animal[9],
  photos: [images[index]],
  photoFocusX: 50,
  photoFocusY: 50,
  status: 'available',
  urgent: false,
  arrivalDate: '2026-01-01',
  notes: `${animal[1]} busca una familia responsable que le ofrezca tiempo, cariño y estabilidad.`,
  idealHome: 'Un hogar responsable con rutinas estables y mucho cariño.',
  medicalStatus: 'Sin enfermedades diagnosticadas',
  medicalDetail: 'Revisión veterinaria, vacunación y desparasitación al día.',
  compatibleAdults: 'Sí',
  compatibleChildren: 'Por valorar',
  compatibleDogs: 'Por valorar',
  compatibleCats: 'Por valorar',
}));
