import { writable } from 'svelte/store';

// Ellenőrizzük, hogy a localStorage elérhető-e
const isBrowser = typeof window !== 'undefined';

// Kezdeti felhasználói adatok a localStorage-ból (ha vannak és a böngészőben vagyunk)
const storedUser = isBrowser
    ? JSON.parse(localStorage.getItem('user')) || { username: '', email: '', id: '', role: '' }
    : { username: '', email: '', id: '', role: '' }; // Role is added here

export const userStore = writable(storedUser);

// Minden változáskor elmentjük a felhasználói adatokat a localStorage-ba, ha a böngészőben vagyunk
userStore.subscribe((value) => {
    if (isBrowser) {
        localStorage.setItem('user', JSON.stringify(value));
    }
});

// Bejelentkezett állapot kezelése
const storedLoginStatus = isBrowser
    ? JSON.parse(localStorage.getItem('isLoggedIn')) || false
    : false;
export const isLoggedIn = writable(storedLoginStatus);

isLoggedIn.subscribe((value) => {
    if (isBrowser) {
        localStorage.setItem('isLoggedIn', JSON.stringify(value));
    }
});
