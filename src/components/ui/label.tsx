export function Label({ children, htmlFor }: React.ComponentProps<"label">) {
    return (
        <span>
            <label
                className="text-sm font-semibold"
                htmlFor={htmlFor}>
                {children}
            </label>
        </span>
    );
}
