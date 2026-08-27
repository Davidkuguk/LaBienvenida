import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type AnimalStatus = 'available' | 'reserved' | 'adopted' | 'medical';
type RequestStatus = 'new' | 'contacted' | 'visit' | 'approved' | 'closed';

interface AdoptionRequest { id: string; animalId: string; animalName: string; name: string; email: string; phone: string; message: string; status: RequestStatus; createdAt: string; }

interface ShelterAnimal {
  id: string;
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
  exercise: 'Medio',
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
  protected readonly activeSection = signal<'new' | 'inventory' | 'requests'>('new');
  /*
  protected readonly legacyAnimals = signal<ShelterAnimal[]>([
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
  */
  protected readonly animals = signal<ShelterAnimal[]>([]);

  protected readonly form = signal<AnimalForm>({ ...initialForm });
  protected readonly editingId = signal<string | null>(null);
  protected readonly animalsLoading = signal(true);
  protected readonly saveError = signal('');
  protected readonly saving = signal(false);
  protected readonly showValidation = signal(false);
  protected readonly statusFilter = signal<AnimalStatus | 'all'>('all');
  protected readonly speciesFilter = signal('all');
  protected readonly sexFilter = signal<ShelterAnimal['sex'] | 'all'>('all');
  protected readonly sizeFilter = signal<ShelterAnimal['size'] | 'all'>('all');
  protected readonly arrivalFilter = signal<'all' | '30' | '90' | 'older'>('all');
  protected readonly sortBy = signal<'recent' | 'oldest' | 'status'>('recent');
  protected readonly searchTerm = signal('');
  protected readonly sidebarCollapsed = signal(false);
  protected readonly visitorCount = signal<number | null>(null);
  protected readonly visitorCountLoading = signal(true);
  protected readonly visitorCountUnavailable = signal(false);
  protected readonly requests = signal<AdoptionRequest[]>([]);
  protected readonly requestsLoading = signal(true);

  protected readonly filteredAnimals = computed(() => {
    const status = this.statusFilter();
    const search = this.searchTerm().trim().toLowerCase();

    const threshold = Date.now() - Number(this.arrivalFilter()) * 24 * 60 * 60 * 1000;
    const filtered = this.animals().filter((animal) => {
      const matchesStatus = status === 'all' || animal.status === status;
      const matchesSpecies = this.speciesFilter() === 'all' || animal.species === this.speciesFilter();
      const matchesSex = this.sexFilter() === 'all' || animal.sex === this.sexFilter();
      const matchesSize = this.sizeFilter() === 'all' || animal.size === this.sizeFilter();
      const arrival = new Date(`${animal.arrivalDate}T00:00:00`).getTime();
      const matchesArrival = this.arrivalFilter() === 'all' || (this.arrivalFilter() === 'older' ? arrival < Date.now() - 90 * 24 * 60 * 60 * 1000 : arrival >= threshold);
      const matchesSearch =
        !search ||
        [animal.name, animal.species, animal.breed, animal.exercise, animal.idealHome]
          .join(' ')
          .toLowerCase()
          .includes(search);

      return matchesStatus && matchesSpecies && matchesSex && matchesSize && matchesArrival && matchesSearch;
    });
    return filtered.sort((left, right) => {
      if (this.sortBy() === 'status') return this.statusLabel(left.status).localeCompare(this.statusLabel(right.status));
      const difference = new Date(right.arrivalDate).getTime() - new Date(left.arrivalDate).getTime();
      return this.sortBy() === 'recent' ? difference : -difference;
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
    void this.loadAnimals();
    void this.loadRequests();
  }

  private async loadRequests(): Promise<void> {
    try {
      const response = await fetch('/.netlify/functions/requests', { headers: { Accept: 'application/json' }, credentials: 'same-origin' });
      const data = (await response.json()) as { requests?: AdoptionRequest[] };
      if (response.ok && Array.isArray(data.requests)) this.requests.set(data.requests);
    } catch {
      // Las solicitudes solo están disponibles cuando se ejecuta mediante Netlify.
    } finally { this.requestsLoading.set(false); }
  }

  protected async updateRequestStatus(request: AdoptionRequest, status: RequestStatus): Promise<void> {
    const response = await fetch('/.netlify/functions/requests', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ id: request.id, status }) });
    const data = (await response.json().catch(() => null)) as { requests?: AdoptionRequest[] } | null;
    if (response.ok && Array.isArray(data?.requests)) this.requests.set(data.requests);
  }

  protected requestStatusLabel(status: RequestStatus): string {
    return { new: 'Nueva', contacted: 'Contactada', visit: 'Visita', approved: 'Aprobada', closed: 'Cerrada' }[status];
  }

