<script>
    export let resize = true;
    import paperCanvas from "./paperCanvas.ts";
</script>

<button id="play">Turn up the volume</button>
<button id="clear">Clear</button>

{#if !resize}
    <canvas use:paperCanvas />
{:else}
    <canvas use:paperCanvas resize />
{/if}

<style>
    /* Scale canvas with resize attribute to full size */
    canvas[resize] {
        width: 100%;
        height: 90%;
    }
    canvas {
        border: 1px solid black;
    }
</style>
