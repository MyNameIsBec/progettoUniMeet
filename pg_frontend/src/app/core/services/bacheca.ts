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

  getBachecaPerCorsoDiStudi(idCorsoDiStudi: string): Observable<Bacheca[]> {
    return this.http.get<Bacheca[]>(`${this.api}/corso-di-studi/${idCorsoDiStudi}`);
  }

  getBachecaByCorso(idCorso: string): Observable<Bacheca> {
    return this.http.get<Bacheca>(`${this.api}/corso/${idCorso}`);
  }

  getBachecheDocente(): Observable<Bacheca[]> {
    return this.http.get<Bacheca[]>(`${this.api}/docente/me`);
  }

  getFaq(idCorso: string): Observable<FAQ[]> {
    return this.http.get<FAQ[]>(`${this.api}/corso/${idCorso}/faq`)
  }

  aggiungiFaq(idCorso: string, faq: Partial<FAQ>): Observable<FAQ> {
    return this.http.post<FAQ>(`${this.api}/corso/${idCorso}/faq`, faq)
  }

  aggiornaFaq(idFaq: string, faq: Partial<FAQ>): Observable<FAQ>  {
  return this.http.put<FAQ>( `${this.authService.getApiUrl()}/api/faq/${idFaq}`, faq)
}

  eliminaFaq(idFaq: string): Observable<void> {
    return this.http.delete<void>(`${this.authService.getApiUrl()}/api/faq/${idFaq}`)
  }
}
