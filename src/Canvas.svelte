<script>
    export let resize = true;
    import paperCanvas from "./paperCanvas.ts";
</script>

<div class="header">
    <div>
        <button id="play">Turn up the volume</button>
    </div>
    <div>
        <button id="sine">sine</button>
        <button id="noise">noise</button>
        <button id="flat">flat</button>
    </div>
</div>

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

    .header {
        display: flex;
        justify-content: space-between;
    }
</style>
