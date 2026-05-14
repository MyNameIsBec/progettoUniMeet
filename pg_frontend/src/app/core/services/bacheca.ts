import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth';
import { Observable, map } from 'rxjs';
import { Bacheca, FAQ } from '../models/interfacce';

@Injectable({ providedIn: 'root' })
export class BachecaService {

  constructor(private http: HttpClient, private authService: AuthService) { }

  private get api(): string {
    return `${this.authService.getApiUrl()}/api/bacheca`;
  }

  getBacheche(): Observable<Bacheca[]> {
    return this.http.get<Bacheca[]>(this.api);
  }

  getBachecaPerCorso(idCorso: string): Observable<Bacheca> {
    return this.http.get<Bacheca>(`${this.api}/corso/${idCorso}`);
  }

  getFaq(idBacheca: string): Observable<FAQ[]> {
    return this.http.get<FAQ[]>(`${this.api}/${idBacheca}/faq`)
  }

  aggiungiFaq(idBacheca: string, faq: Partial<FAQ>): Observable<FAQ> {
    return this.http.post<FAQ>(`${this.api}/${idBacheca}/faq`, faq)
  }

  aggiornaFaq(idBacheca: string, faq: Partial<FAQ>): Observable<FAQ> {
    return this.http.put<FAQ>(`${this.api}/${idBacheca}/faq/${faq.id}`, faq)
  }

  eliminaFaq(idBacheca: string, idFaq: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${idBacheca}/faq/${idFaq}`)
  }
}
