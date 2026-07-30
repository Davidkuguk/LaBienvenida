import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { App } from './app';
import { routes } from './app.routes';
import { Dashboard } from './dashboard';

describe('App routing', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should create the app shell', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the animal dashboard at /admin', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/admin');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain(
      'Dashboard de animales',
    );
  });
});

describe('Dashboard', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
    }).compileComponents();
  });

  it('should hide and restore the sidebar', () => {
    const fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();

    const hideButton = fixture.nativeElement.querySelector(
      'aside .menu-toggle',
    ) as HTMLButtonElement;
    hideButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('aside')).toBeNull();
    expect(fixture.nativeElement.querySelector('.menu-toggle.floating')).toBeTruthy();

    const showButton = fixture.nativeElement.querySelector(
      '.menu-toggle.floating',
    ) as HTMLButtonElement;
    showButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('aside')).toBeTruthy();
  });
});
