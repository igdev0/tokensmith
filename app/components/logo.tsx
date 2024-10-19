import {forwardRef, Ref, SVGProps} from "react";
import {useThemeContext} from '@radix-ui/themes';

export default forwardRef(function Logo(props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) {
  const theme = useThemeContext();

  return (
      <svg
          xmlns="http://www.w3.org/2000/svg"
          id="Layer_2"
          data-name="Layer 2"
          viewBox="0 0 132.42 18.75"
          width={200}
          ref={ref}
          {...props}
      >
        <g id="Layer_1-2" data-name="Layer 1">
          <path
              fill={theme.appearance === 'dark' ? "#ffffff" : "#00003f"}
              d="M28.32 13.03h2.04V4.44h-1.72V6.6h-1.97V2.48h9.8v4.13H34.5V4.45h-1.7v8.58h2.02V15h-6.51v-1.97ZM37.57 10.53c0-.75.11-1.42.34-2s.55-1.08.97-1.48c.42-.41.92-.71 1.49-.92.58-.21 1.22-.31 1.94-.31.75 0 1.42.11 2.01.34.59.23 1.09.55 1.49.96.41.41.71.91.92 1.49.21.58.31 1.23.31 1.93 0 .75-.11 1.42-.34 2-.23.58-.55 1.08-.97 1.48-.42.41-.92.71-1.49.92-.58.21-1.22.31-1.94.31-.75 0-1.42-.11-2.01-.34-.59-.23-1.09-.55-1.49-.96s-.71-.91-.92-1.49c-.21-.58-.31-1.23-.31-1.93Zm2.4 0c0 .39.05.76.16 1.09.11.33.26.63.47.88.2.25.45.44.73.58s.61.21.98.21c.69 0 1.25-.22 1.69-.66.44-.44.65-1.14.65-2.09 0-.82-.2-1.49-.61-1.99-.41-.51-.98-.76-1.74-.76-.33 0-.64.05-.93.15-.29.1-.53.27-.74.49-.21.23-.37.51-.49.86s-.18.76-.18 1.25ZM47.67 2.48h3.79v7.14H52l2.93-3.56h2.74l-3.61 4.08 2.34 2.9h1.66v1.97h-2.9l-3.08-3.7h-.63v3.7h-2.33V4.44h-1.47V2.47ZM67.96 14.05c-.16.14-.35.28-.6.42-.25.14-.53.27-.86.38s-.69.21-1.08.29c-.39.07-.81.11-1.25.11-.76 0-1.45-.11-2.05-.32a4.11 4.11 0 0 1-1.53-.94c-.42-.41-.74-.91-.96-1.48s-.33-1.24-.33-1.98c0-.79.12-1.48.38-2.07.25-.59.59-1.08 1.03-1.48.43-.39.94-.69 1.53-.89.58-.2 1.22-.3 1.9-.3.45 0 .92.06 1.4.18.48.12.93.32 1.33.62.41.29.74.68.99 1.17.26.49.38 1.11.38 1.86 0 .51-.06 1.07-.18 1.66h-6.44c.01.38.09.7.24.97.15.26.35.48.59.64.24.17.52.29.84.37.32.08.65.12 1.01.12.71 0 1.3-.08 1.76-.25.46-.17.83-.37 1.12-.61l.77 1.52ZM64.1 7.66c-.31 0-.6.04-.88.13s-.52.21-.74.37-.4.37-.55.61c-.14.24-.23.52-.25.82h4.4c0-.6-.16-1.07-.49-1.41-.33-.35-.83-.52-1.49-.52ZM69.35 6.05h3.13l.27 1.18h.07c.27-.38.67-.72 1.18-1s1.13-.43 1.84-.43c.44 0 .86.06 1.24.18.39.12.72.32.99.59s.49.65.65 1.12c.16.47.24 1.05.24 1.74v5.56h-2.33V9.91c0-.73-.16-1.25-.49-1.57-.33-.32-.74-.48-1.24-.48-.44 0-.84.13-1.21.38-.36.26-.61.58-.74.96V15h-2.33V8.02h-1.29V6.05ZM87.06 12.53c0-.24-.15-.43-.44-.57-.29-.14-.65-.27-1.08-.39-.43-.12-.9-.24-1.41-.37-.51-.12-.98-.3-1.41-.52-.43-.22-.79-.5-1.08-.84s-.44-.78-.44-1.31c0-.44.1-.83.3-1.16.2-.33.46-.62.8-.85.34-.23.75-.41 1.22-.53.47-.12.98-.18 1.53-.18.58 0 1.1.04 1.54.13.44.08.83.19 1.15.3s.61.25.84.4c.23.15.43.28.6.4l-.98 1.59c-.18-.11-.38-.22-.62-.33s-.48-.22-.73-.31c-.26-.1-.52-.17-.8-.23s-.56-.09-.83-.09c-.5 0-.91.07-1.22.2-.31.13-.46.33-.46.61 0 .21.15.39.44.52.29.13.65.25 1.08.37.43.11.9.24 1.41.37.51.13.98.3 1.41.51.43.21.79.48 1.08.81.29.33.44.76.44 1.29 0 .91-.33 1.62-.99 2.14-.66.52-1.64.78-2.94.78-1.03 0-1.91-.15-2.66-.46-.75-.3-1.34-.66-1.8-1.06l1.07-1.68a5.888 5.888 0 0 0 1.49.88c.32.13.67.24 1.03.33.36.09.72.13 1.08.13.38 0 .71-.07.98-.2s.41-.35.41-.66ZM94.91 15V9.53c0-.36-.02-.65-.07-.87-.05-.22-.11-.39-.19-.52-.08-.12-.17-.21-.29-.25a1.03 1.03 0 0 0-.35-.06c-.2 0-.39.07-.56.2-.17.13-.29.3-.35.5v6.48h-2.15V6.05h1.7l.25.98h.05c.18-.35.44-.63.79-.85.35-.22.75-.33 1.22-.33.39 0 .77.1 1.13.29.36.19.6.52.73 1 .18-.42.45-.74.82-.96.37-.22.77-.33 1.2-.33.32 0 .61.04.87.13s.48.25.67.47.34.53.44.92c.1.39.15.89.15 1.49v6.12h-2.15V9.26c0-.54-.09-.91-.26-1.13-.17-.21-.38-.32-.63-.32-.21 0-.4.05-.55.15-.16.1-.26.27-.32.49v6.53h-2.15ZM102.39 13.03h3.15V8.02h-3.15V6.05h5.47v6.98h3.31V15h-8.78v-1.97Zm2.72-9.41c0-.37.14-.69.41-.95s.66-.39 1.14-.39.9.13 1.2.39c.3.26.45.58.45.95s-.15.69-.45.94c-.3.24-.7.37-1.2.37s-.87-.12-1.14-.37c-.27-.24-.41-.56-.41-.94ZM114.14 8.02h-1.77V6.05h1.77V4.01l2.33-.66v2.7h4.69v1.97h-4.69v2.56c0 .92.17 1.58.52 1.99.35.41.83.62 1.45.62.32 0 .61-.04.88-.12.26-.08.5-.18.71-.3.21-.12.4-.25.57-.39.17-.14.33-.27.47-.39l1.07 1.61c-.2.24-.46.46-.76.65-.3.2-.63.37-.98.52-.35.15-.72.27-1.1.35s-.76.13-1.13.13c-1.34 0-2.34-.37-3.01-1.12-.67-.75-1.01-1.93-1.01-3.55V8.02ZM122.8 2.48h3.61v4.58h.07c.29-.38.67-.69 1.15-.91.48-.23 1.04-.34 1.68-.34.45 0 .87.06 1.25.18s.71.32.98.59.49.65.64 1.12c.16.47.23 1.05.23 1.74V15h-2.33V9.92c0-.73-.16-1.25-.46-1.57-.31-.32-.72-.48-1.22-.48-.44 0-.85.13-1.22.4s-.63.61-.79 1.03v5.71h-2.33V4.44h-1.29V2.47Z"
              className="cls-2"
          />
          <circle
              cx={12.15}
              cy={6.82}
              r={6.82}
              style={{
                fill: "#8e4ec6",
              }}
          />
          <circle
              cx={16.7}
              cy={11.93}
              r={6.82}
              style={{
                fill: "#30a46c",
              }}
          />
          <circle
              cx={6.82}
              cy={11.93}
              r={6.82}
              style={{
                fill: "#0090ff",
              }}
          />
        </g>
      </svg>
  );
});
