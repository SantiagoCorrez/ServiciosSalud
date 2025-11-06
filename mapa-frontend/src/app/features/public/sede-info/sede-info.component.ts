import { Component, Inject, AfterViewInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-sede-info',
  templateUrl: './sede-info.component.html',
  styleUrls: ['./sede-info.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatListModule,
    MatTableModule,
    MatPaginatorModule,
  ],
})
export class SedeInfoComponent implements AfterViewInit {
  servicesDataSource:MatTableDataSource<any>[] = [];
  bedsDataSource:MatTableDataSource<any>[] = [];

  servicesDisplayedColumns: string[] = ['name', 'initial_status', 'projected_status'];
  bedsDisplayedColumns: string[] = ['name', 'initial_count', 'current_count', 'projected_count'];

  @ViewChild('servicesPaginator') servicesPaginator!: MatPaginator;
  @ViewChild('bedsPaginator') bedsPaginator!: MatPaginator;

  constructor(
    public dialogRef: MatDialogRef<SedeInfoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngAfterViewInit(): void {
    console.log('Sede Info Prop:', this.data);
    this.data.props.forEach((prop: any, index: number) => {
      console.log('Sede Info Prop:', prop);
      if (prop.services) {
        this.servicesDataSource[index] = new MatTableDataSource<any>();
        this.servicesDataSource[index].data = prop.services;
        this.servicesDataSource[index].paginator = this.servicesPaginator;
      }
      if (prop.bedCounts) {
        this.bedsDataSource[index] = new MatTableDataSource<any>();
        this.bedsDataSource[index].data = prop.bedCounts;
        this.bedsDataSource[index].paginator = this.bedsPaginator;
      }
    });

  }

  close(): void {
    this.dialogRef.close();
  }
}
