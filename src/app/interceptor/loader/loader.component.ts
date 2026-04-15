import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../loader.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent {

  loader$ = this.loaderService.loader$;

  constructor(private loaderService: LoaderService) {}
}