  private async loadAnimals(): Promise<void> {
    try {
      const response = await fetch('/.netlify/functions/animals', {
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
      });
      if (!response.ok) throw new Error('No se pudo cargar');
      const data = (await response.json()) as { animals?: ShelterAnimal[] };
      if (!Array.isArray(data.animals)) throw new Error('Respuesta no válida');
      this.animals.set(data.animals);
    } catch {
      this.saveError.set('No se pudieron cargar los animales. Vuelve a intentarlo.');
    } finally {
      this.animalsLoading.set(false);
    }
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

  protected showSection(section: 'new' | 'inventory' | 'requests'): void {
    this.activeSection.set(section);
  }

  protected async saveAnimal(): Promise<void> {
    const form = this.form();

    if (!form.name.trim() || !form.breed.trim() || !form.description.trim() || form.age === null) {
      this.showValidation.set(true);
      const missing = [
        !form.name.trim() && 'nombre',
        !form.breed.trim() && 'raza',
        form.age === null && 'edad',
        !form.description.trim() && 'frase de presentación',
      ].filter(Boolean);
      this.saveError.set(`Completa los campos obligatorios: ${missing.join(', ')}.`);
      return;
    }

    const animal: ShelterAnimal = {
      id: this.editingId() ?? this.createId(form.name),
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
      exercise: this.exerciseLabel(form.exercise),
      idealHome: form.idealHome.trim(),
      medicalStatus: form.medicalStatus.trim(),
      medicalDetail: form.medicalDetail.trim(),
      compatibleAdults: form.compatibleAdults.trim(),
      compatibleChildren: form.compatibleChildren.trim(),
      compatibleDogs: form.compatibleDogs.trim(),
      compatibleCats: form.compatibleCats.trim(),
    };

    this.saving.set(true);
    this.saveError.set('');
    try {
      const response = await fetch('/.netlify/functions/animals', {
        method: this.editingId() ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(animal),
      });
      const data = (await response.json().catch(() => null)) as
        | { animals?: ShelterAnimal[]; error?: string }
        | null;
      if (!response.ok || !Array.isArray(data?.animals)) {
        throw new Error(data?.error || 'No se pudo guardar');
      }
      this.animals.set(data.animals);
      this.resetForm();
    } catch (error) {
      this.saveError.set(error instanceof Error ? error.message : 'No se pudo guardar el animal.');
    } finally {
      this.saving.set(false);
    }
  }

  protected editAnimal(animal: ShelterAnimal): void {
    this.showSection('new');
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
      exercise: this.exerciseLabel(animal.exercise),
      idealHome: animal.idealHome,
      medicalStatus: animal.medicalStatus,
      medicalDetail: animal.medicalDetail,
      compatibleAdults: animal.compatibleAdults,
      compatibleChildren: animal.compatibleChildren,
      compatibleDogs: animal.compatibleDogs,
      compatibleCats: animal.compatibleCats,
    });
  }

  protected async removeAnimal(id: string): Promise<void> {
    if (!confirm('¿Seguro que quieres eliminar este animal de la web?')) return;
    this.saveError.set('');
    try {
      const response = await fetch(`/.netlify/functions/animals?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
      });
      const data = (await response.json().catch(() => null)) as
        | { animals?: ShelterAnimal[]; error?: string }
        | null;
      if (!response.ok || !Array.isArray(data?.animals)) {
        throw new Error(data?.error || 'No se pudo eliminar');
      }
      this.animals.set(data.animals);
      if (this.editingId() === id) this.resetForm();
    } catch (error) {
      this.saveError.set(error instanceof Error ? error.message : 'No se pudo eliminar el animal.');
    }
  }

  private createId(name: string): string {
    const slug = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return this.animals().some((animal) => animal.id === slug) ? `${slug}-${Date.now()}` : slug;
  }

  protected resetForm(): void {
    this.editingId.set(null);
    this.showValidation.set(false);
    this.saveError.set('');
    this.form.set({ ...initialForm, arrivalDate: new Date().toISOString().slice(0, 10) });
  }

  protected addPhotos(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []).filter((file) => file.type.startsWith('image/'));

    if (!files.length) {
      return;
    }

    Promise.all(files.map((file) => this.compressPhoto(file))).then((photos) => {
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

  protected makePrimaryPhoto(index: number): void {
    this.movePhoto(index, 0);
  }

  protected movePhoto(index: number, destination: number): void {
    this.form.update((current) => {
      const photos = [...current.photos];
      const [photo] = photos.splice(index, 1);
      photos.splice(destination, 0, photo);
      return { ...current, photos };
    });
  }

  private compressPhoto(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const image = new Image();
        image.onload = () => {
          const scale = Math.min(1, 1600 / Math.max(image.width, image.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(image.width * scale);
          canvas.height = Math.round(image.height * scale);
          canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/webp', 0.82));
        };
        image.onerror = () => reject(new Error('No se pudo procesar la imagen.'));
        image.src = String(reader.result);
      };
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

  protected exerciseLabel(value: string): string {
    const level = value.split('·')[0].trim().toLowerCase();
    if (level.includes('alto')) return 'Alto';
    if (level.includes('bajo')) return 'Bajo';
    return 'Medio';
  }
}
