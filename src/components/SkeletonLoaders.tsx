
// Common shimmer utility class
const shimmerClass = "premium-shimmer rounded-lg";

export const PlanCardSkeleton = () => (
  <div className="bg-surface border border-gray-800 shadow-lg rounded-2xl p-5 relative overflow-hidden flex flex-col w-full h-[220px]">
    <div className="absolute top-0 left-0 w-[3px] h-full bg-slate-700" />
    <div className="flex justify-between items-center mb-5 shrink-0">
      {/* "Scheduled Plan" title placeholder */}
      <div className={`w-32 h-4 ${shimmerClass}`} />
      {/* Dropdown select box placeholder */}
      <div className={`w-20 h-8 rounded-lg premium-shimmer`} />
    </div>
    
    {/* Workout Title placeholder */}
    <div className={`w-48 h-6 mb-5 shrink-0 ${shimmerClass}`} />
    
    {/* Exercises rows */}
    <div className="space-y-3 mb-5 flex-1 overflow-hidden">
      <div className="flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full premium-shimmer shrink-0" />
        <div className={`w-36 h-3 ${shimmerClass}`} />
      </div>
      <div className="flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full premium-shimmer shrink-0" />
        <div className={`w-44 h-3 ${shimmerClass}`} />
      </div>
    </div>
    
    {/* "Start Workout" button placeholder */}
    <div className={`w-full h-12 ${shimmerClass} rounded-xl shrink-0`} />
  </div>
);

export const NutritionCardSkeleton = () => (
  <div className="bg-surface border border-gray-800 shadow-lg rounded-2xl p-4 flex flex-col justify-between w-full h-[210px] relative overflow-hidden">
    <div className="flex items-center gap-2 mb-4 shrink-0">
      <div className={`w-4 h-4 rounded-full premium-shimmer`} />
      <div className={`w-16 h-3.5 ${shimmerClass}`} />
    </div>
    <div className="flex flex-col gap-3.5 flex-1 justify-center">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <div className={`w-14 h-3 ${shimmerClass}`} />
            <div className={`w-16 h-3 ${shimmerClass}`} />
          </div>
          <div className="w-full h-1.5 bg-gray-900/60 rounded-full overflow-hidden relative">
            <div className="w-1/3 h-full premium-shimmer absolute left-0 top-0 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const HydrationCardSkeleton = () => (
  <div className="bg-surface border border-gray-800 shadow-lg rounded-2xl flex flex-col overflow-hidden justify-between w-full h-[210px] p-4 relative overflow-hidden">
    <div className="flex items-center gap-2 mb-4 shrink-0">
      <div className={`w-4 h-4 rounded-full premium-shimmer`} />
      <div className={`w-16 h-3.5 ${shimmerClass}`} />
    </div>
    <div className="flex flex-col items-center justify-center flex-1 py-1">
      {/* Current/Target Water text placeholder */}
      <div className={`w-24 h-7 mb-4 ${shimmerClass}`} />
      {/* "Log Water" button placeholder */}
      <div className={`w-full h-11 ${shimmerClass} rounded-xl`} />
      {/* "Last logged" timestamp placeholder */}
      <div className={`w-28 h-3 mt-3.5 ${shimmerClass}`} />
    </div>
  </div>
);

export const InBodyCardSkeleton = () => (
  <div className="bg-surface border border-gray-800 shadow-lg rounded-2xl p-4 w-full h-[116px] flex flex-col justify-between relative overflow-hidden">
    <div className={`w-36 h-3.5 mb-3.5 ${shimmerClass}`} />
    <div className="grid grid-cols-4 gap-2 text-center flex-1">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-gray-900/30 border border-gray-800/80 p-2 rounded-xl flex flex-col justify-between items-center relative overflow-hidden h-[54px]">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-slate-800" />
          <div className={`w-9 h-4 ${shimmerClass}`} />
          <div className={`w-10 h-2.5 mt-1.5 ${shimmerClass}`} />
        </div>
      ))}
    </div>
  </div>
);

