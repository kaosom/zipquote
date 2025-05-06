import { JSX } from "solid-js";

export function Field(props: {
  label: string;
  children: JSX.Element;
  class?: string;
}) {
  return (
    <label class={`flex flex-col gap-1 ${props.class ?? ""}`}>
      <span class="text-sm font-medium text-gray-600 dark:text-gray-300">
        {props.label}
      </span>
      {props.children}
    </label>
  );
}

export function TextInput(props: JSX.InputHTMLAttributes<HTMLInputElement>) {
  const { class: className, ...rest } = props;

  return (
    <input
      {...rest}
      class={`input ${className ?? ""}`}
      inputMode={props.type === "number" ? "decimal" : undefined} // <- ayuda móviles
      pattern={props.type === "number" ? "[0-9]*" : undefined} // <- ayuda html
    />
  );
}

export function TextArea(
  props: JSX.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  const { class: className, ...rest } = props;

  return (
    <textarea rows={2} {...rest} class={`input resize-y ${className ?? ""}`} />
  );
}

export function IconButton(props: {
  icon: JSX.Element;
  onClick: () => void;
  title?: string;
  intent?: "danger" | "neutral";
}) {
  return (
    <button
      type="button"
      title={props.title}
      class={`btn-outline p-2 ${
        props.intent === "danger"
          ? "text-red-500 border-red-300 hover:bg-red-50"
          : ""
      }`}
      onClick={props.onClick}
    >
      {props.icon}
    </button>
  );
}

export function TextButton(props: {
  children: JSX.Element;
  primary?: boolean;
  onClick?: () => void;
}) {
  const cls = props.primary ? "btn-primary" : "btn-outline";

  return (
    <button class={cls} onClick={props.onClick} type="button">
      {props.children}
    </button>
  );
}
