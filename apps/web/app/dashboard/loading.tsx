import { Card, Skeleton, SkeletonRegion } from '@app/ui';

/** Matches the dashboard's first screen so nothing shifts when the data lands. */
export default function DashboardLoading() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-5 py-10 sm:px-8">
      <SkeletonRegion label="Chargement du tableau de bord">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex min-w-0 flex-col gap-3">
              <Skeleton width="14rem" height="2rem" rounded="control" className="max-w-full" />
              <Skeleton width="24rem" height="0.9rem" className="max-w-full" />
            </div>
            <Skeleton width="4rem" height="4rem" />
          </div>

          <Card className="flex flex-col gap-4">
            <Skeleton width="10rem" height="0.7rem" />
            <Skeleton width="18rem" height="1.4rem" rounded="control" className="max-w-full" />
            <Skeleton width="80%" height="0.9rem" />
            <Skeleton width="8rem" height="2.75rem" rounded="control" />
          </Card>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {[0, 1].map((index) => (
              <Card key={index} className="flex flex-col gap-3">
                <Skeleton width="7rem" height="0.7rem" />
                <Skeleton width="60%" height="1rem" />
                <Skeleton height="0.375rem" />
              </Card>
            ))}
          </div>
        </div>
      </SkeletonRegion>
    </div>
  );
}
