import type { Component } from "solid-js";

interface IconCloseProps {
  size?: number;
  class?: string;
}

export const IconClose: Component<IconCloseProps> = (props) => {
  const size = () => props.size ?? 12;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      width={size()}
      height={size()}
      class={props.class}
    >
      <title>Close</title>
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M6 18 18 6M6 6l12 12"
      />
    </svg>
  );
};
