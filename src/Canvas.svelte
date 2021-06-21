<script>
    export let resize = true;
    import paperCanvas from "./paperCanvas.js";
</script>

{#if !resize}
    <canvas use:paperCanvas />
{:else}
    <canvas use:paperCanvas resize />
{/if}

<style>
    /* Scale canvas with resize attribute to full size */
    canvas[resize] {
        width: 100%;
        height: 100%;
    }
    canvas {
        border: 1px solid black;
    }
</style>
