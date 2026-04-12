import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Permesso104ConfigDto } from '../../pages/permessi-104/permessi-104.models';

@Injectable({ providedIn: 'root' })
export class Permessi104Service {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/permessi104/config`;

  constructor(private http: HttpClient) {}

  getConfig(userId: string) {
    const params = new HttpParams().set('userId', userId);
    return this.http.get<Permesso104ConfigDto | null>(this.baseUrl, { params });
  }

  saveConfig(payload: Permesso104ConfigDto) {
    return this.http.post<Permesso104ConfigDto>(this.baseUrl, payload);
  }
}
