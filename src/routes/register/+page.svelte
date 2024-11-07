<script>
    import { onMount } from "svelte";
    import API_Url from '../../config.js';

    // State variables for login status and form inputs
    let loggedIn = false;
    let token = "";
    let firstname = "";
    let lastname = "";
    let email = "";
    let password = "";
    let classname = "";
    let errorMessage = "";
    let successMessage = "";

    // Check login status (token existence)
    function checkLogin() {
        token = localStorage.getItem("jwtToken");
        loggedIn = !!token;
    }

    onMount(() => {
        checkLogin();
    });

    // Registration function that sends a POST request to the API
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
            // First POST request to register the user
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
                
                // Reset form after successful registration
                resetForm();

                // Second POST request to send email notification
                await sendEmailNotification();

            } else {
                errorMessage = `Hiba történt: ${isJson ? result.message : result}`;
            }
        } catch (error) {
            errorMessage = "Hálózati hiba történt.";
            console.error(error);
        }
    }

    // Function to send email notification
    async function sendEmailNotification() {
        const emailData = {
            toEmails: email, // Placeholder value for recipient email
            subject: "",  // Placeholder value for email subject
            body: ""      // Placeholder value for email body
        };

        try {
            const emailResponse = await fetch(
                `https://localhost:7296/api/Email/SendEmail`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(emailData)
                }
            );

            if (!emailResponse.ok) {
                const emailError = await emailResponse.json();
                console.error("Email send error:", emailError);
            }

        } catch (error) {
            console.error("Network error while sending email:", error);
        }
    }

    // Reset form inputs after successful registration
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
        <h2 class="mb-4">Felhasználó regisztrálása</h2>
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
                <select
                    class="form-control"
                    bind:value={classname}
                    id="classname"
                    required
                >
                    <option value="" disabled selected>Válassz osztályt</option>
                    <option value="SZFT14">SZFT14</option>
                    <option value="SZFT14-e">SZFT14-e</option>
                    <option value="SZFT13-e">SZFT13-e</option>
                </select>
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
