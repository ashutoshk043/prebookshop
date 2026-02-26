import { Component } from '@angular/core';
import { LayoutsModule } from "../layouts/layouts.module";

@Component({
  selector: 'app-setting',
  standalone: true,
  imports: [LayoutsModule],
  templateUrl: './setting.component.html',
  styleUrl: './setting.component.css'
})
export class SettingComponent {

}
