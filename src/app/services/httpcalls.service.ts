import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpHeaders, HttpParams, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HttpcallsService {

  private BASE_URL = 'http://localhost:9001';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token =
      localStorage.getItem('access_token') ||
      sessionStorage.getItem('access_token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // ==============================
  // 🔥 UPLOAD IMAGE / BANNER
  // ==============================
  uploadImage(payload: {
    file: File;
    filetype: 'LOGO' | 'BANNER';
    imageName: string;
  }): Observable<any> {
    const formData = new FormData();
    formData.append('file', payload.file);
    formData.append('filetype', payload.filetype);
    formData.append('imageName', payload.imageName);
    return this.http.post(`${this.BASE_URL}/upload/image`, formData, { headers: this.getAuthHeaders() });
  }

  // ==============================
  // 📥 GET IMAGES (pagination + search)
  // ==============================
  getImages(page: number = 1, limit: number = 12, search?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }
    return this.http.get(`${this.BASE_URL}/upload/images`, { headers: this.getAuthHeaders(), params });
  }

  // ==============================
  // 📥 GET PRODUCT IMAGES (pagination + search)
  // ==============================
  getProductImages(page: number = 1, limit: number = 21, search?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }
    return this.http.get(`${this.BASE_URL}/upload/product-images`, { headers: this.getAuthHeaders(), params });
  }


  // ==============================
  // ✏️ UPDATE IMAGE
  // ==============================
  updateImage(id: string, payload: { imageName: string }): Observable<any> {
    return this.http.patch(`${this.BASE_URL}/upload/images/${id}`, payload, { headers: this.getAuthHeaders() });
  }

  // ==============================
  // 🗑️ DELETE IMAGE
  // ==============================
  deleteImage(id: string): Observable<any> {
    return this.http.delete(`${this.BASE_URL}/upload/images/${id}`, { headers: this.getAuthHeaders() });
  }

  deleteProductImage(id: string): Observable<any> {
    return this.http.delete(`${this.BASE_URL}/upload/product-images/${id}`, { headers: this.getAuthHeaders() });
  }

  // ==============================
  // ✅ TOGGLE VERIFY IMAGE
  // ==============================
  toggleVerifyImage(id: string, isVerified: boolean): Observable<any> {
    return this.http.patch(
      `${this.BASE_URL}/upload/images/${id}/verify`,
      { isVerified },
      { headers: this.getAuthHeaders() }
    );
  }

  // ==============================
  // ✅ VERIFY SINGLE IMAGE
  // ==============================
  verifyImage(id: string, isVerified: boolean): Observable<any> {
    return this.http.post(
      `${this.BASE_URL}/upload/images/${id}/verify`,
      { isVerified },
      { headers: this.getAuthHeaders() }
    );
  }

  // ==============================
  // ✅ BULK VERIFY
  // ==============================
  bulkVerifyImages(ids: string[], isVerified: boolean): Observable<any> {
    return this.http.post(
      `${this.BASE_URL}/upload/images/bulk/verify`,
      { ids, isVerified },
      { headers: this.getAuthHeaders() }
    );
  }

  // ==============================
  // 📦 BULK UPLOAD
  // ==============================
  bulkUploadImages(files: File[], filetype: string, folderName?: string): Observable<HttpEvent<any>> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file, file.name));
    formData.append('filetype', filetype);
    if (folderName) formData.append('folderName', folderName);

    const request = new HttpRequest(
      'POST',
      `${this.BASE_URL}/upload/images/bulk`,
      formData,
      { reportProgress: true, headers: this.getAuthHeaders() }
    );
    return this.http.request<any>(request);
  }
}