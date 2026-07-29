import { Component, computed, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type AnimalStatus = 'available' | 'reserved' | 'adopted' | 'medical';

interface ShelterAnimal {
  id: number;
  name: string;
  photos: string[];
  species: string;
  breed: string;
  age: number;
  sex: 'Hembra' | 'Macho';
  size: 'Pequeno' | 'Mediano' | 'Grande';
  status: AnimalStatus;
  arrivalDate: string;
  location: string;
  description: string;
  notes: string;
}

interface AnimalForm {
  name: string;
  photos: string[];
  species: string;
  breed: string;
  age: number | null;
  sex: ShelterAnimal['sex'];
  size: ShelterAnimal['size'];
  status: AnimalStatus;
  arrivalDate: string;
  location: string;
  description: string;
  notes: string;
}

const storageKey = 'la-bienvenida-animals';
const maximumPhotoSize = 3 * 1024 * 1024;
const maximumPhotos = 6;

const initialForm: AnimalForm = {
  name: '',
  photos: [],
  species: 'Perro',
  breed: '',
  age: null,
  sex: 'Hembra',
  size: 'Mediano',
  status: 'available',
  arrivalDate: new Date().toISOString().slice(0, 10),
  location: 'Refugio principal',
  description: '',
  notes: '',
};

const initialAnimals: ShelterAnimal[] = [
  {
    id: 1,
    name: 'Luna',
    photos: [],
    species: 'Perro',
    breed: 'Mestiza',
    age: 3,
    sex: 'Hembra',
    size: 'Mediano',
    status: 'available',
    arrivalDate: '2026-04-12',
    location: 'Casa de acogida',
    description: 'Carinosa, tranquila y sociable con otros perros.',
    notes: 'Vacunada y esterilizada.',
  },
  {
    id: 2,
    name: 'Milo',
    photos: [],
    species: 'Gato',
    breed: 'Europeo comun',
    age: 1,
    sex: 'Macho',
    size: 'Pequeno',
    status: 'reserved',
    arrivalDate: '2026-05-03',
    location: 'Gatera 2',
    description: 'Jugueton, curioso y muy cercano con personas.',
    notes: 'Pendiente de visita preadopcion.',
  },
  {
    id: 3,
    name: 'Nala',
    photos: [],
    species: 'Perro',
    breed: 'Podenca',
    age: 5,
    sex: 'Hembra',
    size: 'Grande',
    status: 'medical',
    arrivalDate: '2026-03-20',
    location: 'Veterinario',
    description: 'Dulce y algo timida al principio.',
    notes: 'Tratamiento de piel en seguimiento.',
  },
];

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly animals = signal<ShelterAnimal[]>(this.loadAnimals());
  protected readonly form = signal<AnimalForm>({ ...initialForm });
  protected readonly editingId = signal<number | null>(null);
  protected readonly statusFilter = signal<AnimalStatus | 'all'>('all');
  protected readonly searchTerm = signal('');
  protected readonly sidebarCollapsed = signal(false);
  protected readonly formError = signal('');

  constructor() {
    effect(() => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(storageKey, JSON.stringify(this.animals()));
      }
    });
  }

  protected readonly filteredAnimals = computed(() => {
    const status = this.statusFilter();
    const search = this.searchTerm().trim().toLowerCase();

    return this.animals().filter((animal) => {
      const matchesStatus = status === 'all' || animal.status === status;
      const matchesSearch =
        !search ||
        [animal.name, animal.species, animal.breed, animal.location]
          .join(' ')
          .toLowerCase()
          .includes(search);

      return matchesStatus && matchesSearch;
    });
  });

  protected readonly availableCount = computed(
    () => this.animals().filter((animal) => animal.status === 'available').length,
  );
  protected readonly reservedCount = computed(
    () => this.animals().filter((animal) => animal.status === 'reserved').length,
  );
  protected readonly medicalCount = computed(
    () => this.animals().filter((animal) => animal.status === 'medical').length,
  );

  protected updateForm<K extends keyof AnimalForm>(field: K, value: AnimalForm[K]): void {
    this.formError.set('');
    this.form.update((current) => ({ ...current, [field]: value }));
  }

  protected toggleSidebar(): void {
    this.sidebarCollapsed.update((collapsed) => !collapsed);
  }

  protected saveAnimal(): void {
    const form = this.form();
    const age = Number(form.age);

    if (!form.name.trim() || !form.breed.trim() || !form.description.trim()) {
      this.formError.set('Completa el nombre, la raza y la descripcion.');
      return;
    }

    if (!Number.isInteger(age) || age < 0 || age > 40) {
      this.formError.set('La edad debe ser un numero entero entre 0 y 40.');
      return;
    }

    const animal: ShelterAnimal = {
      id: this.editingId() ?? Date.now(),
      name: form.name.trim(),
      photos: [...form.photos],
      species: form.species.trim(),
      breed: form.breed.trim(),
      age,
      sex: form.sex,
      size: form.size,
      status: form.status,
      arrivalDate: form.arrivalDate,
      location: form.location.trim(),
      description: form.description.trim(),
      notes: form.notes.trim(),
    };

    if (this.editingId() !== null) {
      this.animals.update((animals) =>
        animals.map((currentAnimal) => (currentAnimal.id === animal.id ? animal : currentAnimal)),
      );
    } else {
      this.animals.update((animals) => [animal, ...animals]);
    }

    this.resetForm();
  }

  protected editAnimal(animal: ShelterAnimal): void {
    this.editingId.set(animal.id);
    this.formError.set('');
    this.form.set({
      name: animal.name,
      photos: [...animal.photos],
      species: animal.species,
      breed: animal.breed,
      age: animal.age,
      sex: animal.sex,
      size: animal.size,
      status: animal.status,
      arrivalDate: animal.arrivalDate,
      location: animal.location,
      description: animal.description,
      notes: animal.notes,
    });
  }

  protected removeAnimal(id: number): void {
    if (typeof window !== 'undefined' && !window.confirm('¿Seguro que quieres eliminar esta ficha?')) {
      return;
    }

    this.animals.update((animals) => animals.filter((animal) => animal.id !== id));

    if (this.editingId() === id) {
      this.resetForm();
    }
  }

  protected resetForm(): void {
    this.editingId.set(null);
    this.formError.set('');
    this.form.set({ ...initialForm, photos: [], arrivalDate: new Date().toISOString().slice(0, 10) });
  }

  protected async addPhotos(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const selectedFiles = Array.from(input.files ?? []);
    const imageFiles = selectedFiles.filter((file) => file.type.startsWith('image/'));
    const availableSlots = maximumPhotos - this.form().photos.length;

    if (!imageFiles.length) {
      this.formError.set('Selecciona archivos de imagen validos.');
      input.value = '';
      return;
    }

    if (availableSlots <= 0) {
      this.formError.set(`Puedes guardar un maximo de ${maximumPhotos} fotos.`);
      input.value = '';
      return;
    }

    const validFiles = imageFiles
      .filter((file) => file.size <= maximumPhotoSize)
      .slice(0, availableSlots);

    if (validFiles.length !== imageFiles.length) {
      this.formError.set('Algunas fotos se omitieron por superar 3 MB o el limite permitido.');
    }

    if (!validFiles.length) {
      input.value = '';
      return;
    }

    try {
      const photos = await Promise.all(validFiles.map((file) => this.readFileAsDataUrl(file)));
      this.form.update((current) => ({ ...current, photos: [...current.photos, ...photos] }));
    } catch {
      this.formError.set('No se pudieron procesar una o varias fotos.');
    } finally {
      input.value = '';
    }
  }

  protected removePhoto(index: number): void {
    this.form.update((current) => ({
      ...current,
      photos: current.photos.filter((_, photoIndex) => photoIndex !== index),
    }));
  }

  protected statusLabel(status: AnimalStatus): string {
    const labels: Record<AnimalStatus, string> = {
      available: 'Disponible',
      reserved: 'Reservado',
      adopted: 'Adoptado',
      medical: 'En cuidados',
    };

    return labels[status];
  }

  private loadAnimals(): ShelterAnimal[] {
    if (typeof localStorage === 'undefined') {
      return initialAnimals;
    }

    try {
      const savedAnimals = localStorage.getItem(storageKey);
      if (!savedAnimals) {
        return initialAnimals;
      }

      const parsed = JSON.parse(savedAnimals);
      return Array.isArray(parsed) ? parsed : initialAnimals;
    } catch {
      return initialAnimals;
    }
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }
}
