<script>
    import Navbar from "../component/Navbar.svelte";

</script>


<div class="d-flex flex-row">
    <Navbar/>
    <main class="w-100">
        <slot/>
    </main>
</div>

<style>
.dashboard-container {
    display: flex;
    min-height: 100vh;
}

/* Oldalsó menü stílusok */
.menu {
    width: 250px;
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

/* Tartalom stílusok */
.content {
    flex: 1;
    padding: 40px;
    background-color: #fff;
}
</style>
