<script>
    import { isLoggedIn } from '../../store';
    import { onMount } from 'svelte';
    import API_Url from '../../config.js'

    let loggedIn = false;
    let token = '';

    let tasks = [];
    let loading = true;
    let error = null;

    // Feladatok lekérése az API-ról
    async function fetchTasks() {
    token = localStorage.getItem('jwtToken'); // Token lekérése a localStorage-ból
    if (!token) {
        error = 'Nincs token, kérjük jelentkezzen be újra.';
        return;
    }

    try {
        const response = await fetch(`${API_Url}/api/Assignments/get-all`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Token hozzáadása az Authorization fejlécbe
            }
            
        });

        if (!response.ok) {
            throw new Error('Hiba történt a feladatok betöltése során');
        }

        tasks = await response.json();
        loading = false;
    } catch (err) {
        error = err.message;
    } finally {
        loading = false;
    }
}


    function checkLogin() {
        token = localStorage.getItem('jwtToken');
        loggedIn = !!token;
    }

    // A feladatok betöltése csak akkor történik, ha a felhasználó be van jelentkezve
    onMount(() => {
        checkLogin();
        fetchTasks();
        }
    );
</script>

{#if !loggedIn}
    <div>
        <h1>Nem vagy bejelentkezve</h1>
        <p>Kérlek jelentkezz be a menüben.</p>
    </div>
{:else}
    {#if loading}
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
                    <div class="col-md-4">
                        <a href="/tasks/{task.id}" class="task-card-link">
                            <div class="card task-card shadow-sm">
                                <div class="card-body">
                                    <h5 class="card-title">{task.assignmentName}</h5>
                                    <p class="text-muted">Leírás: {task.description}</p>
                                    <p class="text-muted">Határidő: {new Date(task.dueDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </a>
                    </div>
                {/each}
            </div>
        </div>
    {/if}
{/if}

<style>
    .task-card {
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
    #loading {
        margin-top: 20%;
    }
</style>
