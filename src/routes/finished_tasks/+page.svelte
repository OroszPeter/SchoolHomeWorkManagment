<script>
    import { onMount } from "svelte";
    import API_Url from '../../config.js'

    let loggedIn = false;
    let submissions = [];
    let loading = true;
    let error = null;
    let token = null;
    function checkLogin() {
        token = localStorage.getItem("jwtToken");
        loggedIn = !!token;
    }

    async function fetchSubmissions() {
        loading = true; // Opció, hogy jelezzük, hogy az adatok betöltődnek
        try {
            const response = await fetch(
                `${API_Url}/api/Submissions/get-all`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Token hozzáadása az Authorization fejlécbe
                    },
                },
            );

            if (!response.ok) {
                throw new Error("Hiba történt a beadások lekérésekor");
            }

            const data = await response.json();
            submissions = data;
        } catch (error) {
            errorMessage = error.message; // Hibaüzenet beállítása
        } finally {
            loading = false; // Betöltés befejezése
        }
    }

    onMount(async () => {
        checkLogin();
        if (loggedIn) {
            await fetchSubmissions();
        }
    });
</script>

{#if !loggedIn}
    <div>
        <h1>Nem vagy bejelentkezve</h1>
        <p>Kérlek jelentkezz be a menüben.</p>
    </div>
{:else if loading}
    <div id="loading" class="container d-flex justify-content-center">
        <div class="spinner-border mx-2" role="status"></div>
        <span class="sr-only">Loading...</span>
    </div>
{:else if error}
    <p>Hiba történt: {error}</p>
{:else}
    <div class="container my-5">
        <h2 class="mb-4">Beadott Feladatok</h2>

        <!-- Feladatok táblázat -->
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Feladat neve</th>
                    <th>Beadó (UserID)</th>
                    <th>Beadás ideje</th>
                    <th>Beadott link</th>
                    <th>Érdemjegy</th>
                    <th>Műveletek</th>
                </tr>
            </thead>
            <tbody>
                {#each submissions as submission}
                    <tr>
                        <td>{submission.assignment.assignmentName}</td>
                        <td
                            >{submission.user.firstName}
                            {submission.user.lastName}</td
                        >
                        <td
                            >{new Date(
                                submission.submittedAt,
                            ).toLocaleDateString()}</td
                        >
                        <td
                            ><a href={submission.submissionLink} target="_blank"
                                >GitHub Link</a
                            ></td
                        >
                        <td>{submission.grade}</td>
                        <td>
                            <a href="#" class="btn btn-sm btn-primary me-2"
                                ><i class="bi bi-pencil-square"></i> Szerkesztés</a
                            >
                            <a href="#" class="btn btn-sm btn-danger"
                                ><i class="bi bi-trash"></i> Törlés</a
                            >
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
{/if}

<style>
    #loading {
        margin-top: 20%;
    }
</style>