export const MealItemSkeleton = () => (
  <div className="bg-surface border border-gray-800 shadow-lg rounded-xl p-4 flex flex-col w-full h-[96px] justify-between relative overflow-hidden">
    <div className="flex justify-between items-center mb-2">
      <div className={`w-32 h-4 ${shimmerClass}`} />
      <div className={`w-16 h-4 ${shimmerClass}`} />
    </div>
    <div className="flex gap-4 mb-2">
      <div className={`w-12 h-3 ${shimmerClass}`} />
      <div className={`w-12 h-3 ${shimmerClass}`} />
      <div className={`w-12 h-3 ${shimmerClass}`} />
    </div>
    <div className={`w-full h-2 rounded-full premium-shimmer mt-2`} />
  </div>
);

export const WorkoutButtonSkeleton = () => (
  <div className="w-full h-[88px] bg-surface border border-gray-800 rounded-3xl p-5 flex items-center gap-4 relative overflow-hidden shadow-lg">
    <div className="w-11 h-11 rounded-full premium-shimmer shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="w-44 h-4 rounded-full premium-shimmer" />
      <div className="w-28 h-3 rounded-full premium-shimmer" />
    </div>
  </div>
);

export const WorkoutTemplatesSkeleton = () => (
  <div className="w-full h-[60px] bg-surface border border-gray-800 rounded-2xl px-5 flex items-center justify-between relative overflow-hidden shadow-md">
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 rounded-md premium-shimmer shrink-0" />
      <div className="w-48 h-4 rounded-full premium-shimmer" />
    </div>
    <div className="w-4 h-4 rounded-full premium-shimmer shrink-0" />
  </div>
);

export const PastSessionItemSkeleton = () => (
  <div className="w-full h-[76px] bg-surface border border-gray-800 rounded-2xl p-4 flex items-center justify-between relative overflow-hidden shadow-md">
    <div className="space-y-2 flex-1">
      <div className="w-20 h-3 rounded-full premium-shimmer" />
      <div className="flex items-center gap-3">
        <div className="w-14 h-5 rounded-lg premium-shimmer" />
        <div className="w-16 h-3.5 rounded-full premium-shimmer" />
        <div className="w-12 h-3.5 rounded-full premium-shimmer" />
      </div>
    </div>
    <div className="w-8 h-8 rounded-full premium-shimmer shrink-0" />
  </div>
);

export const ScanCardSkeleton = () => (
  <div className="w-full bg-surface border border-gray-800 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between h-[116px] shadow-lg">
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <div className="w-40 h-5 rounded-md premium-shimmer mb-4" />
        <div className="flex gap-6 mt-1">
          <div>
            <div className="w-10 h-2.5 rounded-full premium-shimmer mb-1.5" />
            <div className="w-14 h-4 rounded-md premium-shimmer" />
          </div>
          <div>
            <div className="w-10 h-2.5 rounded-full premium-shimmer mb-1.5" />
            <div className="w-14 h-4 rounded-md premium-shimmer" />
          </div>
          <div>
            <div className="w-10 h-2.5 rounded-full premium-shimmer mb-1.5" />
            <div className="w-14 h-4 rounded-md premium-shimmer" />
          </div>
        </div>
      </div>
      <div className="w-9 h-9 rounded-full premium-shimmer shrink-0 mt-0.5" />
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="p-5 flex flex-col gap-6 min-h-full pb-28 text-gray-200 relative overflow-hidden">
    {/* Title Section */}
    <div className="space-y-2">
      <div className="w-36 h-6 rounded-md premium-shimmer" />
      <div className="w-56 h-3.5 rounded-full premium-shimmer" />
    </div>

    {/* Dossier Card */}
    <div className="bg-surface border border-gray-800 rounded-3xl p-5 shadow-lg flex items-center gap-4 relative overflow-hidden">
      <div className="w-16 h-16 rounded-2xl premium-shimmer shrink-0" />
      <div className="space-y-2 flex-1">
        <div className="w-20 h-3 rounded-full premium-shimmer" />
        <div className="w-36 h-5 rounded-md premium-shimmer" />
        <div className="w-28 h-3 rounded-full premium-shimmer" />
      </div>
    </div>

    {/* Subscription Card */}
    <div className="bg-surface border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4 relative overflow-hidden">
      <div className="w-36 h-4 rounded-full premium-shimmer" />
      <div className="flex items-baseline gap-2">
        <div className="w-12 h-10 rounded-lg premium-shimmer" />
        <div className="w-24 h-4 rounded-full premium-shimmer" />
      </div>
      <div className="w-40 h-3.5 rounded-full premium-shimmer" />
      <div className="pt-4 border-t border-gray-800 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl premium-shimmer shrink-0" />
        <div className="space-y-1.5 flex-1">
          <div className="w-28 h-4 rounded-md premium-shimmer" />
          <div className="w-32 h-3 rounded-full premium-shimmer" />
        </div>
      </div>
      <div className="w-full h-11 rounded-2xl premium-shimmer" />
    </div>

    {/* Password Security Card */}
    <div className="bg-surface border border-gray-800 rounded-3xl p-6 shadow-lg space-y-5 relative overflow-hidden">
      <div className="w-36 h-4 rounded-full premium-shimmer pb-2 border-b border-gray-800" />
      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="w-20 h-3 rounded-full premium-shimmer" />
          <div className="w-full h-11 rounded-xl premium-shimmer" />
        </div>
        <div className="space-y-1.5">
          <div className="w-20 h-3 rounded-full premium-shimmer" />
          <div className="w-full h-11 rounded-xl premium-shimmer" />
        </div>
        <div className="w-full h-11 rounded-2xl premium-shimmer" />
      </div>
    </div>
  </div>
);

