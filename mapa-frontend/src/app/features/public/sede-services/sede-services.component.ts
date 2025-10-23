import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sede-services',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sede-services.component.html',
  styleUrl: './sede-services.component.scss'
})
export class SedeServicesComponent {
  @Input() services: any[] = [];
}
