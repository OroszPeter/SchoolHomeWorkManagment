<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation'; // Ha használod az SvelteKit navigációt
    import API_Url from '../../config';

    let email = '';

    const handleSubmit = async (event) => {
        event.preventDefault(); // Megakadályozza az alapértelmezett űrlap küldést

        try {
            const response = await fetch(`${API_Url}/api/Account/login2fa`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }), // A beírt email cím küldése
            });

            if (response.ok) {
                // Ha a válasz sikeres, irányítsd át a /verification oldalra
                goto('/verification'); // Az SvelteKit navigációs funkció
            } else {
                // Hibakezelés (pl. hibás email, stb.)
                const errorData = await response.json();
                console.error('Hiba:', errorData);
                alert('A bejelentkezés nem sikerült. Kérlek, ellenőrizd az email címed.');
            }
        } catch (error) {
            console.error('Hálózati hiba:', error);
            alert('Hálózati hiba történt. Kérlek, próbáld újra később.');
        }
        localStorage.setItem('email', email);
    };
</script>

<div class="container mt-5">
    <div class="login-form">
        <h2>Bejelentkezés</h2>
        <form on:submit={handleSubmit}>
            <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input
                    type="text"
                    class="form-control"
                    id="email"
                    placeholder="Email"
                    bind:value={email} 
                    required
                />
            </div>
            <button type="submit" class="btn btn-primary">Bejelentkezés</button>
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