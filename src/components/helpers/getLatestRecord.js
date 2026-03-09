export const getLatestRecord = (records, subrecord) => {
  return records
    ?.flatMap((v) => v[subrecord] || [])
    ?.reduce(
      (latest, current) =>
        !latest || new Date(current.created_at) > new Date(latest.created_at)
          ? current
          : latest,
      null,
    );
};
