import { applyVariation, type ComponentDefinition, type StyledComponent } from '../components/index.js';
import type { Quaternion } from '../seed/quaternion.js';
import type { AestheticRegion } from '../seed/regions.js';

const MARKER_COMPONENTS: Readonly<Record<string, ComponentDefinition>> = {
  'asymm-card': {
    name: 'HoloCard',
    file: 'src/lib/components/HoloCard.svelte',
    category: 'interactive-3d',
    description: 'Seed-styled content card'
  },
  'code-block': {
    name: 'VoidTerminal',
    file: 'src/lib/components/VoidTerminal.svelte',
    category: 'cyberpunk',
    description: 'Terminal-styled code block'
  },
  diagram: {
    name: 'GravityGrid',
    file: 'src/lib/components/GravityGrid.svelte',
    category: 'physics-interactive',
    description: 'Diagram container'
  },
  'breakthrough-box': {
    name: 'KintsugiAlert',
    file: 'src/lib/components/KintsugiAlert.svelte',
    category: 'feedback',
    description: 'Breakthrough callout'
  },
  'key-discovery': {
    name: 'KintsugiAlert',
    file: 'src/lib/components/KintsugiAlert.svelte',
    category: 'feedback',
    description: 'Key discovery callout'
  },
  'reference-item': {
    name: 'ShojiModal',
    file: 'src/lib/components/ShojiModal.svelte',
    category: 'modal-dialog',
    description: 'Reference item'
  }
};

const ALLOWED_TAGS: ReadonlySet<string> = new Set([
  'a',
  'article',
  'aside',
  'blockquote',
  'br',
  'code',
  'div',
  'em',
  'figcaption',
  'figure',
  'h1',
  'h2',
  'h3',
  'h4',
  'li',
  'ol',
  'p',
  'pre',
  'section',
  'span',
  'strong',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'ul'
]);

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function stripTags(value: string): string {
  return value.replace(/<[^>]*>/g, '');
}

function removeDangerousBlocks(value: string): string {
  return value.replace(/<(script|style|iframe|object|embed|svg|math)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
}

function isSafeGeneratedStyle(value: string): boolean {
  return value
    .split(';')
    .filter((part: string) => part.trim().length > 0)
    .every((declaration: string) => /^--asymm-[a-z0-9-]+:\s*[#(),.%\w\s-]+$/i.test(declaration.trim()));
}

function sanitizeAttributes(attributeSource: string): string {
  const attributes: string[] = [];
  const attributePattern: RegExp = /\s([a-zA-Z:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let match: RegExpExecArray | null = attributePattern.exec(attributeSource);

  while (match) {
    const name: string = match[1].toLowerCase();
    const value: string = match[2] ?? match[3] ?? match[4] ?? '';
    const safeValue: string = value.trim();

    if (name === 'style' && isSafeGeneratedStyle(safeValue)) {
      attributes.push(`${name}="${escapeHtml(safeValue)}"`);
    } else if (
      (name === 'class' ||
        name === 'id' ||
        name === 'href' ||
        name === 'aria-label' ||
        name === 'data-component' ||
        name === 'data-region') &&
      !safeValue.toLowerCase().startsWith('javascript:')
    ) {
      attributes.push(`${name}="${escapeHtml(safeValue)}"`);
    }

    match = attributePattern.exec(attributeSource);
  }

  return attributes.length > 0 ? ` ${attributes.join(' ')}` : '';
}

function sanitizeSemanticHtml(html: string): string {
  const withoutDangerousBlocks: string = removeDangerousBlocks(html);

  return withoutDangerousBlocks.replace(/<\/?([a-zA-Z0-9-]+)([^>]*)>/g, (tag: string, name: string, attrs: string) => {
    const tagName: string = name.toLowerCase();

    if (!ALLOWED_TAGS.has(tagName)) {
      return escapeHtml(tag);
    }

    if (tag.startsWith('</')) {
      return `</${tagName}>`;
    }

    const suffix: string = tag.endsWith('/>') || tagName === 'br' ? ' /' : '';
    return `<${tagName}${sanitizeAttributes(attrs)}${suffix}>`;
  });
}

function styleAttribute(component: StyledComponent): string {
  const declarations: string[] = Object.entries(component.cssVariables).map(
    ([name, value]: readonly [string, string]) => `${name}: ${escapeHtml(value)}`
  );

  return declarations.join('; ');
}

function renderComponent(component: StyledComponent, content: string): string {
  const safeContent: string = escapeHtml(stripTags(removeDangerousBlocks(content)).trim());
  const label: string = escapeHtml(component.description);
  const style: string = styleAttribute(component);

  return `<section class="asymm-transmuted ${component.name.toLowerCase()}" data-component="${escapeHtml(component.name)}" data-region="${escapeHtml(component.region)}" aria-label="${label}" style="${style}">${safeContent}</section>`;
}

function markerPattern(marker: string): RegExp {
  return new RegExp(`<div\\s+class=["']${marker}["']\\s*>\\s*([\\s\\S]*?)\\s*<\\/div>`, 'gi');
}

export function transmute(html: string, quaternion: Quaternion, region: AestheticRegion): string {
  let output: string = html;

  for (const [marker, definition] of Object.entries(MARKER_COMPONENTS)) {
    output = output.replace(markerPattern(marker), (_match: string, content: string) => {
      const component: StyledComponent = applyVariation(definition, quaternion, region);
      return renderComponent(component, content);
    });
  }

  output = output.replace(/<(h[1-3])([^>]*)>([\s\S]*?)<\/\1>/gi, (_match: string, tag: string, attrs: string, content: string) => {
    const safeTag: string = tag.toLowerCase();
    const safeText: string = escapeHtml(stripTags(content).trim());
    return `<${safeTag}${sanitizeAttributes(attrs)}><span class="text-bloom">${safeText}</span></${safeTag}>`;
  });

  return sanitizeSemanticHtml(output);
}
