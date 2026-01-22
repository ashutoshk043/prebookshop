import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductImportService {

  private readonly UPLOAD_API = 'http://localhost:9001/upload/import';

  constructor(private http: HttpClient) {}

  uploadCsv(
    file: File
  ): Observable<HttpEvent<any>> {
    const formData = new FormData();

    formData.append('file', file);

    return this.http.post<any>(
      this.UPLOAD_API,
      formData,
      {
        observe: 'events',
        reportProgress: true,
        withCredentials: true
      }
    );
  }
}
