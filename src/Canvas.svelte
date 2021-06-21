<script>
    export let resize = true;
    import newPaperCanvas from "./paperCanvas.js";
</script>

{#if !resize}
    <canvas use:newPaperCanvas />
{:else}
    <canvas use:newPaperCanvas resize />
{/if}

<style>
    /* Scale canvas with resize attribute to full size */
    canvas[resize] {
        width: 100%;
        height: 100%;
    }
</style>