export const CoachRosterSkeleton = () => (
  <div className="space-y-4 w-full relative overflow-hidden">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="bg-surface border border-gray-800 rounded-2xl p-4 flex justify-between items-center relative overflow-hidden shadow-md">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-10 h-10 rounded-full premium-shimmer shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <div className="w-28 h-4 rounded-md premium-shimmer" />
              <div className="w-12 h-4 rounded-md premium-shimmer" />
            </div>
            <div className="w-20 h-3 rounded-full premium-shimmer" />
          </div>
        </div>
        <div className="text-right space-y-1.5">
          <div className="w-12 h-3 rounded-full premium-shimmer ml-auto" />
          <div className="w-14 h-4 rounded-md premium-shimmer ml-auto" />
        </div>
      </div>
    ))}
  </div>
);

export const CoachDashboardSkeleton = ({ currentView }: { currentView: string }) => {
  if (currentView === 'roster') {
    return <CoachRosterSkeleton />;
  }
  
  if (currentView === 'deploy' || currentView === 'settings') {
    return (
      <div className="space-y-5 w-full relative overflow-hidden p-1">
        <div className="bg-surface border border-gray-800 rounded-3xl p-5 shadow-lg space-y-4">
          <div className="w-36 h-4 rounded-full premium-shimmer" />
          <div className="w-full h-11 rounded-xl premium-shimmer" />
          <div className="w-full h-11 rounded-xl premium-shimmer" />
          <div className="w-full h-12 rounded-2xl premium-shimmer" />
        </div>
      </div>
    );
  }

  // default 'home' view
  return (
    <div className="space-y-6 w-full relative overflow-hidden p-1">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-surface border border-gray-800 rounded-2xl p-3 h-[72px] flex flex-col justify-between relative overflow-hidden">
          <div className="w-14 h-2.5 rounded-full premium-shimmer" />
          <div className="w-8 h-4 rounded-md premium-shimmer mt-2" />
        </div>
        <div className="bg-surface border border-gray-800 rounded-2xl p-3 h-[72px] flex flex-col justify-between relative overflow-hidden">
          <div className="w-14 h-2.5 rounded-full premium-shimmer" />
          <div className="w-8 h-4 rounded-md premium-shimmer mt-2" />
        </div>
        <div className="bg-surface border border-gray-800 rounded-2xl p-3 h-[72px] flex flex-col justify-between relative overflow-hidden">
          <div className="w-14 h-2.5 rounded-full premium-shimmer" />
          <div className="w-8 h-4 rounded-md premium-shimmer mt-2" />
        </div>
      </div>
      
      {/* Activity Feed placeholder list */}
      <div className="space-y-3">
        <div className="w-32 h-4 rounded-full premium-shimmer mb-4" />
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-surface border border-gray-800 rounded-2xl p-4 flex gap-3 relative overflow-hidden shadow-sm h-[88px] justify-between">
            <div className="flex gap-3 items-center flex-1">
              <div className="w-10 h-10 rounded-full premium-shimmer shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="w-24 h-4 rounded-md premium-shimmer" />
                <div className="w-36 h-3 rounded-full premium-shimmer" />
              </div>
            </div>
            <div className="w-8 h-8 rounded-full premium-shimmer shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};

