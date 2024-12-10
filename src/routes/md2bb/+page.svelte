<script lang="ts">
    import { onMount, tick } from 'svelte';
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

<div class="flex h-dvh w-full flex-col sm:flex-row">
    <div class="flex flex-1">
        <textarea
            bind:value={md}
            class="flex-1 resize-none overscroll-contain border-none bg-white p-4 text-lg focus:outline-none sm:p-16"
        ></textarea>
    </div>

    <div class="relative flex flex-1">
        <textarea
            class="flex-1 resize-none overscroll-contain border-none bg-gray-50 p-4 text-lg focus:outline-none sm:p-16"
            readonly>{bb}</textarea
        >

        <button
            onclick={copy}
            class="absolute right-4 top-4 flex items-center justify-center p-2 text-gray-300 hover:text-blue-300 focus:outline-none active:text-blue-400 sm:right-6 sm:top-6"
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
