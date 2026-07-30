import { Component, computed, OnInit, signal } from '@angular/core';
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
  weight: string;
  status: AnimalStatus;
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
}

interface AnimalForm {
  name: string;
  photos: string[];
  species: string;
  breed: string;
  age: number | null;
  sex: ShelterAnimal['sex'];
  size: ShelterAnimal['size'];
  weight: string;
  status: AnimalStatus;
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
}

const initialForm: AnimalForm = {
  name: '',
  photos: [],
  species: 'Perro',
  breed: '',
  age: null,
  sex: 'Hembra',
  size: 'Mediano',
  weight: '',
  status: 'available',
  arrivalDate: new Date().toISOString().slice(0, 10),
  description: '',
  notes: '',
  exercise: '',
  idealHome: '',
  medicalStatus: 'Sin enfermedades diagnosticadas',
  medicalDetail: '',
  compatibleAdults: 'Sí',
  compatibleChildren: 'Por valorar',
  compatibleDogs: 'Por valorar',
  compatibleCats: 'Por valorar',
};

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
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
      weight: '18 kg',
      status: 'available',
      arrivalDate: '2026-04-12',
      description: 'Carinosa, tranquila y sociable con otros perros.',
      notes: 'Vacunada y esterilizada.',
      exercise: 'Moderado · 60 minutos al día',
      idealHome: 'Un hogar tranquilo con rutinas estables.',
      medicalStatus: 'Sin enfermedades diagnosticadas',
      medicalDetail: 'Vacunada, chipada y esterilizada.',
      compatibleAdults: 'Sí',
      compatibleChildren: 'Mayores de 8',
      compatibleDogs: 'Sí',
      compatibleCats: 'Por valorar',
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
      weight: '5 kg',
      status: 'reserved',
      arrivalDate: '2026-05-03',
      description: 'Jugueton, curioso y muy cercano con personas.',
      notes: 'Pendiente de visita preadopcion.',
      exercise: 'Moderado · 45 minutos de juego al día',
      idealHome: 'Una casa estimulante donde forme parte de la familia.',
      medicalStatus: 'Sin enfermedades diagnosticadas',
      medicalDetail: 'Vacunado y esterilizado.',
      compatibleAdults: 'Sí',
      compatibleChildren: 'Sí',
      compatibleDogs: 'Con adaptación',
      compatibleCats: 'Sí',
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
      weight: '24 kg',
      status: 'medical',
      arrivalDate: '2026-03-20',
      description: 'Dulce y algo timida al principio.',
      notes: 'Tratamiento de piel en seguimiento.',
      exercise: 'Bajo-moderado · 45 minutos al día',
      idealHome: 'Una familia paciente que respete su adaptación.',
      medicalStatus: 'Tratamiento dermatológico',
      medicalDetail: 'Revisión veterinaria y tratamiento en seguimiento.',
      compatibleAdults: 'Sí',
      compatibleChildren: 'Mayores de 12',
      compatibleDogs: 'Presentación previa',
      compatibleCats: 'Por valorar',
    },
  ]);

  protected readonly form = signal<AnimalForm>({ ...initialForm });
  protected readonly editingId = signal<number | null>(null);
  protected readonly statusFilter = signal<AnimalStatus | 'all'>('all');
  protected readonly searchTerm = signal('');
  protected readonly sidebarCollapsed = signal(false);
  protected readonly visitorCount = signal<number | null>(null);
  protected readonly visitorCountLoading = signal(true);
  protected readonly visitorCountUnavailable = signal(false);

  protected readonly filteredAnimals = computed(() => {
    const status = this.statusFilter();
    const search = this.searchTerm().trim().toLowerCase();

    return this.animals().filter((animal) => {
      const matchesStatus = status === 'all' || animal.status === status;
      const matchesSearch =
        !search ||
        [animal.name, animal.species, animal.breed, animal.exercise, animal.idealHome]
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

  ngOnInit(): void {
    this.loadVisitorCount();
  }

  protected visitorCountLabel(): string {
    const count = this.visitorCount();
    return count === null ? '—' : new Intl.NumberFormat('es-ES').format(count);
  }

  private async loadVisitorCount(): Promise<void> {
    try {
      const response = await fetch('/.netlify/functions/visitors', {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`No se pudo cargar el contador (${response.status})`);
      }

      const data = (await response.json()) as { visitors?: number };
      if (!Number.isInteger(data.visitors) || (data.visitors ?? -1) < 0) {
        throw new Error('Respuesta no válida del contador');
      }

      this.visitorCount.set(data.visitors ?? 0);
    } catch {
      this.visitorCountUnavailable.set(true);
    } finally {
      this.visitorCountLoading.set(false);
    }
  }

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
      weight: form.weight.trim(),
      status: form.status,
      arrivalDate: form.arrivalDate,
      description: form.description.trim(),
      notes: form.notes.trim(),
      exercise: form.exercise.trim(),
      idealHome: form.idealHome.trim(),
      medicalStatus: form.medicalStatus.trim(),
      medicalDetail: form.medicalDetail.trim(),
      compatibleAdults: form.compatibleAdults.trim(),
      compatibleChildren: form.compatibleChildren.trim(),
      compatibleDogs: form.compatibleDogs.trim(),
      compatibleCats: form.compatibleCats.trim(),
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
      weight: animal.weight,
      status: animal.status,
      arrivalDate: animal.arrivalDate,
      description: animal.description,
      notes: animal.notes,
      exercise: animal.exercise,
      idealHome: animal.idealHome,
      medicalStatus: animal.medicalStatus,
      medicalDetail: animal.medicalDetail,
      compatibleAdults: animal.compatibleAdults,
      compatibleChildren: animal.compatibleChildren,
      compatibleDogs: animal.compatibleDogs,
      compatibleCats: animal.compatibleCats,
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
