import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth';
import { Observable, map } from 'rxjs';
import { Bacheca, FAQ } from '../models/interfacce';

@Injectable({ providedIn: 'root' })
export class BachecaService {

  constructor(private http: HttpClient, private authService: AuthService) { }

  private get api(): string {
    return `${this.authService.getApiUrl}/api/bacheca`;
  }

  getFaq(idBacheca: number): Observable<Bacheca[]> {
    return this.http.get<Bacheca[]>(`${this.api}/faq/${idBacheca}`)
  }

  aggiungiFaq(idBacheca: number, faq: Partial<FAQ>): Observable<Bacheca> {
    return this.http.post<Bacheca>(`${this.api}/${idBacheca}/faq`, faq)
  }

  aggiornaFaq(idBacheca: number, faq: Partial<FAQ>): Observable<Bacheca> {
    return this.http.put<Bacheca>(`${this.api}/${idBacheca}/faq/${faq.id}`, faq)
  }

  eliminaFaq(idBacheca: number, idFaq: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/faq/${idBacheca}/${idFaq}`)
  }
}
