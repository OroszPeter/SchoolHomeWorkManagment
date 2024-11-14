<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import API_Url from '../../config';

    // Jelszó mezők és üzenetkezelés
    let currentPassword = '';
    let newPassword = '';
    let token = '';
    let message = '';
    let messageType = '';
    let showCurrentPassword = false;
    let showNewPassword = false;

    onMount(() => {
        token = localStorage.getItem("jwtToken");
    });

    // Jelszó módosítása
    async function changePassword(event) {
        event.preventDefault();

        try {
            const response = await fetch(`${API_Url}/api/account/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });

            if (!response.ok) {
                const errorMsg = await response.text();
                message = 'Hiba történt: ' + errorMsg;
                messageType = 'error';
            } else {
                message = 'A jelszó sikeresen megváltozott.';
                messageType = 'success';
                setTimeout(() => goto('/'), 2000); // 2 másodperc múlva átirányít a főoldalra
            }
        } catch (err) {
            message = 'Sikertelen jelszó módosítás: ' + err.message;
            messageType = 'error';
        }
    }

    // Jelszó láthatóságának kezelése
    function toggleCurrentPasswordVisibility() {
        showCurrentPassword = !showCurrentPassword;
    }

    function toggleNewPasswordVisibility() {
        showNewPassword = !showNewPassword;
    }
</script>

<div class="container mt-5">
    <div class="login-form">
        <h2 class="pt-3">Jelszó módosítása</h2>

        <!-- Üzenet megjelenítése -->
        {#if message}
            <div class="alert" class:success={messageType === 'success'} class:error={messageType === 'error'}>
                {message}
            </div>
        {/if}

        <form on:submit={changePassword}>
            <div class="mb-3">
                <label for="currentPassword" class="form-label">Jelenlegi jelszó</label>
                <div class="input-group">
                    {#if showCurrentPassword}
                        <!-- Szöveges mező a jelszó helyett -->
                        <input
                            type="text"
                            class="form-control current-password"
                            id="currentPassword"
                            bind:value={currentPassword}
                            placeholder="Jelenlegi jelszó"
                            required
                        />
                    {:else}
                        <!-- Jelszó mező -->
                        <input
                            type="password"
                            class="form-control current-password"
                            id="currentPassword"
                            bind:value={currentPassword}
                            placeholder="Jelenlegi jelszó"
                            required
                        />
                    {/if}
                    <button type="button" class="btn btn-outline-secondary" on:click={toggleCurrentPasswordVisibility}>
                        {#if showCurrentPassword}
                            <i class="bi bi-eye-fill"></i>
                        {:else}
                            <i class="bi bi-eye-slash-fill"></i>
                        {/if}
                    </button>
                </div>
            </div>
            <div class="mb-3">
                <label for="newPassword" class="form-label">Új jelszó</label>
                <div class="input-group">
                    {#if showNewPassword}
                        <!-- Szöveges mező az új jelszó helyett -->
                        <input
                            type="text"
                            class="form-control new-password"
                            id="newPassword"
                            bind:value={newPassword}
                            placeholder="Új jelszó"
                            required
                        />
                    {:else}
                        <!-- Jelszó mező -->
                        <input
                            type="password"
                            class="form-control new-password"
                            id="newPassword"
                            bind:value={newPassword}
                            placeholder="Új jelszó"
                            required
                        />
                    {/if}
                    <button type="button" class="btn btn-outline-secondary" on:click={toggleNewPasswordVisibility}>
                        {#if showNewPassword}
                            <i class="bi bi-eye-fill"></i>
                        {:else}
                            <i class="bi bi-eye-slash-fill"></i>
                        {/if}
                    </button>
                </div>
            </div>
            <button type="submit" class="btn btn-primary">Jelszó módosítása</button>
        </form>
    </div>
</div>

<style>
    .container {
        max-width: 500px;
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

    .alert {
        padding: 10px;
        margin-bottom: 15px;
        border-radius: 4px;
        font-size: 14px;
        text-align: center;
    }

    .success {
        color: #155724;
        background-color: #d4edda;
        border: 1px solid #c3e6cb;
    }

    .error {
        color: #721c24;
        background-color: #f8d7da;
        border: 1px solid #f5c6cb;
    }

    .current-password {
        background-color: #f8d7da; /* piros háttér */
    }

    .new-password {
        background-color: #d4edda; /* zöld háttér */
    }

    .input-group {
        display: flex;
    }

    .btn-outline-secondary {
        border-radius: 0 4px 4px 0;
    }
</style>
