// store.js
import { writable } from 'svelte/store';

const isBrowser = typeof window !== 'undefined';

// Kezdeti felhasználói adatok a localStorage-ból (ha léteznek)
const storedUser = isBrowser
    ? JSON.parse(localStorage.getItem('user')) || { id: '', firstName: '', lastName: '', email: '', photo: null, roles: [], userName: '' }
    : { id: '', firstName: '', lastName: '', email: '', photo: null, roles: [], userName: '' };

export const userStore = writable(storedUser);

// Frissítés a localStorage-ban
userStore.subscribe((value) => {
    if (isBrowser) {
        localStorage.setItem('user', JSON.stringify(value));
    }
});

export const isLoggedIn = writable(isBrowser ? JSON.parse(localStorage.getItem('isLoggedIn')) || false : false);

isLoggedIn.subscribe((value) => {
    if (isBrowser) {
        localStorage.setItem('isLoggedIn', JSON.stringify(value));
    }
});