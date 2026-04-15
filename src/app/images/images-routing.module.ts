import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ImageUploadComponent } from './image-upload/image-upload.component';
import { BannerComponent } from './banner/banner.component';

const routes: Routes = [
  {
    path:'',
    component:BannerComponent
  },
    {
    path:'products',
    component:ImageUploadComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImagesRoutingModule { }
