import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { LoginTypes } from '../shared/login-types';

export interface Credentials {
  // Customize received credentials here
  displayName: string;
  email: string;
  firstName: string;
  lastName: string;
  token: string;
  username: string;
  departments: string[];
  enabledOperations: string[];
  menus: any[];
  loginTime: Date;
}

const credentialsKey = 'credentials';

/**
 * Provides storage for authentication credentials.
 * The Credentials interface should be replaced with proper implementation.
 */
@Injectable({
  providedIn: 'root',
})
export class CredentialsService {
  private _credentials: Credentials | null = null;

  constructor() {
    const savedCredentials =
      sessionStorage.getItem(credentialsKey) ||
      localStorage.getItem(credentialsKey);
    if (savedCredentials) {
      this._credentials = JSON.parse(savedCredentials);
    }
  }

  /**
   * Checks is the user is authenticated.
   * @return True if the user is authenticated.
   */
  isAuthenticated(): boolean {
    return !!this.credentials;
  }

  windowsAuthentication(): boolean {
    return environment.loginType === LoginTypes['Windows'];
  }

  /**
   * Gets the user credentials.
   * @return The user credentials or null if the user is not authenticated.
   */
  get credentials(): Credentials | null {
    return this._credentials;
  }

  /**
   * Sets the user credentials.
   * The credentials may be persisted across sessions by setting the `remember` parameter to true.
   * Otherwise, the credentials are only persisted for the current session.
   * @param credentials The user credentials.
   * @param remember True to remember credentials across sessions.
   */
  setCredentials(credentials?: Credentials, remember = false) {
    this._credentials = credentials || null;

    if (credentials) {
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem(credentialsKey, JSON.stringify(credentials));
    } else {
      sessionStorage.removeItem(credentialsKey);
      localStorage.removeItem(credentialsKey);
    }
  }

  init() {
    sessionStorage.removeItem(credentialsKey);
    localStorage.removeItem(credentialsKey);
  }

  /**
   * Megállapítja, hogy a felhasználó számára engedélyezett-e egy művelet
   * @param operation
   * @returns true, ha engedélyezett
   */
  operationEnabled(operation: string): boolean {
    let enabled = false;

    if (this.credentials?.enabledOperations) {
      enabled = !!this.credentials.enabledOperations.find(
        (op: string) => op === operation
      );
    }

    return !!enabled;
  }

  getLoginTime(): Date {
    if (!!this.credentials && !!this.credentials.loginTime) {
      return new Date(this.credentials.loginTime);
    }
    return new Date();
  }
}
