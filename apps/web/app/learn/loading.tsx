import { Card, Skeleton, SkeletonRegion } from '@app/ui';

/** Skeletons match the final card metrics so nothing shifts when data lands. */
export default function LearnLoading() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <div className="mb-8 flex flex-col gap-3">
        <Skeleton width="12rem" height="1.75rem" rounded="control" />
        <Skeleton width="24rem" height="0.9rem" />
      </div>
      <SkeletonRegion label="Chargement des parcours">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <Card key={index} className="flex flex-col gap-4">
              <Skeleton width="7rem" height="1.1rem" rounded="control" />
              <Skeleton width="100%" height="0.8rem" />
              <Skeleton width="80%" height="0.8rem" />
              <Skeleton height="0.375rem" />
              <Skeleton width="60%" height="0.8rem" />
              <Skeleton height="2.75rem" rounded="control" />
            </Card>
          ))}
        </div>
      </SkeletonRegion>
    </div>
  );
}
