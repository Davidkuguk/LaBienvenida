import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type AnimalStatus = 'available' | 'reserved' | 'adopted' | 'medical';
type RequestStatus = 'new' | 'contacted' | 'visit' | 'approved' | 'closed';
type FosterStatus = 'pending' | 'active' | 'finished';

interface AdoptionRequest { id: string; animalId: string; animalName: string; name: string; email: string; phone: string; message: string; status: RequestStatus; createdAt: string; }
interface Foster { id: string; animalId: string; animalName: string; carerName: string; phone: string; email: string; address: string; startDate: string; endDate: string; status: FosterStatus; notes: string; }

interface ShelterAnimal {
  id: string;
  name: string;
  photos: string[];
  photoFocusX?: number;
  photoFocusY?: number;
  species: string;
  breed: string;
  age: number;
  ageUnit?: 'years' | 'months';
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
}

interface AnimalForm {
  name: string;
  photos: string[];
  photoFocusX: number;
  photoFocusY: number;
  species: string;
  breed: string;
  age: number | null;
  ageMonths: number;
  sex: ShelterAnimal['sex'];
  size: ShelterAnimal['size'];
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
}

const initialForm: AnimalForm = {
  name: '',
  photos: [],
  photoFocusX: 50,
  photoFocusY: 50,
  species: 'Perro',
  breed: '',
  age: null,
  ageMonths: 0,
  sex: 'Hembra',
  size: 'Mediano',
  weight: '',
  status: 'available',
  urgent: false,
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
  protected readonly activeSection = signal<'new' | 'inventory' | 'requests' | 'fosters'>('new');
  protected readonly fosters = signal<Foster[]>([]);
  protected readonly fosterForm = signal<Omit<Foster, 'id'>>({ animalId: '', animalName: '', carerName: '', phone: '', email: '', address: '', startDate: new Date().toISOString().slice(0, 10), endDate: '', status: 'pending', notes: '' });
  protected readonly editingFosterId = signal<string | null>(null);
  protected readonly selectedFoster = signal<Foster | null>(null);
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
  protected readonly expandedAnimalId = signal<string | null>(null);
  protected readonly animalsLoading = signal(true);
  protected readonly saveError = signal('');
  protected readonly saving = signal(false);
  protected readonly optimizingPhotos = signal(false);
  protected readonly showValidation = signal(false);
  protected readonly pendingDeletion = signal<{ animal: ShelterAnimal; index: number; timer: ReturnType<typeof setTimeout> } | null>(null);
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
  protected readonly requestAnimalFilter = signal('all');

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
        [animal.name, animal.species, animal.breed, animal.exercise, animal.notes, animal.medicalStatus]
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

  protected readonly filteredRequests = computed(() => {
    const animalId = this.requestAnimalFilter();
    return this.requests().filter((request) => animalId === 'all' || request.animalId === animalId);
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
    void this.loadFosters();
  }


  private async loadFosters(): Promise<void> {
    try { const response = await fetch('/.netlify/functions/fosters', { credentials: 'same-origin' }); const data = await response.json() as { fosters?: Foster[] }; if (response.ok && Array.isArray(data.fosters)) this.fosters.set(data.fosters); } catch { /* Solo disponible en Netlify. */ }
  }

  protected updateFoster<K extends keyof Omit<Foster, 'id'>>(field: K, value: Omit<Foster, 'id'>[K]): void { this.fosterForm.update((current) => ({ ...current, [field]: value })); }

  protected async saveFoster(): Promise<void> {
    const form = this.fosterForm();
    const animal = this.animals().find((item) => item.id === form.animalId);
    const id = this.editingFosterId();
    const response = await fetch('/.netlify/functions/fosters', { method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ ...form, ...(id ? { id } : {}), animalName: animal?.name || form.animalName }) });
    const data = await response.json().catch(() => null) as { fosters?: Foster[] } | null;
    if (response.ok && Array.isArray(data?.fosters)) { this.fosters.set(data.fosters); this.editingFosterId.set(null); this.fosterForm.set({ animalId: '', animalName: '', carerName: '', phone: '', email: '', address: '', startDate: new Date().toISOString().slice(0, 10), endDate: '', status: 'pending', notes: '' }); }
  }

  protected openFoster(foster: Foster): void { this.selectedFoster.set(foster); }
  protected editFoster(foster: Foster): void { this.editingFosterId.set(foster.id); this.fosterForm.set({ ...foster }); }
  protected async deleteFoster(foster: Foster): Promise<void> { if (!confirm(`¿Eliminar la acogida de ${foster.animalName}?`)) return; const response = await fetch(`/.netlify/functions/fosters?id=${encodeURIComponent(foster.id)}`, { method: 'DELETE', credentials: 'same-origin' }); const data = await response.json().catch(() => null) as { fosters?: Foster[] } | null; if (response.ok && Array.isArray(data?.fosters)) { this.fosters.set(data.fosters); if (this.selectedFoster()?.id === foster.id) this.selectedFoster.set(null); } }

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

  protected requestDate(createdAt: string): string {
    return new Date(createdAt).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' });
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

  protected showSection(section: 'new' | 'inventory' | 'requests' | 'fosters'): void {
    this.activeSection.set(section);
  }

  protected async saveAnimal(): Promise<void> {
    if (this.optimizingPhotos() || this.saving()) return;
    const form = this.form();

    if (!form.name.trim() || !form.breed.trim() || !form.notes.trim() || form.age === null) {
      this.showValidation.set(true);
      const missing = [
        !form.name.trim() && 'nombre',
        !form.breed.trim() && 'raza',
        form.age === null && 'edad',
        !form.notes.trim() && 'historia',
      ].filter(Boolean);
      this.saveError.set(`Completa los campos obligatorios: ${missing.join(', ')}.`);
      return;
    }

    if (!Number.isInteger(form.age) || form.age < 0 || !Number.isInteger(form.ageMonths) || form.ageMonths < 0 || form.ageMonths > 11) {
      this.saveError.set('Indica los años y los meses con números enteros: años desde 0 y meses entre 0 y 11.');
      return;
    }

    const animal: ShelterAnimal = {
      id: this.editingId() ?? this.createId(form.name),
      name: form.name.trim(),
      photos: form.photos,
      photoFocusX: form.photoFocusX,
      photoFocusY: form.photoFocusY,
      species: ['Perro', 'Gato'].includes(form.species) ? form.species : 'Otro',
      breed: form.breed.trim(),
      age: form.age * 12 + form.ageMonths,
      ageUnit: 'months',
      sex: form.sex,
      size: form.size,
      weight: form.weight.trim(),
      status: form.status,
      urgent: form.urgent,
      arrivalDate: form.arrivalDate,
      description: this.storySummary(form.notes),
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
      photoFocusX: animal.photoFocusX ?? 50,
      photoFocusY: animal.photoFocusY ?? 50,
      species: ['Perro', 'Gato'].includes(animal.species) ? animal.species : 'Otro',
      breed: animal.breed,
      age: Math.floor(animal.ageUnit === 'months' ? animal.age / 12 : animal.age),
      ageMonths: Math.round(animal.ageUnit === 'months' ? animal.age : animal.age * 12) % 12,
      sex: animal.sex,
      size: animal.size,
      weight: animal.weight,
      status: animal.status,
      urgent: Boolean(animal.urgent),
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

  protected openPublicAnimal(animal: ShelterAnimal): void {
    window.open(`/animal?id=${encodeURIComponent(animal.id)}`, '_blank', 'noopener');
  }

  protected toggleAnimalDetails(id: string): void {
    this.expandedAnimalId.update((current) => current === id ? null : id);
  }

  protected currentAge(ageAtArrival: number, arrivalDate: string, ageUnit: 'years' | 'months' = 'years'): string {
    const arrival = new Date(`${arrivalDate}T00:00:00`);
    const today = new Date();
    let elapsedMonths = 0;
    if (arrivalDate && !Number.isNaN(arrival.getTime())) {
      elapsedMonths = (today.getFullYear() - arrival.getFullYear()) * 12 + today.getMonth() - arrival.getMonth();
      if (today.getDate() < arrival.getDate()) elapsedMonths--;
    }
    const months = Math.round(ageAtArrival * (ageUnit === 'months' ? 1 : 12)) + Math.max(0, elapsedMonths);
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    const yearLabel = `${years} ${years === 1 ? 'año' : 'años'}`;
    const monthLabel = `${remainingMonths} ${remainingMonths === 1 ? 'mes' : 'meses'}`;
    return years === 0 ? monthLabel : remainingMonths === 0 ? yearLabel : `${yearLabel} y ${monthLabel}`;
  }

  protected formCurrentAge(): string {
    const { age, arrivalDate, ageMonths } = this.form();
    if (age === null) return 'Indica la edad al entrar';
    return `${this.currentAge(age * 12 + ageMonths, arrivalDate, 'months')} actualmente`;
  }

  private storySummary(story: string): string {
    const clean = story.trim().replace(/\s+/g, ' ');
    if (clean.length <= 180) return clean;
    return `${clean.slice(0, 177).trimEnd()}…`;
  }

  protected async removeAnimal(id: string): Promise<void> {
    if (!confirm('¿Seguro que quieres eliminar este animal de la web?')) return;
    const existing = this.pendingDeletion();
    if (existing) clearTimeout(existing.timer);
    const index = this.animals().findIndex((animal) => animal.id === id);
    const animal = this.animals()[index];
    if (!animal) return;
    this.saveError.set('');
    await this.commitDeletion(id);
    const timer = setTimeout(() => this.pendingDeletion.set(null), 48 * 60 * 60 * 1000);
    this.pendingDeletion.set({ animal, index, timer });
  }

  protected undoDeletion(): void {
    const pending = this.pendingDeletion();
    if (!pending) return;
    clearTimeout(pending.timer);
    this.pendingDeletion.set(null);
    void this.restoreDeletion(pending.animal.id);
  }

  private async commitDeletion(id: string): Promise<void> {
    const pending = this.pendingDeletion();
    if (pending?.animal.id === id) this.pendingDeletion.set(null);
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

  protected async addPhotos(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (this.optimizingPhotos()) return;
    const selected = Array.from(input.files ?? []);
    const errors: string[] = [];
    this.optimizingPhotos.set(true);
    this.saveError.set('');
    try {
      for (const file of selected) {
        if (!file.type.startsWith('image/') || file.size > 15 * 1024 * 1024) {
          errors.push(`${file.name}: selecciona una imagen de hasta 15 MB.`);
          continue;
        }
        try {
          const photo = await this.compressPhoto(file);
          this.form.update((current) => ({ ...current, photos: [...current.photos, photo] }));
        } catch {
          errors.push(`No se pudo optimizar ${file.name}. Prueba con otra imagen.`);
        }
      }
    } finally {
      this.optimizingPhotos.set(false);
      input.value = '';
      this.saveError.set(errors.join(' '));
    }
  }

  protected removePhoto(index: number): void {
    this.form.update((current) => ({
      ...current,
      photos: current.photos.filter((_, photoIndex) => photoIndex !== index),
      ...(index === 0 ? { photoFocusX: 50, photoFocusY: 50 } : {}),
    }));
  }

  private async restoreDeletion(id: string): Promise<void> {
    const response = await fetch(`/.netlify/functions/animals?id=${encodeURIComponent(id)}`, { method: 'PATCH', headers: { Accept: 'application/json' }, credentials: 'same-origin' });
    const data = (await response.json().catch(() => null)) as { animals?: ShelterAnimal[] } | null;
    if (response.ok && Array.isArray(data?.animals)) this.animals.set(data.animals);
  }

  protected makePrimaryPhoto(index: number): void {
    this.movePhoto(index, 0);
    this.form.update((current) => ({ ...current, photoFocusX: 50, photoFocusY: 50 }));
  }

  protected movePhoto(index: number, destination: number): void {
    this.form.update((current) => {
      const photos = [...current.photos];
      const [photo] = photos.splice(index, 1);
      photos.splice(destination, 0, photo);
      return { ...current, photos };
    });
  }

  private async compressPhoto(file: File): Promise<string> {
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('No se pudo leer la imagen.'));
        image.src = url;
      });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) throw new Error('No se pudo procesar la imagen.');
      const maxBytes = 200 * 1024;
      let maxDimension = 1280;
      for (let attempt = 0; attempt < 10; attempt++) {
        const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        for (const quality of [0.8, 0.7, 0.6]) {
          let blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
          if (!blob || blob.type !== 'image/webp') {
            blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
          }
          if (blob && blob.size <= maxBytes) {
            return await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result));
              reader.onerror = () => reject(reader.error);
              reader.readAsDataURL(blob);
            });
          }
        }
        maxDimension = Math.round(maxDimension * 0.8);
      }
      throw new Error('No se pudo reducir el peso de la imagen.');
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  protected statusLabel(status: AnimalStatus): string {
    const labels: Record<AnimalStatus, string> = {
      available: 'Disponible',
      reserved: 'Reservado',
      adopted: 'Adoptado',
      medical: 'En cuidados médicos',
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
