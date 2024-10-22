<script>
    import { userStore, isLoggedIn } from "../store.js"; // Importáljuk a felhasználói adat store-t
    import { onMount } from "svelte";
    import API_Url from '../config.js'

    let username = "";
    let password = "";
    let message = "";

    // Ellenőrzi, hogy van-e token az oldalon betöltéskor
    onMount(() => {
        const token = localStorage.getItem("jwtToken");
        if (token) {
            isLoggedIn.set(true);
        }
    });

    async function handleSubmit(event) {
        event.preventDefault();

        const loginData = {
            username,
            password,
        };

        try {
            const response = await fetch(
                `${API_Url}/api/Account/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(loginData),
                },
            );

            if (response.ok) {
                const data = await response.json(); // JSON objektumként kezeljük a választ
                const token = data.token; // A token mezőt kinyerjük
                const userRole = data.user.role; // A role mezőt kinyerjük

                // Tároljuk a JWT tokent és a felhasználói role-t a localStorage-ban
                localStorage.setItem("jwtToken", token);
                localStorage.setItem("userRole", userRole); // Role tárolása

                // Frissítjük a felhasználói adatokat a store-ban
                userStore.set({
                    username: data.user.username,
                    email: data.user.email,
                    id: data.user.id,
                    role: userRole,
                });

                isLoggedIn.set(true); // Beállítjuk, hogy a felhasználó be van jelentkezve
                message = "Sikeres bejelentkezés!";

                // Azonnali navigáció a menübe
                // window.location.href = '/menu';
            } else {
                message = `Hiba történt: ${response.statusText}`;
            }
        } catch (error) {
            message = `Hálózati hiba: ${error.message}`;
        }
    }
</script>

{#if $isLoggedIn}
    <div class="dashboard-container">
        <div class="content my-5 mx-3">
            <h2>Dashboard</h2>
            <p>Válaszd ki a menüpontot a jobb oldali menüből a kezdéshez.</p>
        </div>
    </div>
{:else}
    <div class="container mt-5">
        <div class="login-form">
            <h2>Bejelentkezés</h2>
            <form on:submit={handleSubmit}>
                <div class="mb-3">
                    <label for="username" class="form-label"
                        >Felhasználónév</label
                    >
                    <input
                        type="text"
                        class="form-control"
                        id="username"
                        bind:value={username}
                        placeholder="Felhasználónév"
                        required
                    />
                </div>
                <div class="mb-3">
                    <label for="password" class="form-label">Jelszó</label>
                    <input
                        type="password"
                        class="form-control"
                        id="password"
                        bind:value={password}
                        placeholder="Jelszó"
                        required
                    />
                </div>
                <button type="submit" class="btn btn-primary"
                    >Bejelentkezés</button
                >
            </form>

            {#if message}
                <div class="mt-3">
                    <div class="alert alert-info" role="alert">
                        {message}
                    </div>
                </div>
            {/if}
        </div>
    </div>
{/if}

<style>
    .dashboard-container {
        min-height: 100vh;
        display: flex;
    }
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
