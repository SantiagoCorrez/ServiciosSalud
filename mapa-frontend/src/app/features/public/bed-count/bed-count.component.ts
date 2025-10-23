import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bed-count',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bed-count.component.html',
  styleUrl: './bed-count.component.scss'
})
export class BedCountComponent {
  @Input() bedCounts: any[] = [];
}
