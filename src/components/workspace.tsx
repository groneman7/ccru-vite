type WorkspaceProps = {
    children: React.ReactNode;
};
export function Workspace({ children }: WorkspaceProps) {
    return <div className="flex-1 flex flex-col gap-2 p-2">{children}</div>;
}

type WorkspaceContentProps = {
    children: React.ReactNode;
};
export function WorkspaceContent({ children }: WorkspaceContentProps) {
    return <div className="flex-1 flex flex-col gap-4 p-4">{children}</div>;
}

type WorkspaceHeaderProps = {
    children: React.ReactNode;
};
export function WorkspaceHeader({ children }: WorkspaceHeaderProps) {
    return <div className="flex gap-4 items-center justify-start">{children}</div>;
}

type WorkspaceNavProps = {
    children: React.ReactNode;
};
export function WorkspaceNav({ children }: WorkspaceNavProps) {
    return <div className="flex gap-1 items-center">{children}</div>;
}
