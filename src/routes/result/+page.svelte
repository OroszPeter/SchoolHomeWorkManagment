<script>
    import { onMount } from 'svelte';
    import { browser } from '$app/environment'; // A böngésző ellenőrzéséhez
    import API_Url from '../../config.js'

    let submissions = [];
    let loading = true;

    onMount(() => {
        if (browser) {
            const user = JSON.parse(localStorage.getItem("user"));
            const jwtToken = localStorage.getItem("jwtToken");

            if (!user || !user.id || !jwtToken) {
                console.error("User ID or JWT token not found in localStorage");
            } else {
                // Kérjük le a beadott feladatokat
                fetch(`${API_Url}/api/Submissions/get-user-submissions`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${jwtToken}`
                    }
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Failed to fetch submissions");
                    }
                    return response.json();
                })
                .then(data => {
                    // Iteráljuk végig a beadott feladatokat, és minden feladat nevét lekérjük külön API végpontról
                    const submissionPromises = data.map(async submission => {
                        const assignmentId = submission.assignmentId;
                        const assignmentName = await getAssignmentName(assignmentId, jwtToken);
                        
                        return {
                            ...submission,
                            taskName: assignmentName,
                            submittedAt: formatDate(submission.submittedAt) // Formázzuk a dátumot
                        };
                    });

                    // Várjuk meg az összes lekérést
                    Promise.all(submissionPromises)
                        .then(completedSubmissions => {
                            submissions = completedSubmissions;
                        });
                    loading = false;
                })
                .catch(error => {
                    console.error("Error fetching submissions:", error);
                });
            }
        }  
    });

    // Funkció a feladat neveinek lekérésére
    async function getAssignmentName(assignmentId, jwtToken) {
        try {
            const response = await fetch(`${API_Url}/api/Assignments/${assignmentId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwtToken}`
                }
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch assignment name for ID: ${assignmentId}`);
            }
            const assignmentData = await response.json();
            return assignmentData.assignmentName || 'N/A'; // Csak a feladat nevét adjuk vissza
        } catch (error) {
            console.error("Error fetching assignment name:", error);
            return 'N/A'; // Ha hiba történik, alapértelmezett értéket adunk vissza
        }  finally {
        loading = false;
    }
    }

    // Funkció a dátum formázására
    function formatDate(dateString) {
        const date = new Date(dateString);
        date.setHours(date.getHours() + 2); // Hozzáadunk 2 órát az időhöz
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Hónap 0-tól kezdődik
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`; // Formázás: Év-hónap-nap óra:perc
    }
</script>


{#if loading}
    <div id="loading" class="container d-flex justify-content-center">
        <div class="spinner-border mx-2" role="status"></div>
        <span class="sr-only">Loading...</span>
    </div>
{:else}
<div class="container mt-5">
    <h2 class="mb-4"> Beadott feladatok </h2>
    <table class="table table-striped">
        <thead>
            <tr>
                <th>Feladat neve</th>
                <th>Beadás ideje</th>
                <th>Beadott link</th>
                <th>Érdemjegy</th>
            </tr>
        </thead>
        <tbody>
            {#each submissions as submission}
            <tr>
                <td>{submission.taskName || "N/A"}</td>
                <td>{submission.submittedAt || "N/A"}</td>
                <td>
                    {#if submission.submissionLink}
                    <a href={submission.submissionLink} target="_blank">Megtekintés</a>
                    {:else}
                    Nincs link
                    {/if}
                </td>
                <td>{submission.grade || "N/A"}</td>
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
