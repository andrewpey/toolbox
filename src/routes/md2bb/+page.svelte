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

<div class="flex h-screen w-full flex-col md:flex-row">
    <textarea
        bind:value={md}
        class="flex-1 resize-none border-none bg-white p-4 text-lg focus:border-blue-300 focus:outline-none md:p-16"
    ></textarea>

    <div class="relative flex-1">
        <textarea
            class="h-full w-full resize-none border-none bg-gray-50 p-4 pt-16 text-lg focus:outline-none md:p-16 md:pt-16"
            readonly>{bb}</textarea
        >

        <button
            onclick={copy}
            class="absolute right-4 top-4 flex items-center justify-center rounded p-2 text-gray-300 hover:text-blue-300 focus:outline-none active:text-blue-400 md:right-6 md:top-6"
        >
            <span class="material-symbols-outlined">content_copy</span>
            {#if confetti}
                <div class="pointer-events-none fixed">
                    <Confetti x={[-0.5, 0.5]} y={[-0.5, 0.5]} />
                </div>
            {/if}
        </button>
    </div>
</div>

<style lang="postcss">
    @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap');

    textarea {
        font-family: 'Roboto Mono', serif;
    }
</style>
