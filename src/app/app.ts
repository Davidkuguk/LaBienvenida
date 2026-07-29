import { Component, computed, signal } from '@angular/core';
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

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  constructor() {
    if (typeof window === 'undefined') {
      return;
    }

    const publicPages: Record<string, string> = {
      '/': '/protectora-la-bienvenida-netlify/index.html',
      '/adopta': '/protectora-la-bienvenida-netlify/adopta.html',
      '/nosotros': '/protectora-la-bienvenida-netlify/nosotros.html',
      '/como-ayudar': '/protectora-la-bienvenida-netlify/ayuda.html',
      '/contacto': '/protectora-la-bienvenida-netlify/contacto.html',
      '/animal': '/protectora-la-bienvenida-netlify/animal.html',
    };
    const publicPage = publicPages[window.location.pathname.replace(/\/+$/, '') || '/'];

    if (publicPage) {
      window.location.replace(`${publicPage}${window.location.search}${window.location.hash}`);
    }
  }

  protected readonly animals = signal<ShelterAnimal[]>([
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
  ]);

  protected readonly form = signal<AnimalForm>({ ...initialForm });
  protected readonly editingId = signal<number | null>(null);
  protected readonly statusFilter = signal<AnimalStatus | 'all'>('all');
  protected readonly searchTerm = signal('');
  protected readonly sidebarCollapsed = signal(false);

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
    this.form.update((current) => ({ ...current, [field]: value }));
  }

  protected toggleSidebar(): void {
    this.sidebarCollapsed.update((collapsed) => !collapsed);
  }

  protected saveAnimal(): void {
    const form = this.form();

    if (!form.name.trim() || !form.breed.trim() || !form.description.trim() || form.age === null) {
      return;
    }

    const animal: ShelterAnimal = {
      id: this.editingId() ?? Date.now(),
      name: form.name.trim(),
      photos: form.photos,
      species: form.species.trim(),
      breed: form.breed.trim(),
      age: form.age,
      sex: form.sex,
      size: form.size,
      status: form.status,
      arrivalDate: form.arrivalDate,
      location: form.location.trim(),
      description: form.description.trim(),
      notes: form.notes.trim(),
    };

    if (this.editingId()) {
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
    this.form.set({
      name: animal.name,
      photos: animal.photos,
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
    this.animals.update((animals) => animals.filter((animal) => animal.id !== id));

    if (this.editingId() === id) {
      this.resetForm();
    }
  }

  protected resetForm(): void {
    this.editingId.set(null);
    this.form.set({ ...initialForm, arrivalDate: new Date().toISOString().slice(0, 10) });
  }

  protected addPhotos(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []).filter((file) => file.type.startsWith('image/'));

    if (!files.length) {
      return;
    }

    Promise.all(files.map((file) => this.readFileAsDataUrl(file))).then((photos) => {
      this.form.update((current) => ({ ...current, photos: [...current.photos, ...photos] }));
      input.value = '';
    });
  }

  protected removePhoto(index: number): void {
    this.form.update((current) => ({
      ...current,
      photos: current.photos.filter((_, photoIndex) => photoIndex !== index),
    }));
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
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
}
