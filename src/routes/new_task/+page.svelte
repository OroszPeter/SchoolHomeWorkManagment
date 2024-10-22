<script>
    import { onMount } from "svelte";
    import API_Url from '../../config.js'
    

    let loggedIn = false;
    let token = "";
    let assignmentName = "";
    let description = "";
    let dueDate = "";
    let attachments = [];
    let errorMessage = ""; // Hibaüzenet tárolására
    let successMessage = ""; // Sikerüzenet tárolására

    function checkLogin() {
        token = localStorage.getItem("jwtToken");
        loggedIn = !!token;
    }

    onMount(() => {
        checkLogin();
    });

    // Form adatok beküldése
    async function submitForm(event) {
        event.preventDefault();
        errorMessage = ""; // Hibaüzenet törlése a beküldés előtt
        successMessage = ""; // Sikerüzenet törlése a beküldés előtt

        const assignmentData = {
            assignmentName,
            description,
            dueDate,
        };

        try {
            // Első lépés: új feladat létrehozása
            const response = await fetch(
                `${API_Url}/api/Assignments/create`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`, // Token hozzáadása az Authorization fejlécbe
                    },
                    body: JSON.stringify(assignmentData),
                },
            );

            // Ellenőrizzük a választ
            if (response.status === 201) {
                // JSON válasz feldolgozása
                const createdAssignment = await response.json();
                const assignmentId = createdAssignment;
                console.log("Létrehozott feladat ID:", assignmentId);

                // Késleltetés a fájlok feltöltése előtt (500 ms késleltetés)
                await new Promise((resolve) => setTimeout(resolve, 500));

                // Második lépés: fájlok feltöltése
                if (attachments.length > 0) {
                    const formData = new FormData();
                    for (const file of attachments) {
                        formData.append("files", file); // Fájlok hozzáadása a FormData-hoz
                    }

                    const uploadResponse = await fetch(
                        `${API_Url}/api/Media/${assignmentId}/upload`,
                        {
                            method: "POST",
                            headers: {
                                Authorization: `Bearer ${token}`, // Token hozzáadása az Authorization fejlécbe
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

                successMessage =
                    "Feladat sikeresen létrehozva és fájlok feltöltve!";
                // Űrlap mezők törlése
                resetForm();
            } else {
                const errorText = await response.text();
                throw new Error(
                    `Hiba a feladat létrehozása során: ${errorText}`,
                );
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
            <!-- Feladat neve -->
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

            <!-- Feladat leírása -->
            <div class="mb-3">
                <label for="taskDescription" class="form-label"
                    >Feladat leírása</label
                >
                <textarea
                    class="form-control"
                    bind:value={description}
                    id="taskDescription"
                    rows="4"
                    placeholder="Feladat leírása"
                    required
                ></textarea>
            </div>

            <!-- Határidő (DatePicker) -->
            <div class="mb-3">
                <label for="taskDeadline" class="form-label">Határidő</label>
                <input
                    type="date"
                    class="form-control"
                    bind:value={dueDate}
                    id="taskDeadline"
                    required
                />
            </div>

            <!-- Csatolmányok feltöltése -->
            <div class="mb-3">
                <label for="taskAttachments" class="form-label"
                    >Csatolmányok feltöltése</label
                >
                <input
                    class="form-control"
                    type="file"
                    id="taskAttachments"
                    multiple
                    on:change={(event) =>
                        (attachments = Array.from(event.target.files))}
                />
            </div>

            {#if errorMessage}
                <div class="alert alert-danger">{errorMessage}</div>
            {/if}

            {#if successMessage}
                <div class="alert alert-success">{successMessage}</div>
            {/if}

            <!-- Létrehozás gomb -->
            <button type="submit" class="btn btn-primary"
                >Feladat létrehozása</button
            >
        </form>
    </div>
{/if}
