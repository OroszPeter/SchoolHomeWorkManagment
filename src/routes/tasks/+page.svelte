<script>
    import { onMount } from "svelte";
    import API_Url from "../../config.js";

    let loggedIn = false;
    let token = "";
    let tasks = [];
    let submissions = []; // Beadott feladatok tárolása (assignmentId)
    let loading = true;
    let error = null;

// Függvény, ami eldönti, hogy a kártya szürke legyen-e
function getCardClass(task) {
    // Ellenőrizni, hogy a feladat határideje lejárt-e
    const dueDate = new Date(task.dueDate);
    const isPastDue = dueDate < new Date();

    // Ellenőrizni, hogy a felhasználó beadta-e a feladatot
    const isSubmitted = submissions.includes(task.id); // A task.id-t hasonlítjuk össze a submission.assignmentId-vel

    // console.log(
    //     "Checking submission for task ID:",
    //     task.id,
    //     "Is submitted:", isSubmitted,
    //     "Is past due:", isPastDue
    // );

    // Ha a feladat lejárt, akkor inaktív osztályt adunk
    if (isPastDue) {
        return "inactive";
    }

    // Ha a feladatot beadta a felhasználó, akkor submitted osztályt adunk
    if (isSubmitted) {
        return "submitted";
    }

    // Ha egyik feltétel sem teljesül, nem adunk semmilyen osztályt
    return "";
}




    // Feladatok lekérése az API-ról
    async function fetchTasks() {
        token = localStorage.getItem("jwtToken"); // Token lekérése a localStorage-ból
        if (!token) {
            error = "Nincs token, kérjük jelentkezzen be újra.";
            return;
        }

        try {
            const response = await fetch(`${API_Url}/api/Assignments/get-all`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`, // Token hozzáadása az Authorization fejlécbe
                },
            });

            if (!response.ok) {
                throw new Error("Hiba történt a feladatok betöltése során");
            }

            tasks = await response.json();
            // console.log("Fetched tasks:", tasks); // Console log a feladatok lekérése után
            fetchSubmissions(); // Beadott feladatok lekérése
        } catch (err) {
            error = err.message;
        } finally {
            loading = false;
        }
    }

    // Beadott feladatok lekérése
    async function fetchSubmissions() {
    token = localStorage.getItem("jwtToken"); // Token újra lekérése
    try {
        const response = await fetch(
            `${API_Url}/api/Submissions/get-user-submissions`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`, // Token hozzáadása az Authorization fejlécbe
                },
            },
        );

        if (!response.ok) {
            throw new Error("Hiba történt a beadott feladatok lekérésekor");
        }

        const data = await response.json();
        // console.log("Fetched submissions:", data); // Console log a beadott feladatok lekérése után

// A beadott feladatok assignmentId-jait tároljuk
submissions = data.map((submission) => submission.assignmentId); // Az assignmentId értékeket tároljuk

        // console.log("Submissions assignmentIds:", submissions); // Console log a beadott feladatok assignmentId-jairól
    } catch (err) {
        error = err.message;
    }
}


    function checkLogin() {
        token = localStorage.getItem("jwtToken");
        loggedIn = !!token;
    }

    onMount(async () => {
    checkLogin();
    await fetchSubmissions(); // Először a beadott feladatok lekérése
    await fetchTasks(); // Majd a feladatok lekérése
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
        <h2 class="mb-4">Aktuális Feladatok</h2>
        <div class="row g-3">
            {#each tasks as task}
                <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                    <a href="/tasks/{task.id}" class="task-card-link">
                        <div class="card task-card shadow-sm {getCardClass(task)}">
                            <div class="card-body">
                                <h5 class="card-title">
                                    {task.assignmentName}
                                </h5>
                                <p class="card-description text-muted">
                                    {task.description}
                                </p>
                                <p class="text-muted">
                                    Határidő: {new Date(task.dueDate).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        
                    </a>
                </div>
            {/each}
        </div>
    </div>
{/if}

<style>
    .task-card {
        display: flex;
        flex-direction: column;
        height: 100%;
        cursor: pointer;
        transition: transform 0.2s ease;
    }

    .task-card:hover {
        transform: scale(1.02);
    }

    .task-card-link {
        text-decoration: none;
        color: inherit;
    }

    .task-card .card-body {
        flex-grow: 1;
    }

    .task-card.inactive {
        background-color: #f0f0f0;
        opacity: 0.6;
    }

    /* Leírás 2 sorban való megjelenítése */
    .card-description {
        display: -webkit-box;
        -webkit-line-clamp: 2; /* Két sorra korlátozás */
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis; /* Három ponttal elrejtett túlcsorduló szöveg */
    }

    #loading {
        margin-top: 20%;
    }

    /* A lejárt határidejű feladatok szürkítése */
.inactive {
    background-color: #f0f0f0; /* Világosszürke háttér */
    opacity: 0.6; /* Kisebb átlátszóság */
}

/* A beadott feladatok zöld színezése */
.submitted {
    background-color: #d4edda; /* Zöld háttér */
    border: 1px solid #c3e6cb; /* Zöld szegély */
}

</style>
