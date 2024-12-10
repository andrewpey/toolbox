const root = `https://voxeltycoon.xyz`;

/**
 * Converts Markdown text to BBCode.
 * @param text The Markdown text to convert.
 * @returns The converted BBCode text.
 */
export function convert(text: string): string {
    if (text === '')
        return '';

    text = text.replace(/thumb: \//g, `thumb: ${root}/`);
    text = text.replace(/\[(.*?)\]\((.*?)\)/g, (_, p1, p2) => `[url=${getUrl(p2)}]${p1}[/url]`);
    text = text.replace(/{% include img\.html src="(.*?)" alt="(.*?)" %}/g, (_, p1, p2) => `[img]${getUrl(p1)}[/img]\n[i]${p2}[/i]`);
    text = text.replace(/{% include img\.html src="(.*?)" %}/g, (_, p1) => `[img]${getUrl(p1)}[/img]`);
    text = text.replace(/{% include video\.html src="(.*?)" alt="(.*?)" %}/g, (_, p1, p2) => `[img]${getUrl(changeExtension(p1, '.webp'))}[/img]\n[i]${p2}[/i]`);
    text = text.replace(/{% include video\.html src="(.*?)" %}/g, (_, p1) => `[img]${getUrl(changeExtension(p1, '.webp'))}[/img]`);
    text = text.replace(/### (.*)/g, (_, p1) => `[h3]${p1.trim()}[/h3]`);
    text = text.replace(/## (.*)/g, (_, p1) => `[h2]${p1.trim()}[/h2]`);
    text = text.replace(/\*\*(.*?)\*\*/g, '[b]$1[/b]');
    text = text.replace(/\*(.*?)\*/g, '[i]$1[/i]');
    text = text.replace(/`(.*?)`/g, '[i]$1[/i]');
    text = text.replace(/<kbd>(.*?)<\/kbd>/g, '[i]$1[/i]');
    text = text.replace(/<code>(.*?)<\/code>/g, '[i]$1[/i]');
    text = text.replace(/^> (.*)/gm, (_, p1) => `[i]${p1.trim()}[/i]`);
    text = convertLists(text);

    text += "\n\n[url=https://discord.gg/voxeltycoon][img]https://discordapp.com/api/guilds/346672255084003329/embed.png?style=banner2[/img][/url]";

    return text;
}

/**
 * Resolves a URL to an absolute format if needed.
 * @param url The URL to resolve.
 * @returns The resolved URL.
 */
export function getUrl(url: string): string {
    if (url.startsWith('//')) {
        return `https:${url}`;
    } else if (url.startsWith('/')) {
        return `${root}${url}`;
    }
    return url;
}

/**
 * Changes the file extension of a URL or file path.
 * @param filePath The original file path or URL.
 * @param newExtension The new extension (e.g., ".webp").
 * @returns The file path or URL with the new extension.
 */
export function changeExtension(filePath: string, newExtension: string): string {
    return filePath.replace(/\.[^/.]+$/, newExtension);
}

/**
 * Converts Markdown lists to BBCode lists.
 * @param text The Markdown text containing lists.
 * @returns The text with BBCode lists.
 */
export function convertLists(text: string): string {
    const lines: string[] = [];
    const splitLines = text.split(/\r?\n/);

    let isInsideList = false;
    for (const line of splitLines) {
        if (line.startsWith('- ')) {
            if (!isInsideList) {
                isInsideList = true;
                lines.push("[list]");
            }
            lines.push(`[*] ${line.substring(2)}`);
        } else if (isInsideList) {
            if (!line.trim()) {
                lines.push("[/list]\n");
                isInsideList = false;
            }
        } else {
            lines.push(line);
        }
    }

    if (isInsideList) {
        lines.push("[/list]");
    }

    return lines.join('\n');
}
