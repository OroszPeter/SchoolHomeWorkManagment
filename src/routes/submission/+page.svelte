<script>
    import { onMount } from "svelte";
    import { userStore } from "../../store"; // Már importálva van
    import API_Url from '../../config.js';

    let token = "";
    let loggedIn = false;

    let assignments = [];
    let selectedAssignmentId = "";
    let submissionLink = "";
    let userId = ""; // Ezt fogjuk a store-ból kapni
    let errorMessage = ""; // Hibaüzenet tárolására

    // Felhasználó adatok lekérése a store-ból
    userStore.subscribe((user) => {
        userId = user.id; // Itt kapjuk meg az id-t a store-ból
    });

    function checkLogin() {
        token = localStorage.getItem("jwtToken");
        loggedIn = !!token;
    }

    // Dátum ellenőrzés segédfüggvény (összehasonlítja a mai dátummal)
    function isDueDatePassed(dueDate) {
        const currentDate = new Date();
        return new Date(dueDate) < currentDate;
    }

    onMount(async () => {
        checkLogin();
    });

    // Feladatok lekérése
    onMount(async () => {
        const token = localStorage.getItem("jwtToken"); // Token lekérése a localStorage-ból
        if (!token) {
            console.error("Nincs token, kérjük jelentkezzen be újra."); // Hibaüzenet token hiányában
            return;
        }

        try {
            const response = await fetch(
                `${API_Url}/api/Assignments/get-all`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`, // Token hozzáadása az Authorization fejlécbe
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Hiba a feladatok lekérésekor");
            }

            assignments = await response.json();
        } catch (error) {
            console.error(error);
        }
    });

    // Form adatok beküldése
    async function submitForm(event) {
        event.preventDefault();
        errorMessage = ""; // Hibaüzenet törlése a beküldés előtt

        // Ellenőrizd, hogy a beadási link végén van-e .git
        if (!submissionLink.endsWith(".git")) {
            errorMessage = "A beadási linknek .git végződéssel kell rendelkeznie.";
            return; // Ne folytassuk a beküldést
        }

        // Ellenőrizzük, hogy a kiválasztott feladat határideje nem járt-e le
        const selectedAssignment = assignments.find(a => a.id === selectedAssignmentId);
        if (selectedAssignment && isDueDatePassed(selectedAssignment.dueDate)) {
            errorMessage = "A kiválasztott feladat beadási határideje lejárt.";
            return; // Ne folytassuk a beküldést
        }

        const submissionData = {
            submissionLink: submissionLink,
            userId: userId, // A store-ból származó userId
            assignmentId: selectedAssignmentId,
        };

        const token = localStorage.getItem("jwtToken"); // Token lekérése a localStorage-ból

        try {
            const response = await fetch(
                `${API_Url}/api/Submissions/post`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`, // Token hozzáadása az Authorization fejlécbe
                    },
                    body: JSON.stringify(submissionData),
                }
            );

            if (response.ok) {
                alert("Feladat beadása sikeresen megtörtént!");
                // Űrlap mezők törlése
                submissionLink = "";
                selectedAssignmentId = "";
            } else {
                alert("Hiba a feladat beadása során.");
            }
        } catch (error) {
            console.error("Hiba a beküldés során:", error);
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
        <h2 class="mb-4">Feladat Beadása</h2>
        <form on:submit={submitForm}>
            <!-- Feladat kiválasztása lenyíló menü -->
            <div class="mb-3">
                <label for="taskSelect" class="form-label">Válaszd ki a feladatot</label>
                <select
                    class="form-select"
                    bind:value={selectedAssignmentId}
                    id="taskSelect"
                    required
                >
                    <option selected disabled>Válassz egy feladatot</option>
                    {#each assignments as assignment}
                        <option value={assignment.id} disabled={isDueDatePassed(assignment.dueDate)}>
                            {assignment.assignmentName} {#if isDueDatePassed(assignment.dueDate)}(Lejárt){/if}
                        </option>
                    {/each}
                </select>
            </div>

            <!-- Link input mező -->
            <div class="mb-3">
                <label for="submissionLink" class="form-label">Feladat beadása</label>
                <input
                    type="text"
                    class="form-control"
                    bind:value={submissionLink}
                    id="submissionLink"
                    placeholder="Link .git kiterjesztéssel"
                    required
                />
            </div>

            {#if errorMessage}
                <div class="alert alert-danger">{errorMessage}</div>
            {/if}

            <!-- Beküldés gomb -->
            <button type="submit" class="btn btn-primary">Beadás</button>
        </form>
    </div>
{/if}
