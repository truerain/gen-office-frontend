import Image from '@tiptap/extension-image';

const MIN_WIDTH = 80;

function parseWidthFromElement(element: HTMLElement): string | null {
  const dataWidth = element.getAttribute('data-width');
  if (dataWidth) return dataWidth;

  const inlineStyleWidth = element.style.width;
  if (inlineStyleWidth) return inlineStyleWidth;

  const widthAttr = element.getAttribute('width');
  if (widthAttr) return /^\d+$/.test(widthAttr) ? `${widthAttr}px` : widthAttr;

  return null;
}

export const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element: HTMLElement) => parseWidthFromElement(element),
        renderHTML: (attributes: Record<string, string | null>) => {
          if (!attributes.width) return {};
          return {
            'data-width': attributes.width,
            style: `width: ${attributes.width}; height: auto;`,
          };
        },
      },
    };
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const wrapper = document.createElement('span');
      wrapper.className = 'rte-resizable-image';
      wrapper.contentEditable = 'false';

      const image = document.createElement('img');
      image.className = 'rte-resizable-image__img';
      image.draggable = false;
      image.src = node.attrs.src ?? '';
      image.alt = node.attrs.alt ?? '';
      image.title = node.attrs.title ?? '';

      const resizeHandle = document.createElement('span');
      resizeHandle.className = 'rte-resizable-image__handle';

      const applyWidth = (width: string | null) => {
        if (width) {
          image.style.width = width;
          image.style.height = 'auto';
          wrapper.style.width = width;
        } else {
          image.style.removeProperty('width');
          image.style.height = 'auto';
          wrapper.style.removeProperty('width');
        }
      };

      const updateWidthAttribute = (nextWidth: string | null) => {
        if (typeof getPos !== 'function') return;
        const position = getPos();
        if (typeof position !== 'number') return;

        const transaction = editor.state.tr.setNodeMarkup(position, undefined, {
          ...node.attrs,
          width: nextWidth,
        });
        editor.view.dispatch(transaction);
      };

      applyWidth(node.attrs.width ?? null);

      resizeHandle.addEventListener('mousedown', (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();

        const startX = event.clientX;
        const startWidth = image.getBoundingClientRect().width;
        const editorWidth = editor.view.dom.getBoundingClientRect().width || Number.POSITIVE_INFINITY;
        let nextWidthPx = Math.round(startWidth);

        const onMouseMove = (moveEvent: MouseEvent) => {
          const delta = moveEvent.clientX - startX;
          const rawWidth = startWidth + delta;
          nextWidthPx = Math.max(MIN_WIDTH, Math.min(Math.round(rawWidth), Math.round(editorWidth)));
          applyWidth(`${nextWidthPx}px`);
        };

        const onMouseUp = () => {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
          updateWidthAttribute(`${nextWidthPx}px`);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });

      wrapper.appendChild(image);
      wrapper.appendChild(resizeHandle);

      return {
        dom: wrapper,
        update: (updatedNode) => {
          if (updatedNode.type.name !== node.type.name) return false;
          image.src = updatedNode.attrs.src ?? '';
          image.alt = updatedNode.attrs.alt ?? '';
          image.title = updatedNode.attrs.title ?? '';
          applyWidth(updatedNode.attrs.width ?? null);
          return true;
        },
      };
    };
  },
});
