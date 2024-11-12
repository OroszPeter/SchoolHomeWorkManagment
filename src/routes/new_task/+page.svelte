<script>
    import { onMount } from "svelte";
    import API_Url from '../../config.js'
    
    let loggedIn = false;
    let token = "";
    let assignmentName = "";
    let description = "";
    let dueDate = ""; 
    let attachments = [];
    let errorMessage = "";
    let successMessage = "";
    
    function checkLogin() {
        token = localStorage.getItem("jwtToken");
        loggedIn = !!token;
    }

    onMount(() => {
        checkLogin();
    });

    async function submitForm(event) {
        event.preventDefault();
        errorMessage = "";
        successMessage = "";

        const assignmentData = {
            assignmentName,
            description,
            dueDate,
        };

        try {
            const response = await fetch(
                `${API_Url}/api/Assignments/create`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(assignmentData),
                },
            );

            if (response.status === 201) {
                const createdAssignment = await response.json();
                const assignmentId = createdAssignment;
                console.log("Létrehozott feladat ID:", assignmentId);

                await new Promise((resolve) => setTimeout(resolve, 500));

                if (attachments.length > 0) {
                    const formData = new FormData();
                    for (const file of attachments) {
                        formData.append("files", file);
                    }

                    const uploadResponse = await fetch(
                        `${API_Url}/api/Media/${assignmentId}/upload`,
                        {
                            method: "POST",
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                            body: formData,
                        },
                    );

                    if (!uploadResponse.ok) {
                        const errorText = await uploadResponse.text();
                        throw new Error(
                            "Hiba a fájlok feltöltése során: " + errorText,
                        );
                    }
                }

                successMessage = "Feladat sikeresen létrehozva és fájlok feltöltve!";
                resetForm();
            } else {
                const errorText = await response.text();
                throw new Error(`Hiba a feladat létrehozása során: ${errorText}`);
            }
        } catch (error) {
            errorMessage = error.message;
            console.error(error);
        }
    }

    function resetForm() {
        assignmentName = "";
        description = "";
        dueDate = "";
        attachments = [];

        // Ezzel beállítjuk az input értékét üresre
        const fileInput = document.getElementById("taskAttachments");
        if (fileInput) {
            fileInput.value = ""; // Ürítsük ki a fájlmegválasztó mezőt
        }
    }
</script>


{#if !loggedIn}
    <div>
        <h1>Nem vagy bejelentkezve</h1>
        <p>Kérlek jelentkezz be a menüben.</p>
    </div>
{:else}
    <div class="container my-5">
        <h2 class="mb-4">Új Feladat Létrehozása</h2>
        <form on:submit={submitForm}>
            <div class="mb-3">
                <label for="taskName" class="form-label">Feladat neve</label>
                <input
                    type="text"
                    class="form-control"
                    bind:value={assignmentName}
                    id="taskName"
                    placeholder="Feladat neve"
                    required
                />
            </div>

            <div class="mb-3">
                <label for="taskDescription" class="form-label">Feladat leírása</label>
                <textarea
                    class="form-control"
                    bind:value={description}
                    id="taskDescription"
                    rows="4"
                    placeholder="Feladat leírása"
                    required
                ></textarea>
            </div>

            <!-- Due Date and Time -->
            <div class="mb-3">
                <label for="taskDeadline" class="form-label">Határidő</label>
                <input
                    type="datetime-local"
                    class="form-control"
                    bind:value={dueDate}
                    id="taskDeadline"
                    required
                />
            </div>

            <div class="mb-3">
                <label for="taskAttachments" class="form-label">Csatolmányok feltöltése</label>
                <input
                    class="form-control"
                    type="file"
                    id="taskAttachments"
                    multiple
                    on:change={(event) => (attachments = Array.from(event.target.files))}
                />
            </div>

            {#if errorMessage}
                <div class="alert alert-danger">{errorMessage}</div>
            {/if}

            {#if successMessage}
                <div class="alert alert-success">{successMessage}</div>
            {/if}

            <button type="submit" class="btn btn-primary">Feladat létrehozása</button>
        </form>
    </div>
{/if}
