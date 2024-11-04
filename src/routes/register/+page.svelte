<script>
    import { onMount } from "svelte";
    import API_Url from '../../config.js';

    // Állapotváltozók a bejelentkezés és az űrlapmezők ellenőrzéséhez
    let loggedIn = false;
    let token = "";
    let firstname = "";
    let lastname = "";
    let email = "";
    let password = "";
    let classname = "";
    let errorMessage = "";
    let successMessage = "";

    // Ellenőrizze a bejelentkezési állapotot (token megléte)
    function checkLogin() {
        token = localStorage.getItem("jwtToken");
        loggedIn = !!token;
    }

    onMount(() => {
        checkLogin();
    });

    // Regisztrációs függvény, amely POST kérést küld az API-ra
    async function handleSubmit(event) {
        event.preventDefault();
        errorMessage = "";
        successMessage = "";

        const formData = {
            firstname,
            lastname,
            email,
            password,
            classname
        };

        try {
            const response = await fetch(
                `${API_Url}/api/account/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formData)
                }
            );

            const isJson = response.headers.get("content-type")?.includes("application/json");
            const result = isJson ? await response.json() : await response.text();

            if (response.ok) {
                successMessage = "Sikeres regisztráció!";
                resetForm();
            } else {
                errorMessage = `Hiba történt: ${isJson ? result.message : result}`;
            }
        } catch (error) {
            errorMessage = "Hálózati hiba történt.";
            console.error(error);
        }
    }

    // Az űrlap alaphelyzetbe állítása sikeres regisztráció után
    function resetForm() {
        firstname = "";
        lastname = "";
        email = "";
        password = "";
        classname = "";
    }
</script>

{#if !loggedIn}
    <div>
        <h1>Nem vagy bejelentkezve</h1>
        <p>Kérlek jelentkezz be a menüben.</p>
    </div>
{:else}
    <div class="container my-5">
        <h2 class="mb-4">Regisztráció</h2>
        <form on:submit={handleSubmit}>
            <div class="mb-3">
                <label for="lastname" class="form-label">Vezetéknév</label>
                <input
                    type="text"
                    class="form-control"
                    bind:value={lastname}
                    id="lastname"
                    placeholder="Vezetéknév"
                    required
                />
            </div>

            <div class="mb-3">
                <label for="firstname" class="form-label">Keresztnév</label>
                <input
                    type="text"
                    class="form-control"
                    bind:value={firstname}
                    id="firstname"
                    placeholder="Keresztnév"
                    required
                />
            </div>

            <div class="mb-3">
                <label for="email" class="form-label">Email cím</label>
                <input
                    type="email"
                    class="form-control"
                    bind:value={email}
                    id="email"
                    placeholder="Email cím"
                    required
                />
            </div>

            <div class="mb-3">
                <label for="password" class="form-label">Jelszó</label>
                <input
                    type="password"
                    class="form-control"
                    bind:value={password}
                    id="password"
                    placeholder="Jelszó"
                    required
                />
            </div>

            <div class="mb-3">
                <label for="classname" class="form-label">Osztály</label>
                <input
                    type="text"
                    class="form-control"
                    bind:value={classname}
                    id="classname"
                    placeholder="Osztály"
                    required
                />
            </div>

            {#if errorMessage}
                <div class="alert alert-danger">{errorMessage}</div>
            {/if}

            {#if successMessage}
                <div class="alert alert-success">{successMessage}</div>
            {/if}

            <button type="submit" class="btn btn-primary">Regisztráció</button>
        </form>
    </div>
{/if}
