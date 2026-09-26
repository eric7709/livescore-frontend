import TeamHeader from "@/features/team/user/components/shared/TeamHeader";

interface LayoutProps {
    children: React.ReactNode;
    params: Promise<{ teamId: string }>;
}

export default async function Layout({ children, params }: LayoutProps) {
    const { teamId } = await params;

    return (
        <div className="w-full px-4 ">
            <TeamHeader teamId={Number(teamId)} />
            {children}
        </div>
    );
}