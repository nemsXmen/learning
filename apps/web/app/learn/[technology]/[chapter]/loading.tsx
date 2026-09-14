import { Skeleton, SkeletonRegion } from '@app/ui';

/**
 * Shaped like the chapter it stands in for. Without it the route fell back to
 * the technology page's skeleton, a list of cards, before the text replaced it.
 */
export default function ChapterLoading() {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col xl:flex-row xl:gap-10">
      <div className="hidden w-72 shrink-0 flex-col gap-3 border-r border-border px-4 py-12 xl:flex">
        <Skeleton width="6rem" height="0.8rem" />
        <Skeleton width="10rem" height="1rem" className="mb-2 mt-4" />
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} height="2.25rem" rounded="control" />
        ))}
      </div>

      <div className="min-w-0 flex-1 px-5 pb-8 pt-8 sm:px-8 lg:pb-12 lg:pt-12">
        <SkeletonRegion label="Chargement du chapitre">
          <div className="mx-auto flex max-w-[46rem] flex-col gap-4">
            <Skeleton width="14rem" height="0.8rem" className="max-w-full" />
            <Skeleton width="70%" height="2.25rem" rounded="control" />
            <Skeleton width="16rem" height="0.375rem" className="max-w-full" />
            <div className="mt-6 flex flex-col gap-3">
              {[100, 96, 88, 100, 92, 60].map((width, index) => (
                <Skeleton key={index} width={`${width}%`} height="0.9rem" />
              ))}
            </div>
          </div>
        </SkeletonRegion>
      </div>
    </div>
  );
}
