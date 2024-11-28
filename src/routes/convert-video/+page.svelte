<script lang="ts">
    import { fade } from 'svelte/transition';
    import { FFmpeg } from '@ffmpeg/ffmpeg';
    import { onMount } from 'svelte';

    type State = 'loading.ffmpeg' | 'loaded' | 'convert.start' | 'convert.error' | 'convert.done';
    type QueueItem = {
        file: File;
        progress: number;
    };

    let currentState = $state<State>('loading.ffmpeg');
    let error = $state('');
    let ffmpeg: FFmpeg;
    let items = $state<QueueItem[]>([]);
    let currentItem: QueueItem | undefined;
    let isDragOver = $state(false);
    let outputFormat = $state<'mp4' | 'webp'>('mp4');

    onMount(() => {
        const hashFormat = window.location.hash.slice(1);
        if (hashFormat === 'mp4' || hashFormat === 'webp') {
            outputFormat = hashFormat;
        }
        loadFFmpeg();
    });

    $effect(() => {
        window.location.hash = outputFormat;
    });

    function toPercentString(progress: number) {
        return `${(progress * 100).toFixed(0)}%`;
    }

    async function loadFFmpeg() {
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

        ffmpeg = new FFmpeg();

        ffmpeg.on('log', ({ message }) => {
            console.log(message);
        });

        ffmpeg.on('progress', (event) => {
            if (currentItem) {
                currentItem.progress = event.progress;
            }
        });

        await ffmpeg.load({
            coreURL: `${baseURL}/ffmpeg-core.js`,
            wasmURL: `${baseURL}/ffmpeg-core.wasm`
        });

        currentState = 'loaded'; // FFmpeg loaded
    }

    async function processFiles(files: File[]) {
        currentState = 'convert.start';
        items = files.map((file) => ({
            file,
            progress: 0
        }));

        for (const item of items) {
            currentItem = item;
            const videoData = await readFile(item.file);

            await ffmpeg.writeFile('input.mp4', videoData);
            if (outputFormat === 'webp') {
                await ffmpeg.exec([
                    '-i',
                    'input.mp4',
                    '-vf',
                    'fps=30,scale=700:-1:flags=lanczos',
                    '-c:v',
                    'libwebp',
                    '-loop',
                    '0',
                    '-q:v',
                    '80',
                    '-preset',
                    'default',
                    '-an',
                    'output.webp'
                ]);

                const data = await ffmpeg.readFile('output.webp');
                downloadFile(data as Uint8Array, 'video.webp', 'image/webp');
            } else {
                await ffmpeg.exec(['-i', 'input.mp4', '-an', 'output.mp4']);

                const data = await ffmpeg.readFile('output.mp4');
                downloadFile(data as Uint8Array, 'video.mp4', 'video/mp4');
            }

            item.progress = 1;
        }

        currentState = 'convert.done';
    }

    async function handleFileInput(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;

        await processFiles([...input.files]);
    }

    async function handleDrop(event: DragEvent) {
        event.preventDefault();
        isDragOver = false;

        if (!event.dataTransfer || event.dataTransfer.files.length === 0) return;

        await processFiles([...event.dataTransfer.files]);
    }

    async function readFile(file: File): Promise<Uint8Array> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => {
                const result = reader.result;
                if (result instanceof ArrayBuffer) {
                    resolve(new Uint8Array(result));
                } else {
                    reject('File read error: result is not an ArrayBuffer');
                }
            };

            reader.onerror = () => {
                error = 'Could not load file';
            };

            reader.readAsArrayBuffer(file);
        });
    }

    function downloadFile(data: Uint8Array, filename: string, mimeType: string) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([data.buffer], { type: mimeType }));
        a.download = filename;
        a.click();
    }
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-200 text-gray-900">
    <div class="w-full max-w-lg p-6 text-center">
        {#if currentState === 'loading.ffmpeg'}
            <p class="text-gray-400">Loading FFmpeg, please wait...</p>
        {/if}
        {#if currentState === 'loaded' && items.length === 0}
            <div class="mb-4 flex justify-center">
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label class="mr-2">Output:</label>
                <label>
                    <input
                        type="radio"
                        name="outputFormat"
                        value="mp4"
                        bind:group={outputFormat}
                        checked={outputFormat === 'mp4'}
                    />
                    MP4
                </label>
                <label class="ml-2">
                    <input
                        type="radio"
                        name="outputFormat"
                        value="webp"
                        bind:group={outputFormat}
                        checked={outputFormat === 'webp'}
                    />
                    WebP
                </label>
            </div>
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <div
                class="flex cursor-pointer items-center justify-center rounded-lg border-4 border-dashed border-gray-300 py-24 transition hover:bg-gray-300"
                class:is-drag-over={isDragOver}
                ondrop={handleDrop}
                ondragover={(event) => {
                    event.preventDefault();
                    isDragOver = true;
                }}
                ondragenter={() => (isDragOver = true)}
                ondragleave={() => (isDragOver = false)}
                onclick={() => document.getElementById('fileInput')?.click()}
            >
                <p class="text-gray-400">Drag MP4 videos here or click to select</p>
                <input
                    id="fileInput"
                    accept=".mp4"
                    type="file"
                    multiple
                    class="hidden"
                    onchange={handleFileInput}
                />
            </div>
        {/if}

        {#if currentState === 'convert.start' || currentState === 'convert.done'}
            {#each items as item}
                <div class="mb-4 rounded-lg bg-white p-4 text-gray-500">
                    <div class="flex items-center">
                        <p class="text-lg font-medium">{item.file.name}</p>
                        <p class="ml-auto text-sm text-gray-400">
                            {toPercentString(item.progress)}
                        </p>
                    </div>
                    <div class="mt-2 h-2 w-full rounded-full bg-gray-200">
                        <div
                            class="h-2 rounded-full bg-green-500"
                            style="width: {toPercentString(
                                item.progress
                            )}; transition: width 0.5s ease;"
                        ></div>
                    </div>
                </div>
            {/each}
        {/if}

        {#if error}
            <p class="mt-4 text-red-500" in:fade>{error}</p>
        {/if}
    </div>
</div>

<style lang="postcss">
    .is-drag-over {
        @apply bg-gray-300;
    }
</style>
