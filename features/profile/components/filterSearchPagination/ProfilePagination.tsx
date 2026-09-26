    "use client";

    import Pagination from "@/features/shared/components/Pagination";
    import { useProfileParams } from "../../utils/useProfileParams";

    export default function ProfilePagination({ total }: { total: number }) {
        const { page, setPage, pageSize } = useProfileParams();

        return (
            <Pagination
                currentPage={page}
                pageSize={pageSize}
                total={total}
                onPageChange={setPage}
                itemLabel="members"
            />
        );
    }