<script>
    import { userStore, isLoggedIn } from "../store.js";
    import { onMount } from "svelte";
    import { goto } from '$app/navigation';
    import API_Url from '../config.js';

    let username = "";
    let password = "";
    let message = "";
    let email = "";

    // Check for token on page load
    onMount(() => {
        const token = localStorage.getItem("jwtToken");
        if (token) {
            isLoggedIn.set(true);
        }
    });

    async function login(event) {
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
                const data = await response.json(); // Parse response as JSON
                const token = data.token;
                const userRole = data.user.role;

                // Store JWT token and user role in localStorage
                localStorage.setItem("jwtToken", token);
                localStorage.setItem("userRole", userRole);

                // Fetch additional user details by email
                const emailResponse = await fetch(`${API_Url}/api/Account/get-user-by-email?email=${encodeURIComponent(data.user.email)}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (emailResponse.ok) {
                    const emailData = await emailResponse.json();
                    //console.log("User data by email:", emailData); // Log response to console

                    // Store specific user details in localStorage
                    localStorage.setItem("userId", emailData.id);
                    localStorage.setItem("firstName", emailData.firstName);
                    localStorage.setItem("lastName", emailData.lastName);
                    localStorage.setItem("email", emailData.email);
                    localStorage.setItem("userName", emailData.userName);
                    localStorage.setItem("roles", JSON.stringify(emailData.roles)); // Store roles as JSON string

                    // Update user data in the store
                    userStore.set({
                        userName: emailData.userName,
                        email: emailData.email,
                        id: emailData.id,
                        firstName: emailData.firstName,
                        lastName: emailData.lastName,
                        roles: emailData.roles,
                        role: userRole,
                    });

                    isLoggedIn.set(true); // Set login status to true
                    message = "Sikeres bejelentkezés!";
                } else {
                    message = "Felhasználói adatok lekérése nem sikerült.";
                }

            } else {
                message = `Hiba történt: ${response.statusText}`;
            }
        } catch (error) {
            message = `Hálózati hiba: ${error.message}`;
        }
    }

    const login2fa = async (event) => {
        event.preventDefault();

        try {
            const response = await fetch(`${API_Url}/api/Account/login2fa`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }), // Send email
            });

            if (response.ok) {
                goto('/verification'); // Redirect to verification page
            } else {
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
            <nav>
                <div class="nav nav-tabs" id="nav-tab" role="tablist">
                  <button class="nav-link active" id="nav-home-tab" data-bs-toggle="tab" data-bs-target="#nav-home" type="button" role="tab" aria-controls="nav-home" aria-selected="true">Felhasználónév alapján</button>
                  <button class="nav-link" id="nav-profile-tab" data-bs-toggle="tab" data-bs-target="#nav-profile" type="button" role="tab" aria-controls="nav-profile" aria-selected="false">Kód alapján</button>
                </div>
              </nav>
              <div class="tab-content" id="nav-tabContent">
                <div class="tab-pane fade show active" id="nav-home" role="tabpanel" aria-labelledby="nav-home-tab" tabindex="0">
                    <h2 class="pt-3">Bejelentkezés</h2>
            <form on:submit={login}>
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
                </div>
                <div class="tab-pane fade" id="nav-profile" role="tabpanel" aria-labelledby="nav-profile-tab" tabindex="0">
                        <h2 class="pt-3">Bejelentkezés</h2>
                        <form on:submit={login2fa}>
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
