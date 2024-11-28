<script>
    import { userStore, isLoggedIn } from "../store.js"; // Importáljuk a felhasználói adat store-t
    let user = {};
    let countdown = 0;
    let countdownInterval;

    // Bejelentkezési idő mentése
    function setLoginTime() {
        if (typeof window !== "undefined") {
            const loginTime = Date.now(); // Az aktuális idő
            localStorage.setItem("loginTime", loginTime);
        }
    }

    // Visszaszámláló frissítése
    function updateCountdown() {
        if (typeof window !== "undefined") {
            const loginTime = localStorage.getItem("loginTime");
            if (loginTime) {
                const elapsed = Date.now() - loginTime;
                const remaining = 600000 - elapsed; // 24 óra milliszekundumban
                countdown = Math.max(0, remaining); // Ha elértük a 0-t, akkor ne menjünk negatívba
            }
        }
    }

    // Kijelentkezés funkció
    function logout(event) {
        event.preventDefault(); // Megakadályozza az alapértelmezett linkre kattintás viselkedést (újratöltés)

        if (typeof window !== "undefined") {
            localStorage.removeItem("jwtToken"); // Törli a jwtToken-t
            localStorage.removeItem("loginTime"); // Törli a bejelentkezési időt
            localStorage.clear(); // Eltávolít minden adatot a localStorage-ból
        }

        isLoggedIn.set(false); // Beállítjuk, hogy a felhasználó ki van jelentkezve
        userStore.set({ username: "", email: "" }); // Ürítjük a userStore-t
        window.location.href = "/"; // Átirányítás a főoldalra
    }

    // Automatikus kijelentkezés, ha lejárt a 24 óra
    function checkAutoLogout() {
        updateCountdown();
        if (countdown <= 0) {
            logout({ preventDefault: () => {} }); // Kijelentkezés, ha lejárt a 24 óra
        }
    }

    // Figyeljük a userStore-t, és frissítjük a user adatokat
    $: userStore.subscribe((value) => {
        user = value;
    });

    // Indítsuk el a visszaszámlálót
    $: {
        if ($isLoggedIn) {
            const loginTime = localStorage.getItem("loginTime");
            if (!loginTime) {
                setLoginTime(); // Ha még nincs mentett idő, akkor mentjük el
            }
            countdownInterval = setInterval(checkAutoLogout, 1000); // Frissítjük másodpercenként
        } else {
            clearInterval(countdownInterval); // Ha kijelentkezett, leállítjuk a visszaszámlálót
        }
    }

    // Az oldal betöltésekor ellenőrizzük a visszaszámlálót
    updateCountdown();

    // Formázza a visszaszámláló órát, percet és másodpercet kétjegyű számokká
    function formatTimeUnit(unit) {
        return String(unit).padStart(2, '0'); // 1 -> "01", 10 -> "10"
    }
</script>

{#if $isLoggedIn}
<div class="dashboard-container">
    <nav class="menu min-vh-100">
        <h4 class="mb-4"><a href="/">Menu</a></h4>

        <a href="/tasks">
            <i class="bi bi-list-task"></i> Feladatok
        </a>

        {#if user.roles && user.roles[0] === "User"}
            <a href="/submission">
                <i class="bi bi-upload"></i> Feladat beadása
            </a>
            <a href="/result">
                <i class="bi bi-check"></i> Eredmények
            </a>
        {/if}

        {#if user.roles && user.roles[0] === "Admin"}
            <a href="/finished_tasks">
                <i class="bi bi-check2-square"></i> Beadott feladatok
            </a>
            <a href="/new_task">
                <i class="bi bi-file-earmark-plus"></i> Új feladat létrehozása
            </a>
            <a href="/register">
                <i class="bi bi-person-add"></i> Felhasználó regisztrálása
            </a>
        {/if}
        <a href="/change_password">
            <i class="bi bi-key"></i> Jelszó megváltoztatása
        </a>

        <a href="/" on:click={logout}>
            <i class="bi bi-box-arrow-right"></i> Kijelentkezés
        </a>

        <div class="user-info">
            <h5>{user.lastName} {user.firstName}</h5>
            <small>{user.email}</small><br>
            
            {#if user.roles && user.roles.length > 0}
            <small class="role">Szerepkör: {user.roles[0]}</small><br>
            {/if}
            <small class="countdown">{formatTimeUnit(Math.floor(countdown / 1000 / 60 / 60))}:{formatTimeUnit(Math.floor(countdown / 1000 / 60) % 60)}:{formatTimeUnit(Math.floor(countdown / 1000) % 60)}</small>
        </div>
    </nav>
</div>
{/if}

<style>
    .dashboard-container {
        display: flex;
        min-height: 100vh;
    }

    .menu {
        width: 300px;
        background-color: #f8f9fa;
        padding: 20px;
        box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
    }

    .menu a {
        display: flex;
        align-items: center;
        padding: 10px 15px;
        text-decoration: none;
        color: #333;
        font-size: 18px;
        border-radius: 4px;
        margin-bottom: 10px;
        transition: background-color 0.2s;
    }

    .menu a:hover {
        background-color: #e9ecef;
    }

    .menu i {
        margin-right: 10px;
    }

    .user-info {
        margin-top: auto;
        padding-top: 20px;
        border-top: 1px solid #dee2e6;
        color: #6c757d;
    }

    .user-info h5 {
        margin: 0;
        font-size: 18px;
    }

    .user-info .role {
        font-size: 14px;
        margin-top: 5px;
    }

    .countdown {
        font-size: 14px;
        color: gray;
    }
</style>
