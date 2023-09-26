import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class AppFunctionService {

  public operations = {
    base: {
      show: 'show',
      create: 'create',
      update: 'update',
      delete: 'delete',
      export: 'export'
    }
  };

  constructor(private readonly http: HttpClient) { }



}
