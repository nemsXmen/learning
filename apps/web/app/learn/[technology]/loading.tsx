import { Card, Skeleton, SkeletonRegion } from '@app/ui';

export default function TechnologyLoading() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <Skeleton width="10rem" height="0.8rem" />
      <div className="mb-10 mt-6 flex flex-col gap-3">
        <Skeleton width="14rem" height="2rem" rounded="control" />
        <Skeleton width="28rem" height="0.9rem" />
      </div>
      <SkeletonRegion label="Chargement du parcours">
        <Card className="flex flex-col gap-4">
          <Skeleton width="6rem" height="0.7rem" />
          <div className="flex gap-4">
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} width="100%" height="2rem" rounded="control" />
            ))}
          </div>
        </Card>
        <div className="mt-10 flex flex-col gap-3">
          {[0, 1, 2].map((index) => (
            <Card key={index} className="p-4">
              <Skeleton width="100%" height="1rem" />
            </Card>
          ))}
        </div>
      </SkeletonRegion>
    </div>
  );
}
