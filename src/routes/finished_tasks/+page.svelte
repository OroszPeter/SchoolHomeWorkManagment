<script>
    import { onMount } from "svelte";
    import API_Url from '../../config.js';

    let loggedIn = false;
    let submissions = [];
    let loading = true;
    let error = null;
    let token = null;
    let showModal = false;
    let selectedSubmission = null;
    let gradeInput = "";

    let selectedAssignment = "all"; // Alapértelmezett: mindent megjelenít
    let assignmentNames = []; // Egyedi feladatnevek listája

    function checkLogin() {
        token = localStorage.getItem("jwtToken");
        loggedIn = !!token;
    }

    async function fetchSubmissions() {
        loading = true;
        try {
            const response = await fetch(
                `${API_Url}/api/Submissions/get-all`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            if (!response.ok) {
                throw new Error("Hiba történt a beadások lekérésekor");
            }

            const data = await response.json();
            // Rendezés a beadási idő szerint csökkenő sorrendben
            submissions = data.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
            // Egyedi feladatnevek kigyűjtése
            assignmentNames = [...new Set(submissions.map(sub => sub.assignment.assignmentName))];
        } catch (error) {
            errorMessage = error.message;
        } finally {
            loading = false;
        }
    }

    function openEditModal(submission) {
        selectedSubmission = submission;
        gradeInput = submission.grade || "";
        showModal = true;
    }

    function closeModal() {
        showModal = false;
    }

    async function saveGrade() {
        if (!gradeInput || gradeInput < 1 || gradeInput > 5) {
            alert("Kérjük, adjon meg egy érvényes érdemjegyet (1-5 között)");
            return;
        }

        try {
            const response = await fetch(
                `${API_Url}/api/Submissions/update-grade/${selectedSubmission.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ grade: gradeInput })
                }
            );

            if (!response.ok) {
                throw new Error("Hiba történt az érdemjegy frissítésekor");
            }

            const updatedSubmissionIndex = submissions.findIndex(sub => sub.id === selectedSubmission.id);
            if (updatedSubmissionIndex !== -1) {
                submissions[updatedSubmissionIndex].grade = gradeInput;
            }
            
            closeModal();
        } catch (error) {
            alert(error.message);
        }
    }

    async function deleteSubmission(submissionId) {
        const confirmDelete = confirm("Biztosan törölni szeretnéd ezt a beadást?");
        if (!confirmDelete) return;

        try {
            const response = await fetch(
                `${API_Url}/api/Submissions/delete/${submissionId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Hiba történt a beadás törlésekor");
            }

            submissions = submissions.filter(sub => sub.id !== submissionId);
        } catch (error) {
            alert(error.message);
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

        <!-- Dropdown szűrő -->
        <div class="filter-container mb-4">
            <label for="assignmentFilter" class="form-label">Szűrés feladat szerint:</label>
            <select id="assignmentFilter" bind:value={selectedAssignment} class="form-select">
                <option value="all">Összes feladat</option>
                {#each assignmentNames as name}
                    <option value={name}>{name}</option>
                {/each}
            </select>
        </div>

        <!-- Submissions Table -->
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
                {#each submissions.filter(sub => selectedAssignment === "all" || sub.assignment.assignmentName === selectedAssignment) as submission}
                    <tr>
                        <td>{submission.assignment.assignmentName}</td>
                        <td>{submission.user.firstName} {submission.user.lastName}</td>
                        <td>{new Date(submission.submittedAt).toLocaleString("hu-HU", { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                        <td><a href={submission.submissionLink} target="_blank">GitHub Link</a></td>
                        <td>{submission.grade}</td>
                        <td>
                            <a href="#" class="btn btn-sm btn-primary me-2" on:click|preventDefault={() => openEditModal(submission)}>
                                <i class="bi bi-pencil-square"></i> Szerkesztés
                            </a>
                            <a href="#" class="btn btn-sm btn-danger" on:click|preventDefault={() => deleteSubmission(submission.id)}>
                                <i class="bi bi-trash"></i> Törlés
                            </a>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

    <!-- Modal for editing grade -->
    {#if showModal}
        <div class="modal-overlay" on:click={closeModal}></div>
        <div class="modal">
            <div class="modal-header">
                <h5>Érdemjegy Szerkesztése</h5>
                <button on:click={closeModal} class="close-button">&times;</button>
            </div>
            <div class="modal-body">
                <label for="gradeInput">Érdemjegy (1-5):</label>
                <input
                    type="number"
                    id="gradeInput"
                    min="1"
                    max="5"
                    bind:value={gradeInput}
                />
            </div>
            <div class="modal-footer">
                <button on:click={closeModal} class="btn btn-secondary">Bezárás</button>
                <button class="btn btn-primary" on:click={saveGrade}>Mentés</button>
            </div>
        </div>
    {/if}
{/if}

<style>
    #loading {
        margin-top: 20%;
    }
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
    }
    .modal {
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        width: 300px;
        max-width: 90%;
        position: fixed;
        z-index: 20;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        margin-bottom: 1rem;
    }
    .close-button {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
    }
    .modal-body {
        margin-bottom: 1rem;
        width: 100%;
    }
    .modal-footer {
        display: flex;
        justify-content: flex-end;
        width: 100%;
    }
    .filter-container {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .filter-container label {
        font-weight: bold;
    }
</style>
