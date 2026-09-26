import FixtureOrMatchCard from "../matchCard/FixtureResultCard";

export default function FixtureResultList() {
    return (
        <div>
            <div className="">
                <p>All</p>
                <p>Fixtures</p>
                <p>Results</p>
            </div>
            <div className="">
                {[1, 1, 2, 1, 1, 1, 1].map(() => (
                    <div className="">
                        <FixtureOrMatchCard />
                    </div>
                ))}
            </div>
        </div>
    )
}
