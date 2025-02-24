const ContributionGrid = ({
  contributions,
}: {
  contributions: { date: string; count: number }[];
}) => {
  return (
    <div className="grid grid-cols-7 gap-1 mt-4">
      {contributions.slice(-42).map((contribution, index) => {
        const level =
          contribution.count > 20
            ? "bg-green-700"
            : contribution.count > 10
            ? "bg-green-500"
            : contribution.count > 5
            ? "bg-green-300"
            : contribution.count > 0
            ? "bg-green-100"
            : "bg-gray-200";

        return (
          <div
            key={index}
            className={`w-4 h-4 rounded-sm ${level}`}
            title={`${contribution.date}: ${contribution.count} commits`}
          ></div>
        );
      })}
    </div>
  );
};

export default ContributionGrid;
