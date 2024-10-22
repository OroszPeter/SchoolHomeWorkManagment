import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';


/** @type {import('@sveltejs/kit').Config}*/
const config = {
    preprocess : vitePreprocess(),
    kit: {
        paths: {
            base: '/SchoolHomeWorkManagment'
        },
        adapter: adapter({
            fallback: '404.html'
        }),
        // Ellenőrizd, hogy van-e bármi extra útvonal konfiguráció, ami akadályozhatja
        // a dinamikus útvonalak megfelelő működését
    }
};

export default config