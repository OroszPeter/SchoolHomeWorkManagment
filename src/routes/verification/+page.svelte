<script>
    import { goto } from '$app/navigation';
    import { userStore, isLoggedIn } from '../../store.js';
    import API_Url from '../../config.js';

    let email = '';
    let code = ''; // 6 számjegyű kód változó
    let message = ''; // Hibaüzenet tárolása

    // Ellenőrizzük, hogy a localStorage elérhető-e
    if (typeof window !== 'undefined') {
        email = localStorage.getItem('email') || ''; // Az email automatikus betöltése a localStorage-ból
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Ellenőrizzük, hogy az email és a code mezők nem üresek-e
        if (!email || !code) {
            message = "Kérjük, töltse ki az összes mezőt!";
            return;
        }

        // Ellenőrizzük, hogy a kód pontosan 6 számjegyű-e
        if (code.length !== 6 || isNaN(code)) {
            message = "A kódnak pontosan 6 számjegyűnek kell lennie!";
            return;
        }

        const requestUrl = `${API_Url}/api/Account/verify2fa?email=${encodeURIComponent(email.trim())}&code=${encodeURIComponent(code.trim())}`;

        try {
            const response = await fetch(requestUrl, {
                method: 'POST'
            });

            if (response.ok) {
                const token = await response.text(); // A válasz szövege a JWT token
                console.log('Válasz:', token);

                // JWT token tárolása, ha a localStorage elérhető
                if (typeof window !== 'undefined') {
                    localStorage.setItem('jwtToken', token);
                }

                // Sikeres hitelesítés után a felhasználói adatokat is lekérjük
                await fetchUserData(email);

                // Átirányítás a főoldalra
                goto('/');
            } else {
                const errorData = await response.json();
                console.error('Hiba:', errorData);
                message = errorData.title || 'Ismeretlen hiba történt.';
            }
        } catch (error) {
            message = `Hálózati hiba: ${error.message}`;
        }
    };

    const fetchUserData = async (email) => {
        try {
            const userResponse = await fetch(`${API_Url}/api/Account/get-user-by-email?email=${encodeURIComponent(email)}`);
            
            if (userResponse.ok) {
                const userData = await userResponse.json();
                
                // Frissítjük a userStore-t a helyes formátummal
                userStore.set({
                    id: userData.id,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    email: userData.email,
                    photo: userData.photo,
                    roles: userData.roles,
                    userName: userData.userName
                });

                // Bejelentkezési állapot frissítése
                isLoggedIn.set(true);
                console.log('Felhasználói adatok frissítve a store-ban:', userData);
            } else {
                console.error('Felhasználói adatok lekérése sikertelen.');
            }
        } catch (error) {
            console.error('Hálózati hiba a felhasználói adatok lekérése során:', error);
        }
    };
</script>

<div class="container mt-5">
    <div class="login-form">
        <h2>Azonosítás</h2>
        
        <form on:submit={handleSubmit}>
            <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input
                    type="email"
                    class="form-control"
                    id="email"
                    placeholder="Email"
                    value={email}
                    readonly
                />
            </div>
            <div class="mb-3">
                <label for="code" class="form-label">Verifikációs Kód</label>
                <input
                    type="text"
                    class="form-control"
                    id="code"
                    placeholder="6 számjegyű kód"
                    required
                    bind:value={code}
                />
            </div>
            <button type="submit" class="btn btn-primary">Kód Ellenőrzése</button>
            <p>{message}</p>
        </form>
    </div>
</div>

<style>
    .login-form {
        max-width: 400px;
        margin: 0 auto;
        padding: 40px;
        margin-top: 100px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        background-color: #fff;
    }
</style>
