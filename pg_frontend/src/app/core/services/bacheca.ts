import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth';
import { Observable } from 'rxjs';
import { Bacheca, FAQ } from '../models/interfacce';

@Injectable({ providedIn: 'root' })
export class BachecaService {

  constructor(private http: HttpClient, private authService: AuthService) { }

  private get api(): string {
    return `${this.authService.getApiUrl()}/api/bacheche`;
  }

  getBachecaPerCorsoDiStudi(idCorsoDiStudi: string): Observable<Bacheca> {
    return this.http.get<Bacheca>(`${this.api}/corso-di-studi/${idCorsoDiStudi}`);
  }

  getFaq(idCorsoDiStudi: string): Observable<FAQ[]> {
    return this.http.get<FAQ[]>(`${this.api}/corso-di-studi/${idCorsoDiStudi}/faq`)
  }

  aggiungiFaq(idCorsoDiStudi: string, faq: Partial<FAQ>): Observable<FAQ> {
    return this.http.post<FAQ>(`${this.api}/corso-di-studi/${idCorsoDiStudi}/faq`, faq)
  }

  aggiornaFaq(idBacheca: string, faq: Partial<FAQ>): Observable<FAQ> {
    return this.http.put<FAQ>(`/api/faq/${faq.id}`, faq)
  }

  eliminaFaq(idFaq: string): Observable<void> {
    return this.http.delete<void>(`/api/faq/${idFaq}`)
  }
}
