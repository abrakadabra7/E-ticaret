import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignsSectionComponent } from './campaigns-section.component';

describe('CampaignsSectionComponent', () => {
  let component: CampaignsSectionComponent;
  let fixture: ComponentFixture<CampaignsSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampaignsSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CampaignsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
