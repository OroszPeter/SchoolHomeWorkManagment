<script>
    import { onMount } from "svelte";
    import API_Url from '../../../config.js'
    export let data; // `data` contains the task ID
    let task;
    let attachments = [];

    onMount(async () => {
        const token = localStorage.getItem("jwtToken"); // Token lekérése a localStorage-ból

        try {
            const response = await fetch(
                `${API_Url}/api/Assignments/${data.id}`,
                {
                    method: "GET", // GET metódus használata
                    headers: {
                        Authorization: `Bearer ${token}`, // Token hozzáadása az Authorization fejlécbe
                    },
                },
            );

            if (!response.ok) {
                throw new Error("Hiba történt a feladat betöltése során");
            }

            task = await response.json();
            if (task.mediaFiles) {
                attachments = task.mediaFiles; // Assuming `attachments` is part of the fetched task
            }
        } catch (err) {
            console.error("Error fetching task:", err.message); // Log the error for debugging
        }
    });

    // Dátum formázó függvény
    function formatDate(dateString) {
        const date = new Date(dateString);
        date.setHours(date.getHours());
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Hónap 0-tól kezdődik
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`; // Év-hónap-nap óra:perc formátum
    }
</script>

<div class="container">
    <div class="task-details-container bg-light p-4 rounded">
        <h2>Feladat neve: {task ? task.assignmentName : "Betöltés..."}</h2>
        <p>
            <strong>Leírás:</strong>
            {task ? task.description : "Betöltés..."}</p>
        <p>
            <strong>Határidő:</strong>
            {task ? formatDate(task.dueDate) : "Betöltés..."}
        </p>

        <h4>Csatolmányok</h4>
        {#if attachments.length > 0}
            <ul class="attachments-list">
                {#each attachments as attachment, index}
                    <li>
                        <i class="bi bi-paperclip"></i>
                        <a href={attachment}>Csatolmány {index + 1}.</a>
                    </li>
                {/each}
            </ul>
        {:else}
            <p>Nincsenek csatolmányok.</p>
        {/if}
    </div>
</div>

<style>
    .task-details-container {
        max-width: 800px;
        margin: 40px auto;
        padding: 20px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .attachments-list {
        list-style: none;
        padding-left: 0;
    }

    .attachments-list li {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
    }

    .attachments-list i {
        margin-right: 8px;
    }
</style>
