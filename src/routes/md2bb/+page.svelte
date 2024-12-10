<script lang="ts">
    import { tick } from 'svelte';
    import { convert } from './md2bb';
    import { Confetti } from 'svelte-confetti';

    let md = $state('');
    let bb = $derived(convert(md));
    let confetti = $state(false);

    async function copy() {
        await navigator.clipboard.writeText(bb);
        confetti = false;
        await tick();
        confetti = true;
    }
</script>

<div class="flex h-screen w-full items-center justify-center">
    <textarea
        bind:value={md}
        class="h-full w-full resize-none border-none bg-white p-16 text-lg focus:border-blue-300 focus:outline-none"
    ></textarea>

    <textarea
        class="h-full w-full resize-none border-none bg-gray-50 p-16 text-lg focus:outline-none"
        readonly>{bb}</textarea
    >

    <!-- svelte-ignore a11y_consider_explicit_label -->
    <button
        onclick={copy}
        class="absolute right-10 top-10 flex items-center justify-center rounded p-2 text-gray-300 hover:text-blue-300 focus:outline-none active:text-blue-400"
    >
        <span class="material-symbols-outlined">content_copy</span>
        {#if confetti}
            <div class="pointer-events-none fixed">
                <Confetti x={[-0.5, 0.5]} y={[-0.5, 0.5]} />
            </div>
        {/if}
    </button>
</div>

<style lang="postcss">
    @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap');

    textarea {
        font-family: 'Roboto Mono', serif;
    }
</style>
